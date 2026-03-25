import { type ReactNode, useMemo } from 'react';

import { ComponentPluginContext, type ComponentPluginContextType } from './ComponentPluginContext';

import { createPluginRegistry, type ComponentPlugin } from '@/types/componentPlugin';

export interface ComponentPluginProviderProps {
  children: ReactNode;
  /** Array of plugin definitions to register */
  plugins?: ComponentPlugin[];
}

/**
 * Provider component that makes the plugin registry available to all descendants.
 * Wrap your form with this provider and pass in your plugin definitions.
 */
export const ComponentPluginProvider = ({ children, plugins = [] }: ComponentPluginProviderProps): React.JSX.Element => {
  const contextValue = useMemo<ComponentPluginContextType>(
    () => ({
      registry: createPluginRegistry(plugins),
    }),
    [plugins]
  );

  return <ComponentPluginContext.Provider value={contextValue}>{children}</ComponentPluginContext.Provider>;
};
