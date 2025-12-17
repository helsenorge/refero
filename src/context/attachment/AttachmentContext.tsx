import { createContext } from 'react';

import type { AttachmentType } from './AttachmentContextTypes';

export const AttachmentContext = createContext<AttachmentType | undefined>(undefined);
