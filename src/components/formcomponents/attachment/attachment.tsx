import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Attachment,
  QuestionnaireResponseItem,
  Questionnaire,
} from '../../../types/fhir';
import { TextMessage } from '../../../types/text-message';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';

import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { isRequired, getId, isReadOnly, isRepeat, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';
import AttachmentHtml from './attachmenthtml';
import { ValidationProps } from '../../../types/formTypes/validation';

export interface AttachmentProps extends WithCommonFunctionsProps {
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
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
}

const AttachmentComponent: React.FC<AttachmentProps & ValidationProps> = props => {
  const onUpload = (files: File[], cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void): void => {
    const { uploadAttachment, path, item, onAnswerChange } = props;
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (uploadedFile: UploadedFile, attachment: Attachment): void => {
          if (props.dispatch && attachment) {
            props
              .dispatch(newAttachmentAsync(props.path, attachment, props.item, isRepeat(props.item)))
              ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer));
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
    const { onDeleteAttachment, path, item, onAnswerChange } = props;

    if (onDeleteAttachment) {
      const onSuccess = (): void => {
        if (props.dispatch) {
          const attachment = { url: fileId } as Attachment;
          props
            .dispatch(removeAttachmentAsync(props.path, attachment, props.item))
            ?.then(newState => onAnswerChange(newState, path, item, { valueAttachment: attachment } as QuestionnaireResponseItemAnswer));
        }

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
    const { resources } = props;
    if (resources && resources.uploadButtonText) {
      buttonText = resources.uploadButtonText;
    }
    return buttonText;
  };

  const getAttachment = (): UploadedFile[] => {
    const { answer } = props;
    if (Array.isArray(answer)) {
      return answer.map(v => {
        return {
          id: v.valueAttachment && v.valueAttachment.url ? v.valueAttachment.url : -1,
          name: v.valueAttachment && v.valueAttachment.title ? v.valueAttachment.title : '',
        } as UploadedFile;
      });
    } else {
      if (answer && answer.valueAttachment && answer.valueAttachment.url) {
        return [
          {
            id: answer.valueAttachment.url,
            name: answer.valueAttachment.title ? answer.valueAttachment.title : '',
          } as UploadedFile,
        ];
      }
    }
    return [];
  };

  const getPdfValue = (): string => {
    const attachments = getAttachment();
    if (attachments) {
      return attachments.map(v => v.name).join(', ');
    } else if (props.resources) {
      return props.resources.ikkeBesvart;
    }

    return '';
  };

  React.useMemo(() => {
    const responseItemHasChanged = props.responseItem !== props.responseItem;
    const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
    const answerHasChanged = props.answer !== props.answer;
    const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
    const repeats = props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  
    const { pdf, id, item, resources, onOpenAttachment, onRenderMarkdown, questionnaire, ...other } = props;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={getPdfValue()}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={props.renderHelpButton()}
          helpElement={props.renderHelpElement()}
        >
          {props.children}
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
            onRequestAttachmentLink={props.onRequestAttachmentLink}
            helpButton={props.renderHelpButton()}
            helpElement={props.renderHelpElement()}
            maxFiles={getMaxOccursExtensionValue(item)}
            minFiles={getMinOccursExtensionValue(item)}
            attachmentMaxFileSize={props.attachmentMaxFileSize}
            attachmentValidTypes={props.attachmentValidTypes}
            item={item}
            attachmentErrorMessage={props.attachmentErrorMessage}
            {...other}
          />
        </>
      );
    }
}

const withCommonFunctionsComponent = withCommonFunctions(AttachmentComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
