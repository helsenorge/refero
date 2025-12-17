import { useContext } from 'react';

import type { AttachmentType } from './AttachmentContextTypes';

import { AttachmentContext } from './AttachmentContext';

export const useAttachmentContext = (): AttachmentType => {
  const context = useContext(AttachmentContext);
  if (context === undefined) {
    throw new Error('useAttachmentContext must be used within a AttachmentProvider');
  }
  return context;
};
