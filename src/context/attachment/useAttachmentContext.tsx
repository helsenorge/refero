import { useContext } from 'react';

import { AttachmentContext } from './AttachmentContext';
import { AttachmentType } from './AttachmentContextTypes';

export const useAttachmentContext = (): AttachmentType => {
  const context = useContext(AttachmentContext);
  if (context === undefined) {
    throw new Error('useAttachmentContext must be used within a AttachmentProvider');
  }
  return context;
};
