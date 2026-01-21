import type { ReactNode } from 'react';

import type { AttachmentType } from './AttachmentContextTypes';

import { AttachmentContext } from './AttachmentContext';

export type AttachmentProviderProps = AttachmentType & {
  children: ReactNode;
};
export const AttachmentProvider = ({
  attachmentErrorMessage,
  attachmentMaxFileSize,
  attachmentValidTypes,
  attachmentMaxFileSizePerFile,
  onDeleteAttachment,
  onOpenAttachment,
  onRequestAttachmentLink,
  uploadAttachment,
  children,
}: AttachmentProviderProps): React.JSX.Element => {
  return (
    <AttachmentContext.Provider
      value={{
        attachmentErrorMessage,
        attachmentMaxFileSize,
        attachmentValidTypes,
        onDeleteAttachment,
        attachmentMaxFileSizePerFile,
        onOpenAttachment,
        onRequestAttachmentLink,
        uploadAttachment,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};
