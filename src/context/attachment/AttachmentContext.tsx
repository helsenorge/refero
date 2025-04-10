import { createContext } from 'react';

import { AttachmentType } from './AttachmentContextTypes';

export const AttachmentContext = createContext<AttachmentType | undefined>(undefined);
