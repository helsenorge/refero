import { useContext } from 'react';

import { ComponentPluginContext, type ComponentPluginContextType } from './ComponentPluginContext';

/**
 * Hook to access the component plugin context.
 * Returns the plugin registry for looking up custom components.
 *
 * @throws Error if used outside of ComponentPluginProvider
 */
export const useComponentPlugin = (): ComponentPluginContextType => {
  const context = useContext(ComponentPluginContext);
  if (context === undefined) {
    throw new Error('useComponentPlugin must be used within a ComponentPluginProvider');
  }
  return context;
};

/**
 * Hook to access the component plugin registry.
 * Returns undefined if no provider is present (safe version for optional plugin support).
 */
export const useComponentPluginRegistry = (): ComponentPluginContextType['registry'] | undefined => {
  const context = useContext(ComponentPluginContext);
  return context?.registry;
};
