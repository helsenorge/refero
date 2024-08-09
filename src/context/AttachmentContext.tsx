import { Attachment as FhirAttachment } from 'fhir/r4';
import { createContext, useContext, ReactNode } from 'react';

type AttachmentType = {
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: string[];
  onRequestAttachmentLink?: (fileId: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (files: File[], onSuccess: (attachment: FhirAttachment) => void) => void;
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
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
