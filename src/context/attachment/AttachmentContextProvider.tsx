import { ReactNode } from 'react';

import { AttachmentContext } from './AttachmentContext';
import { AttachmentType } from './AttachmentContextTypes';

export type AttachmentProviderProps = AttachmentType & {
  children: ReactNode;
};
export const AttachmentProvider = ({
  attachmentErrorMessage,
  attachmentMaxFileSize,
  attachmentValidTypes,
  onDeleteAttachment,
  onOpenAttachment,
  onRequestAttachmentLink,
  uploadAttachment,
  children,
}: AttachmentProviderProps): JSX.Element => {
  return (
    <AttachmentContext.Provider
      value={{
        attachmentErrorMessage,
        attachmentMaxFileSize,
        attachmentValidTypes,
        onDeleteAttachment,
        onOpenAttachment,
        onRequestAttachmentLink,
        uploadAttachment,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};
