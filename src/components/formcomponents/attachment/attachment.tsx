import React, { useState } from 'react';

import { Attachment } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import AttachmentHtml from './attachmenthtml';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '@/util/extension';
import { isRequired, getId, isReadOnly, isRepeat } from '@/util/index';
import TextView from '../textview';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import { useAttachmentContext } from '@/context/AttachmentContext';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { TextMessage } from '@/types/text-message';

export type Props = QuestionnaireComponentItemProps & {
  children?: React.ReactNode;
};
type UploadedFile = {
  name: string;
  id: string;
};
export const AttachmentComponent = (props: Props): JSX.Element | null => {
  const { path, item, pdf, id, resources, responseItem, children } = props;
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
  const enable = useIsEnabled(item, path);
  const answer = useGetAnswer(responseItem, item);

  const { onAnswerChange } = useExternalRenderContext();

  const onUpload = (files: UploadFile[]): void => {
    console.log('onUploadAttachment', uploadAttachment);
    if (uploadAttachment) {
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
    console.log('onDeleteAttachment', onDeleteAttachment);
    if (onDeleteAttachment) {
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

  const getAttachment = (): UploadedFile[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(v => {
        return {
          id: v.valueAttachment?.url ?? '-1',
          name: v.valueAttachment && v.valueAttachment.title ? v.valueAttachment.title : '',
        };
      });
    } else {
      if (answer && answer.valueAttachment && answer.valueAttachment.url) {
        return [
          {
            id: answer.valueAttachment.url,
            name: answer.valueAttachment.title ? answer.valueAttachment.title : '',
          },
        ];
      }
    }
    return undefined;
  };

  const getPdfValue = (): string => {
    const attachments = getAttachment();
    if (attachments) {
      return attachments.map(v => v.name).join(', ');
    } else if (resources) {
      return resources.ikkeBesvart;
    }

    return '';
  };

  if (!enable) {
    return null;
  }
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPdfValue()}>
        {children}
      </TextView>
    );
  } else {
    return (
      <>
        <AttachmentHtml
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
  }
};

export default AttachmentComponent;
