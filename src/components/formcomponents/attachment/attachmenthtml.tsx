import { Attachment, QuestionnaireItem } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import FileUpload, { MimeTypes, UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { useFileUpload } from '@helsenorge/file-upload/components/file-upload/useFileUpload';

import { validateFileSize, validateFileType, validateMaxFiles, validateMinFiles } from './attachment-validation';
import { getAttachmentMaxSizeBytesToUse } from './attachmentUtil';
import { VALID_FILE_TYPES } from '@/constants';
import { getId, isReadOnly } from '@/util';
import { Resources } from '@/util/resources';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { TextMessage } from '@/types/text-message';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReadOnly } from '../read-only/readOnly';
import { getErrorMessage, required } from '@/components/validation/rules';
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
  attachmentValidTypes?: Array<string>;
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
    linkId,
    pdf,
    children,
    multiple,
  } = props;

  const { formState, getFieldState, register: internalRegister } = useFormContext<FieldValues>();

  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const answer = useGetAnswer(linkId, path);
  const {
    setAcceptedFiles,
    setRejectedFiles,
    register,
    acceptedFiles: extAccepted,
    rejectedFiles: extRejected,
  } = useFileUpload(
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
  const { acceptedFiles, rejectedFiles, handleDelete, handleUpload, disableButton } = useAttachmentSync({
    multiple,
    onUpload,
    onDelete,
    answer,
    rejectedFiles: extRejected,
    acceptedFiles: extAccepted,
    setAcceptedFiles,
    setRejectedFiles,
  });
  const getMaxValueBytes = getAttachmentMaxSizeBytesToUse(attachmentMaxFileSize, item);
  const validFileTypes = attachmentValidTypes ? attachmentValidTypes : VALID_FILE_TYPES;
  const deleteText = resources ? resources.deleteAttachmentText : undefined;

  const getAttachmentValue = (): Attachment | Attachment[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(v => v.valueAttachment).filter((attachment): attachment is Attachment => attachment !== undefined);
    } else if (answer && answer.valueAttachment) {
      return answer.valueAttachment;
    }
    return undefined;
  };

  const attachmentValue = getAttachmentValue();

  const getAttachmentValueForPdf = (): UploadedFile[] | undefined => {
    if (Array.isArray(attachmentValue)) {
      return attachmentValue.map(attachment => {
        return {
          id: attachment.url ?? '-1',
          name: attachment.title || '',
        };
      });
    } else if (attachmentValue && attachmentValue.url) {
      return [
        {
          id: attachmentValue.url,
          name: attachmentValue.title || '',
        },
      ];
    }

    return undefined;
  };

  const getPdfValue = (): string => {
    const attachmentValueForPdf = getAttachmentValueForPdf();
    if (attachmentValueForPdf) {
      return attachmentValueForPdf.map(v => v.name).join(', ');
    } else if (resources) {
      return resources.ikkeBesvart;
    }

    return '';
  };

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    validate: () => true,
    shouldUnregister: true,
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={attachmentValue}
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
          {...rest}
          wrapperTestId={`${getId(id)}-attachment`}
          inputId={id}
          onChange={e => {
            onChange(e);
          }}
          onChangeFile={handleUpload}
          onDeleteFile={handleDelete}
          chooseFilesText={resources?.chooseFilesText}
          deleteText={deleteText}
          acceptedFiles={acceptedFiles}
          rejectedFiles={rejectedFiles}
          onOpenFile={onOpen}
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
