import { useState, useEffect, useRef } from 'react';
import { Attachment, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { getMaxOccursExtensionValue } from '@/util/extension';
import { getAttachmentsFromAnswer } from './helpers';
import { useResetFormField } from '@/hooks/useResetFormField';

type UseAttachmentSyncParams = {
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined;
  multiple: boolean | undefined;
  onUpload: (files: UploadFile[]) => void;
  onDelete: (fileId: string) => void;
  setAcceptedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  setRejectedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  acceptedFiles: UploadFile[];
  rejectedFiles: UploadFile[];
  item?: QuestionnaireItem;
  idWithLinkIdAndItemIndex: string;
};

type UseAttachmentSyncReturn = {
  acceptedFiles: UploadFile[];
  rejectedFiles: UploadFile[];
  disableButton: boolean;
  handleUpload: (files: UploadFile[]) => void;
  handleDelete: (fileId: string) => void;
  value: Attachment[];
};

export const useAttachmentSync = ({
  multiple,
  onUpload,
  onDelete,
  answer,
  setAcceptedFiles,
  setRejectedFiles,
  acceptedFiles,
  rejectedFiles,
  item,
  idWithLinkIdAndItemIndex,
}: UseAttachmentSyncParams): UseAttachmentSyncReturn => {
  const [disableButton, setDisableButton] = useState(false);
  useResetFormField(idWithLinkIdAndItemIndex, acceptedFiles);
  const internalUpdateRef = useRef(false);

  const handleUpload = (files: UploadFile[]): void => {
    internalUpdateRef.current = true;
    onUpload(files);
    setAcceptedFiles(prevState => [...prevState, ...files]);
  };

  const handleDelete = (fileId: string): void => {
    internalUpdateRef.current = true;
    onDelete(fileId);
    setAcceptedFiles(prevState => prevState.filter(x => x.id !== fileId));
    setRejectedFiles(prevState => prevState.filter(x => x.id !== fileId));
  };

  useEffect(() => {
    const max = getMaxOccursExtensionValue(item);
    if (max === undefined && acceptedFiles.length > 0) {
      setDisableButton(true);
    } else if (max !== undefined && acceptedFiles.length > max) {
      setDisableButton(true);
    } else {
      setDisableButton(false);
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
    } else {
      const attachments = getAttachmentsFromAnswer(answer);
      if (attachments.length > 0) {
        const files: UploadFile[] = attachments.map(attachment => {
          let fileBits: BlobPart[] = [];
          let fileSize = attachment.size ?? 0;

          if (attachment.data) {
            const byteString = atob(attachment.data);
            const byteArray = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              byteArray[i] = byteString.charCodeAt(i);
            }
            fileBits = [byteArray];
            fileSize = byteArray.byteLength;
          } else {
            fileBits = [new Uint8Array(0)];
          }

          const file = new UploadFile(fileBits, attachment.title || 'file', attachment.url ?? '-1', fileSize, {
            type: attachment.contentType || '',
          });

          return file;
        });
        setAcceptedFiles(files);
        setRejectedFiles([]);
      } else {
        setAcceptedFiles([]);
        setRejectedFiles([]);
      }
    }
  }, [answer, multiple]);

  return {
    acceptedFiles,
    rejectedFiles,
    disableButton,
    handleUpload,
    handleDelete,
    value: getAttachmentsFromAnswer(),
  };
};
