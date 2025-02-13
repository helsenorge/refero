import { createContext, useContext, ReactNode } from 'react';

import { ReferoProps } from '@/types/referoProps';

type AttachmentType = {
  attachmentErrorMessage?: ReferoProps['attachmentErrorMessage'];
  attachmentMaxFileSize?: ReferoProps['attachmentMaxFileSize'];
  attachmentValidTypes?: ReferoProps['attachmentValidTypes'];
  onRequestAttachmentLink?: ReferoProps['onRequestAttachmentLink'];
  onOpenAttachment?: ReferoProps['onOpenAttachment'];
  onDeleteAttachment?: ReferoProps['onDeleteAttachment'];
  uploadAttachment?: ReferoProps['uploadAttachment'];
};

const Attachment = createContext<AttachmentType | undefined>(undefined);

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
    <Attachment.Provider
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
    </Attachment.Provider>
  );
};

export const useAttachmentContext = (): AttachmentType => {
  const context = useContext(Attachment);
  if (context === undefined) {
    throw new Error('useAttachmentContext must be used within a AttachmentProvider');
  }
  return context;
};
