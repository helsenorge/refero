import { useState, useEffect, useRef } from 'react';
import { Attachment, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

type UseAttachmentSyncParams = {
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined;
  multiple: boolean | undefined;
  onUpload: (files: UploadFile[]) => void;
  onDelete: (fileId: string) => void;
  setAcceptedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  setRejectedFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  acceptedFiles: UploadFile[];
  rejectedFiles: UploadFile[];
};

type UseAttachmentSyncReturn = {
  acceptedFiles: UploadFile[];
  rejectedFiles: UploadFile[];
  disableButton: boolean;
  handleUpload: (files: UploadFile[]) => void;
  handleDelete: (fileId: string) => void;
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
}: UseAttachmentSyncParams): UseAttachmentSyncReturn => {
  const [disableButton, setDisableButton] = useState(false);

  const internalUpdateRef = useRef(false);

  const handleUpload = (files: UploadFile[]): void => {
    internalUpdateRef.current = true;
    onUpload(files);
    setAcceptedFiles(prevState => [...prevState, ...files]);
    if (!multiple) {
      setDisableButton(true);
    }
  };

  const handleDelete = (fileId: string): void => {
    internalUpdateRef.current = true;
    onDelete(fileId);
    setAcceptedFiles(prevState => prevState.filter(x => x.id !== fileId));
    setRejectedFiles(prevState => prevState.filter(x => x.id !== fileId));
    if (!multiple) {
      setDisableButton(false);
    }
  };

  // Function to extract attachments from answer
  const getAttachmentsFromAnswer = (): Attachment[] => {
    if (Array.isArray(answer)) {
      return answer.map(ans => ans.valueAttachment).filter((attachment): attachment is Attachment => attachment !== undefined);
    } else if (answer && answer.valueAttachment) {
      return [answer.valueAttachment];
    }
    return [];
  };

  useEffect(() => {
    if (internalUpdateRef.current) {
      internalUpdateRef.current = false;
    } else {
      const attachments = getAttachmentsFromAnswer();
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
        if (!multiple) {
          setDisableButton(files.length > 0);
        }
      } else {
        setAcceptedFiles([]);
        setRejectedFiles([]);
        if (!multiple) {
          setDisableButton(false);
        }
      }
    }
  }, [answer, multiple]);

  return {
    acceptedFiles,
    rejectedFiles,
    disableButton,
    handleUpload,
    handleDelete,
  };
};
