import { QuestionnaireItem } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import FileUpload, { MimeTypes, UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';

import { getCustomValidationText } from './attachment-validation';
import {
  validateNumberOfFiles,
  validateFileType,
  validateTotalFileSize,
} from '@helsenorge/file-upload/components/file-upload/validate-utils';
import { getAttachmentMaxSizeBytesToUse, validateRequired } from './attachmentUtil';
import { VALID_FILE_TYPES } from '@/constants';
import { getId, isReadOnly } from '@/util';
import { Resources } from '@/util/resources';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { TextMessage } from '@/types/text-message';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReadOnly } from '../read-only/readOnly';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useAttachmentSync } from './useAttachmentSync';

type Props = QuestionnaireComponentItemProps & {
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
  item?: QuestionnaireItem;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: MimeTypes[];
  idWithLinkIdAndItemIndex: string;
  customErrorMessage: TextMessage | undefined;
};

type UploadedFile = {
  name: string;
  id: string;
};

const AttachmentHtml = (props: Props): JSX.Element | null => {
  const {
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
    path,
    pdf,
    children,
    multiple,
    onRequestAttachmentLink,
  } = props;
  const { formState, getFieldState, register: internalRegister } = useFormContext<FieldValues>();

  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const numberOfFilesMessage = getCustomValidationText(
    item,
    (minFiles && !maxFiles && resources?.attachmentError_minFiles) ||
      (maxFiles && !minFiles && resources?.attachmentError_maxFiles) ||
      (maxFiles && minFiles && resources?.attachmentError_minFiles) ||
      undefined
  );
  const validationFileTypesMessage = getCustomValidationText(item, resources?.attachmentError_fileType);
  const maxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const validFileTypes: MimeTypes[] = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;

  const {
    setAcceptedFiles,
    setRejectedFiles,
    register,
    acceptedFiles: extAccepted,
    rejectedFiles: extRejected,
  } = useFileUpload(
    internalRegister,
    [validateFileType(validFileTypes, validationFileTypesMessage)],
    [
      validateNumberOfFiles(minFiles ?? 0, maxFiles ?? 20, numberOfFilesMessage || 'Number of files'),
      validateTotalFileSize(0, maxValueBytes, getCustomValidationText(item, resources?.attachmentError_fileSize || 'total file size')),
    ]
  );

  const { acceptedFiles, rejectedFiles, handleDelete, handleUpload, disableButton, value } = useAttachmentSync({
    onUpload,
    path,
    onDelete,
    rejectedFiles: extRejected,
    acceptedFiles: extAccepted,
    setAcceptedFiles,
    setRejectedFiles,
    item,
    idWithLinkIdAndItemIndex,
  });

  const getPdfValue = (): string => {
    const getAttachmentValueForPdf = (): UploadedFile[] | undefined => {
      if (Array.isArray(value)) {
        return value.map(attachment => {
          return {
            id: attachment.url ?? '-1',
            name: attachment.title || '',
          };
        });
      }

      return undefined;
    };
    const attachmentValueForPdf = getAttachmentValueForPdf();
    if (attachmentValueForPdf && attachmentValueForPdf.length > 0) {
      return attachmentValueForPdf.map(v => v.name).join(', ');
    } else if (resources) {
      return resources.ikkeBesvart;
    }

    return '';
  };

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    validate: {
      required: value => validateRequired(item, resources, value),
    },
    shouldUnregister: true,
  };
  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={value}
        pdfValue={getPdfValue()}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }

  return (
    <div className="page_refero__component page_refero__component_attachment" data-testid={getId(id)}>
      <FormGroup error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${getId(id)}-attachment-label`}
          testId={`${getId(id)}-attachment-label`}
          attachmentLabel={resources?.supportedFileFormats}
        />
        <FileUpload
          {...register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined)}
          wrapperTestId={`${getId(id)}-attachment`}
          inputId={id}
          onChangeFile={handleUpload}
          onDeleteFile={handleDelete}
          chooseFilesText={resources?.chooseFilesText}
          deleteText={resources?.deleteAttachmentText}
          acceptedFiles={acceptedFiles}
          rejectedFiles={rejectedFiles}
          onOpenFile={onOpen}
          accept={validFileTypes.join(',')}
          onRequestLink={onRequestAttachmentLink}
          shouldUploadMultiple={multiple}
          disabled={disableButton}
          validFileTypes={validFileTypes as MimeTypes[]}
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
