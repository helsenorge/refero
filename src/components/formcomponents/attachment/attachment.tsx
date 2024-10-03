import React, { useState } from 'react';

import { Attachment, QuestionnaireItem } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import AttachmentHtml from './attachmenthtml';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '@/util/extension';
import { isRequired, getId, isRepeat } from '@/util/index';
import { useDispatch, useSelector } from 'react-redux';
import { useAttachmentContext } from '@/context/AttachmentContext';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { TextMessage } from '@/types/text-message';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';

export type Props = QuestionnaireComponentItemProps & {
  children?: React.ReactNode;
};

export const AttachmentComponent = (props: Props): JSX.Element | null => {
  const { path, id, linkId, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const [customErrorMessage, setCustomErrorMessage] = useState<TextMessage | undefined>(undefined);
  const {
    onOpenAttachment,
    onRequestAttachmentLink,
    attachmentMaxFileSize,
    attachmentValidTypes,
    attachmentErrorMessage,
    onDeleteAttachment,
    uploadAttachment,
  } = useAttachmentContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();

  const { globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const onUpload = (files: UploadFile[]): void => {
    if (uploadAttachment && item) {
      for (const file of files) {
        const onSuccess = (attachment: Attachment): void => {
          if (onAnswerChange && attachment && path) {
            dispatch(newAttachmentAsync(path, attachment, item, isRepeat(item)))?.then(newState =>
              onAnswerChange(newState, item, { valueAttachment: attachment })
            );
          }
        };
        const onError = (errormessage: TextMessage | null): void => {
          if (errormessage) {
            setCustomErrorMessage(errormessage);
          }
        };
        uploadAttachment([file], onSuccess, onError);
      }
    }
  };

  const onDelete = (fileId: string): void => {
    if (onDeleteAttachment && item) {
      const onSuccess = (): void => {
        if (dispatch) {
          const attachment: Attachment = { url: fileId };
          if (path)
            dispatch(removeAttachmentAsync(path, attachment, item))?.then(
              newState => onAnswerChange && onAnswerChange(newState, item, { valueAttachment: attachment })
            );
        }
      };
      const onError = (errormessage: TextMessage | null): void => {
        if (errormessage) {
          setCustomErrorMessage(errormessage);
        }
      };
      onDeleteAttachment(fileId, onSuccess, onError);
    }
  };

  const getButtonText = (): string => {
    let buttonText = '';
    if (resources && resources.uploadButtonText) {
      buttonText = resources.uploadButtonText;
    }
    return buttonText;
  };

  return (
    <>
      <AttachmentHtml
        {...props}
        onUpload={onUpload}
        onDelete={onDelete}
        onOpen={onOpenAttachment}
        id={getId(id)}
        uploadButtonText={getButtonText()}
        resources={resources}
        isRequired={isRequired(item)}
        multiple={isRepeat(item)}
        errorText={getValidationTextExtension(item)}
        customErrorMessage={customErrorMessage}
        onRequestAttachmentLink={onRequestAttachmentLink}
        maxFiles={getMaxOccursExtensionValue(item)}
        minFiles={getMinOccursExtensionValue(item)}
        attachmentMaxFileSize={attachmentMaxFileSize}
        attachmentValidTypes={attachmentValidTypes}
        item={item}
        attachmentErrorMessage={attachmentErrorMessage}
        idWithLinkIdAndItemIndex={props.idWithLinkIdAndItemIndex}
      />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </>
  );
};

export default AttachmentComponent;
