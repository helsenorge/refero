import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Attachment, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect, useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';
import { TextMessage } from '../../../types/text-message';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import AttachmentHtml from './attachmenthtml';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getFormDefinition } from '../../../store/selectors';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { isRequired, getId, isReadOnly, isRepeat, getSublabelText } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';

export interface AttachmentProps extends WithFormComponentsProps {
  path: Array<Path>;
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  pdf?: boolean;
  id?: string;
  resources?: Resources;
  renderDeleteButton: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  uploadAttachment?: (
    files: File[],
    onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void,
    onError: (errorMessage: TextMessage | null) => void
  ) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errorMessage: TextMessage | null) => void) => void;
  onOpenAttachment?: (fileId: string) => void;
  onRequestAttachmentLink?: (file: string) => string;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const AttachmentComponent = ({
  uploadAttachment,
  path,
  item,
  onAnswerChange,
  onDeleteAttachment,
  resources,
  answer,
  pdf,
  id,
  onOpenAttachment,
  onRenderMarkdown,
  onRequestAttachmentLink,
  renderHelpButton,
  renderHelpElement,
  children,
  attachmentErrorMessage,
  attachmentMaxFileSize,
  attachmentValidTypes,
  ...other
}: AttachmentProps): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const questionnaire = useSelector<GlobalState, Questionnaire | undefined | null>(state => getFormDefinition(state)?.Content);
  const onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void): void => {
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment): void => {
          if (attachment) {
            dispatch(newAttachmentAsync(path, attachment, item, isRepeat(item)))?.then(newState =>
              onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer)
            );
          }

          cb(true, null, uploadedFile);
        };

        const onError = (errorMessage: TextMessage | null): void => {
          cb(false, errorMessage);
        };

        uploadAttachment([file], onSuccess, onError);
      }
    }
  };

  const onDelete = (fileId: string, cb: (success: boolean, errormessage: TextMessage | null) => void): void => {
    if (onDeleteAttachment) {
      const onSuccess = (): void => {
        const attachment = { url: fileId } as Attachment;
        dispatch(removeAttachmentAsync(path, attachment, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer)
        );

        cb(true, null);
      };

      const onError = (errormessage: TextMessage | null): void => {
        cb(false, errormessage);
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

  const getAttachment = (): UploadedFile[] => {
    if (Array.isArray(answer)) {
      return answer.map(v => {
        return {
          id: v.valueAttachment && v.valueAttachment.url ? v.valueAttachment.url : '-1',
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

  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPdfValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
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
          label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
          subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
          uploadButtonText={getButtonText()}
          resources={resources}
          isRequired={isRequired(item)}
          multiple={isRepeat(item)}
          errorText={getValidationTextExtension(item)}
          uploadedFiles={getAttachment()}
          onRequestAttachmentLink={onRequestAttachmentLink}
          helpButton={renderHelpButton()}
          helpElement={renderHelpElement()}
          maxFiles={getMaxOccursExtensionValue(item)}
          minFiles={getMinOccursExtensionValue(item)}
          attachmentMaxFileSize={attachmentMaxFileSize}
          attachmentValidTypes={attachmentValidTypes}
          item={item}
          attachmentErrorMessage={attachmentErrorMessage}
          {...other}
        />
      </>
    );
  }
};

const withCommonFunctionsComponent = withCommonFunctions(AttachmentComponent);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
