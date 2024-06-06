import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Attachment, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import AttachmentHtml from './attachmenthtml';
import { NewValueAction, newAttachmentAsync, removeAttachmentAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getMaxOccursExtensionValue, getMinOccursExtensionValue } from '../../../util/extension';
import { isRequired, getId, isReadOnly, isRepeat, getText, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  pdf?: boolean;
  id?: string;
  resources?: Resources;
  renderDeleteButton: () => JSX.Element | null;
  repeatButton: JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  uploadAttachment?: (files: File[], onSuccess: (attachment: Attachment) => void) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  onOpenAttachment?: (fileId: string) => void;
  onRequestAttachmentLink?: (file: string) => string;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

export const AttachmentComponent = (props: Props): JSX.Element | null => {
  const {
    uploadAttachment,
    path,
    item,
    onAnswerChange,
    onDeleteAttachment,
    dispatch,
    pdf,
    id,
    resources,
    onOpenAttachment,
    onRenderMarkdown,
    questionnaire,
    children,
    answer,
    renderHelpButton,
    onRequestAttachmentLink,
    attachmentMaxFileSize,
    renderHelpElement,
    attachmentValidTypes,
    attachmentErrorMessage,
    register,
    error,
  } = props;

  const onUpload = (files: UploadFile[]): void => {
    if (uploadAttachment) {
      for (const file of files) {
        const onSuccess = (attachment: Attachment): void => {
          if (dispatch && attachment) {
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
          dispatch(removeAttachmentAsync(path, attachment, item))?.then(newState =>
            onAnswerChange(newState, path, item, { valueAttachment: attachment })
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

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = responseItem !== nextresponseItem;
  //   const helpItemHasChanged = isHelpOpen !== nextisHelpOpen;
  //   const resourcesHasChanged = JSON.stringify(resources) !== JSON.stringify(nextresources);
  //   const attachmentErrorMessageHasChanged = attachmentErrorMessage !== nextattachmentErrorMessage;
  //   const repeats = item.repeats ?? false;

  //   return (
  //     responseItemHasChanged ||
  //     helpItemHasChanged ||
  //     resourcesHasChanged ||
  //     attachmentErrorMessageHasChanged ||
  //     repeats ||
  //     error?.message !== nexterror?.message
  //   );
  // }

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;

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
          labelText={labelText}
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
          register={register}
          error={error}
        >
          {children}
        </AttachmentHtml>
      </>
    );
  }
};

const withFormProps = ReactHookFormHoc(AttachmentComponent);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
