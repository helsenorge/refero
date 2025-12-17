import { useState, useEffect, useRef } from 'react';

import { useFormContext } from 'react-hook-form';

import type { Path } from '@/util/refero-core';
import type { Attachment, QuestionnaireItem } from 'fhir/r4';

import { UploadFile } from '@helsenorge/file-upload/components/file-upload';

import { getAttachmentsFromAnswer } from './helpers';

import { useGetAnswer } from '@/hooks/useGetAnswer';
import { getId } from '@/util';

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
  const { resetField } = useFormContext();
  const internalUpdateRef = useRef(false);

  const handleUpload = (files: UploadFile[]): void => {
    const newFiles = files.map(file => {
      file.id = getId();
      return file;
    });
    internalUpdateRef.current = true;
    onUpload(newFiles);
    setAcceptedFiles(prevState => [...prevState, ...newFiles]);
  };

  const handleDelete = (fileId: string): void => {
    if (fileId) {
      internalUpdateRef.current = true;
      onDelete(fileId);
      setAcceptedFiles(prevState => prevState.filter(x => x.id !== fileId));
      setRejectedFiles(prevState => prevState.filter(x => x.id !== fileId));
    }
  };

  useEffect(() => {
    if (!item?.repeats && acceptedFiles.length > 0) {
      setDisableButton(true);
    } else {
      setDisableButton(false);
    }
  }, [acceptedFiles, item?.repeats]);
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

          const file = new UploadFile(fileBits, attachment.title || 'file', attachment.id ?? '-1', fileSize, {
            type: attachment.contentType || '',
          });

          return file;
        });
        resetField(idWithLinkIdAndItemIndex, { defaultValue: files });
        setAcceptedFiles(files);
        setRejectedFiles([]);
      } else {
        resetField(idWithLinkIdAndItemIndex, { defaultValue: [] });

        setAcceptedFiles([]);
        setRejectedFiles([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  return {
    acceptedFiles,
    rejectedFiles,
    disableButton,
    handleUpload,
    handleDelete,
    value: getAttachmentsFromAnswer(answer),
  };
};
