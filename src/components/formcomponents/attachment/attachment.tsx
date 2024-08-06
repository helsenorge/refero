import React from 'react';

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
import { RenderChildrenItems, RenderItemProps } from '../renderChildren/RenderChildrenItems';

export type Props = RenderItemProps & {
  children?: React.ReactNode;
};
type UploadedFile = {
  name: string;
  id: string;
};
export const AttachmentComponent = (props: Props): JSX.Element | null => {
  const {
    uploadAttachment,
    path,
    item,
    onAnswerChange,
    onDeleteAttachment,
    pdf,
    id,
    resources,
    onOpenAttachment,
    children,
    onRequestAttachmentLink,
    attachmentMaxFileSize,
    attachmentValidTypes,
    attachmentErrorMessage,
    responseItem,
  } = props;

  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const enable = useIsEnabled(item, path);
  const answer = useGetAnswer(responseItem, item);
  const onUpload = (files: UploadFile[]): void => {
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (attachment: Attachment): void => {
          if (onAnswerChange && attachment && path) {
            dispatch(newAttachmentAsync(path, attachment, item, isRepeat(item)))?.then(newState =>
              onAnswerChange(newState, path, item, { valueAttachment: attachment })
            );
          }
        };

        uploadAttachment([file], onSuccess);
      }
    }
  };

  const onDelete = (fileId: string): void => {
    if (onDeleteAttachment) {
      const onSuccess = (): void => {
        if (dispatch) {
          const attachment: Attachment = { url: fileId };
          if (path)
            dispatch(removeAttachmentAsync(path, attachment, item))?.then(
              newState => onAnswerChange && onAnswerChange(newState, path, item, { valueAttachment: attachment })
            );
        }
      };

      onDeleteAttachment(fileId, onSuccess);
    }
  };

  const getButtonText = (): string => {
    let buttonText = '';
    if (resources && resources.uploadButtonText) {
      buttonText = resources.uploadButtonText;
    }
    return buttonText;
  };

  const getAttachment = (): UploadedFile[] => {
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
    return [];
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
          onRequestAttachmentLink={onRequestAttachmentLink}
          maxFiles={getMaxOccursExtensionValue(item)}
          minFiles={getMinOccursExtensionValue(item)}
          attachmentMaxFileSize={attachmentMaxFileSize}
          attachmentValidTypes={attachmentValidTypes}
          item={item}
          attachmentErrorMessage={attachmentErrorMessage}
          idWithLinkIdAndItemIndex={props.idWithLinkIdAndItemIndex}
        >
          {children}
        </AttachmentHtml>
        <RenderChildrenItems otherProps={props} />
      </>
    );
  }
};

export default AttachmentComponent;
