import { createContext } from 'react';

import type { ExternalRenderType } from './externalRenderType';

export const ExternalRenderContext = createContext<ExternalRenderType | undefined>(undefined);
