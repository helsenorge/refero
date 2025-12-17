import { useContext } from 'react';

import type { ExternalRenderType } from './externalRenderType';

import { ExternalRenderContext } from './externalRenderContext';

export const useExternalRenderContext = (): ExternalRenderType => {
  const context = useContext(ExternalRenderContext);
  if (context === undefined) {
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
