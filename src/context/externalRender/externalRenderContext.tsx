import { createContext } from 'react';

import { ExternalRenderType } from './externalRenderType';

export const ExternalRenderContext = createContext<ExternalRenderType | undefined>(undefined);
