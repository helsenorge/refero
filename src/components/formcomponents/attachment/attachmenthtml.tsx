import { useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import FileUpload, { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';

import { validateFileSize, validateFileType, validateMaxFiles, validateMinFiles } from './attachment-validation';
import { getAttachmentMaxSizeBytesToUse } from './attachmentUtil';
import { VALID_FILE_TYPES } from '@/constants';
import { getId } from '@/util';
import { Resources } from '@/util/resources';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import { TextMessage } from '@/types/text-message';
import { required } from '@/components/validation/rules';

type Props = {
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
  idWithLinkIdAndItemIndex: string;
  customErrorMessage: TextMessage | undefined;
};

const AttachmentHtml = ({
  id,
  onUpload,
  onDelete,
  onOpen,
  resources,
  attachmentErrorMessage,
  maxFiles,
  attachmentMaxFileSize,
  attachmentValidTypes,
  minFiles,
  item,
  idWithLinkIdAndItemIndex,
  customErrorMessage,
}: Props): JSX.Element | null => {
  const { formState, getFieldState, register: internalRegister } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex || '', formState);
  const { error } = fieldState;
  const getMaxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { register, acceptedFiles, rejectedFiles, setAcceptedFiles, setRejectedFiles } = useFileUpload(
    internalRegister,
    [
      (file): true | string => (file ? validateFileType(file, validFileTypes, item, resources?.attachmentError_fileType) : true),
      (file): true | string => (file ? validateFileSize(file, getMaxValueBytes, item, resources?.attachmentError_fileSize) : true),
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
          resources={resources}
          htmlFor={id}
          labelId={`${getId(id)}-attachment-label`}
          testId={`${getId(id)}-attachment-label`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <FileUpload
          {...register(item.linkId, {
            required: required({ item, resources }),
            validate: () => true,
            shouldUnregister: true,
          })}
          wrapperTestId={`${getId(id)}-attachment`}
          inputId={id}
          onChangeFile={handleUpload}
          onDeleteFile={handleDelete}
          chooseFilesText={resources?.chooseFilesText}
          deleteText={deleteText}
          acceptedFiles={acceptedFiles}
          rejectedFiles={rejectedFiles}
          helpElement={<RenderHelpElement item={item} isHelpVisible={isHelpVisible} />}
          onOpenFile={onOpen}
        />
        {customErrorMessage && (
          <NotificationPanel label={customErrorMessage.Title} variant="error">
            {customErrorMessage.Body}
          </NotificationPanel>
        )}
        {attachmentErrorMessage && <NotificationPanel variant="error">{attachmentErrorMessage}</NotificationPanel>}
      </FormGroup>
    </div>
  );
};

export default AttachmentHtml;
