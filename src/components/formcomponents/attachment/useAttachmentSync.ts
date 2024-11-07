import { useState, useEffect, useRef } from 'react';
import { Attachment, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';
import { getMaxOccursExtensionValue } from '@/util/extension';
import { getAttachmentsFromAnswer } from './helpers';
import { useFormContext } from 'react-hook-form';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { Path } from '@/util/refero-core';

type UseAttachmentSyncParams = {
  onUpload: (files: UploadFile[]) => void;
  onDelete: (fileId: string) => void;
  setAcceptedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  setRejectedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  acceptedFiles: UploadFile[];
  rejectedFiles: UploadFile[];
  item?: QuestionnaireItem;
  idWithLinkIdAndItemIndex: string;
  path?: Path[];
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
  onUpload,
  onDelete,
  setAcceptedFiles,
  setRejectedFiles,
  acceptedFiles,
  rejectedFiles,
  item,
  idWithLinkIdAndItemIndex,
  path,
}: UseAttachmentSyncParams): UseAttachmentSyncReturn => {
  const answer = useGetAnswer(item?.linkId, path);
  const [disableButton, setDisableButton] = useState(false);
  const { setValue } = useFormContext();
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
  console.log('answer', answer);
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
        setValue(idWithLinkIdAndItemIndex, files);
        setAcceptedFiles(files);
        setRejectedFiles([]);
      } else {
        setValue(idWithLinkIdAndItemIndex, []);
        setAcceptedFiles([]);
        setRejectedFiles([]);
      }
    }
  }, [answer]);

  return {
    acceptedFiles,
    rejectedFiles,
    disableButton,
    handleUpload,
    handleDelete,
    value: getAttachmentsFromAnswer(),
  };
};
