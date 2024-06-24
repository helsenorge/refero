import React from 'react';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { FieldError } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import FileUpload, { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';

import { validateFileSize, validateFileType, validateMaxFiles, validateMinFiles } from './attachment-validation';
import { getAttachmentMaxSizeBytesToUse } from './attachmentUtil';
import { VALID_FILE_TYPES } from '../../../constants';
import { getId } from '../../../util';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';

interface Props {
  onUpload: (files: UploadFile[]) => void;
  onDelete: (fileId: string) => void;
  onOpen?: (fileId: string) => void;
  uploadButtonText: string;
  labelText?: string;
  id: string;
  attachmentErrorMessage?: string;
  resources?: Resources;
  isRequired?: boolean;
  multiple?: boolean;
  errorText?: string;
  onRequestAttachmentLink?: (file: string) => string;
  maxFiles?: number;
  minFiles?: number;
  item: QuestionnaireItem;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  questionnaire?: Questionnaire;
  renderHelpButton: () => JSX.Element;
  helpElement?: JSX.Element;
  register: FormProps['register'];
  error?: FieldError;
  children?: React.ReactNode;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const attachmentHtml = ({
  id,
  onUpload,
  questionnaire,
  onDelete,
  onOpen,
  resources,
  isRequired,
  attachmentErrorMessage,
  renderHelpButton,
  helpElement,
  maxFiles,
  attachmentMaxFileSize,
  attachmentValidTypes,
  minFiles,
  item,
  children,
  error,
  onRenderMarkdown,
  ...rest
}: Props): JSX.Element | null => {
  const getMaxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;

  const { register, acceptedFiles, rejectedFiles, setAcceptedFiles, setRejectedFiles } = useFileUpload(
    rest.register,
    [
      (file): true | string => (file ? validateFileSize(file, getMaxValueBytes, item, resources?.attachmentError_fileSize) : true),
      (file): true | string => (file ? validateFileType(file, validFileTypes, item, resources?.attachmentError_fileType) : true),
    ],
    [
      (files): true | string =>
        files.length && minFiles ? validateMinFiles(files, minFiles, item, resources?.attachmentError_minFiles) : true,
      (files): true | string =>
        files.length && maxFiles ? validateMaxFiles(files, maxFiles, item, resources?.attachmentError_maxFiles) : true,
    ]
  );

  const handleUpload = (files: UploadFile[]): void => {
    onUpload(files);
    setAcceptedFiles(prevState => [...prevState, ...files]);
  };

  const handleDelete = (fileId: string): void => {
    onDelete(fileId);
    setAcceptedFiles(acceptedFiles.filter(x => x.id !== fileId));
    setRejectedFiles(rejectedFiles.filter(x => x.id !== fileId));
  };

  const concatErrorMessages = (): string => {
    return error?.types ? Object.values(error.types).join('. ') : '';
  };

  return (
    <div className="page_refero__component page_refero__component_attachment" data-testid={getId(id)}>
      <FormGroup error={concatErrorMessages()}>
        <ReferoLabel
          item={item}
          onRenderMarkdown={onRenderMarkdown}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={id}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
          renderHelpButton={renderHelpButton}
        />
        <FileUpload
          {...register(item.linkId, {
            required: {
              value: !!isRequired,
              message: resources?.attachmentError_required || '',
            },
            validate: () => true,
            shouldUnregister: true,
          })}
          inputId={id}
          onChangeFile={handleUpload}
          onDeleteFile={handleDelete}
          chooseFilesText={resources?.chooseFilesText}
          deleteText={deleteText}
          acceptedFiles={acceptedFiles}
          rejectedFiles={rejectedFiles}
          helpElement={helpElement}
          onOpenFile={onOpen}
        />
        {attachmentErrorMessage && <NotificationPanel variant="alert">{attachmentErrorMessage}</NotificationPanel>}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default attachmentHtml;

{
  /* <Dropzone
  uploadedFiles={uploadedFiles}
  validMimeTypes={validFileTypes}
  supportedFileFormatsText={resources ? resources.supportedFileFormats : undefined}
  onRequestLink={onRequestAttachmentLink}
  helpButton={helpButton}
  shouldUploadMultiple={multiple}
  errorMessage={(file: File): string => {
    return getErrorMessage(validFileTypes, getMaxValueBytes, getMaxValueMBToReplace, item, errorText, file, resources);
  }}
  wrapperClasses="page_refero__input"
/> */
}
