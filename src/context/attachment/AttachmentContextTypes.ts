import type { ReferoProps } from '@/types/referoProps';

export type AttachmentType = {
  attachmentErrorMessage?: ReferoProps['attachmentErrorMessage'];
  attachmentMaxFileSize?: ReferoProps['attachmentMaxFileSize'];
  attachmentMaxFileSizePerFile?: ReferoProps['attachmentMaxFileSizePerFile'];
  attachmentValidTypes?: ReferoProps['attachmentValidTypes'];
  onRequestAttachmentLink?: ReferoProps['onRequestAttachmentLink'];
  onOpenAttachment?: ReferoProps['onOpenAttachment'];
  onDeleteAttachment?: ReferoProps['onDeleteAttachment'];
  uploadAttachment?: ReferoProps['uploadAttachment'];
};
