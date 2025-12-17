import React from 'react';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { TextMessage } from '@/types/text-message';
import type { Attachment } from 'fhir/r4';

import type { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import AttachmentHtml from './attachmenthtml';

import { newAttachmentAsync, removeAttachmentAsync } from '@/actions/newValue';
import { useAttachmentContext } from '@/context/attachment/useAttachmentContext';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getMaxOccursExtensionValue, getMinOccursExtensionValue } from '@/util/extension';
import { isRequired, getId, isRepeat } from '@/util/index';

export type Props = QuestionnaireComponentItemProps & {
  children?: React.ReactNode;
};

export const AttachmentComponent = (props: Props): React.JSX.Element | null => {
  const { path, id, idWithLinkIdAndItemIndex, linkId, children } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const [customErrorMessage, setCustomErrorMessage] = React.useState<TextMessage | undefined>(undefined);
  const {
    onOpenAttachment,
    onRequestAttachmentLink,
    attachmentMaxFileSize,
    attachmentMaxFileSizePerFile,
    attachmentValidTypes,
    attachmentErrorMessage,
    onDeleteAttachment,
    uploadAttachment,
  } = useAttachmentContext();
  const dispatch = useAppDispatch();

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
    if (onDeleteAttachment && item && fileId) {
      const onSuccess = (): void => {
        if (dispatch) {
          const attachment: Attachment = { id: fileId };
          if (path)
            dispatch(removeAttachmentAsync(path, attachment, item))?.then(
              newState => onAnswerChange && onAnswerChange(newState, item, { valueAttachment: { id: fileId } })
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
        customErrorMessage={customErrorMessage}
        onRequestAttachmentLink={onRequestAttachmentLink}
        maxFiles={getMaxOccursExtensionValue(item)}
        minFiles={getMinOccursExtensionValue(item)}
        attachmentMaxFileSize={attachmentMaxFileSize}
        attachmentMaxFileSizePerFile={attachmentMaxFileSizePerFile}
        attachmentValidTypes={attachmentValidTypes}
        item={item}
        attachmentErrorMessage={attachmentErrorMessage}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
      />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </>
  );
};

export default AttachmentComponent;
