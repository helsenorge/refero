import { useContext } from 'react';

import { ExternalRenderContext } from './externalRenderContext';
import { ExternalRenderType } from './externalRenderType';

export const useExternalRenderContext = (): ExternalRenderType => {
  const context = useContext(ExternalRenderContext);
  if (context === undefined) {
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
