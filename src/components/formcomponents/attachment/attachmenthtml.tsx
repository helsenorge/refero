import { QuestionnaireItem } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import FileUpload, { MimeTypes, UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';
import {
  validateNumberOfFiles,
  validateFileType,
  validateFileSize,
  validateTotalFileSize,
} from '@helsenorge/file-upload/components/file-upload/validate-utils';

import { getNumberOfFilesValidationText, getValidationTextForAttachment } from './attachment-validation';
import styles from '../common-styles.module.css';
import { convertBytesToMBString, getAttachmentMaxSizeBytesToUse, validateRequired } from './attachmentUtil';
import { useAttachmentSync } from './useAttachmentSync';
import { ReadOnly } from '../read-only/readOnly';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { VALID_FILE_TYPES } from '@/constants';
import { TextMessage } from '@/types/text-message';
import { getId, isReadOnly } from '@/util';
import { Resources } from '@/util/resources';

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
  const numberOfFilesValidationText = getNumberOfFilesValidationText(item, minFiles, maxFiles, resources);
  const fileTypesValidationText = getValidationTextForAttachment(item, resources?.attachmentError_fileType);
  const maxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);

  const validFileTypes: MimeTypes[] = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const filSizeValidationText = resources?.attachmentError_fileSize?.replace(
    '{0}',
    convertBytesToMBString(getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item))
  );
  const {
    setAcceptedFiles,
    setRejectedFiles,
    register,
    acceptedFiles: extAccepted,
    rejectedFiles: extRejected,
  } = useFileUpload(
    internalRegister,
    [
      validateFileType(validFileTypes, fileTypesValidationText),
      validateFileSize(0, maxValueBytes, getValidationTextForAttachment(item, filSizeValidationText || 'total file size')),
    ],
    [
      validateNumberOfFiles(minFiles ?? 0, maxFiles ?? 20, numberOfFilesValidationText || 'Number of files'),
      validateTotalFileSize(0, maxValueBytes, getValidationTextForAttachment(item, filSizeValidationText || 'total file size')),
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
          htmlFor={`${getId(id)}-button`}
          labelId={`${getId(id)}-attachment-label`}
          testId={`${getId(id)}-attachment-label`}
          attachmentLabel={resources?.supportedFileFormats}
        />
        <FileUpload
          {...register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined)}
          wrapperTestId={`${getId(id)}-attachment`}
          inputId={getId(id)}
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
