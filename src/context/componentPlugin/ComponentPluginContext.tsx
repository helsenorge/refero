import { createContext } from 'react';

import type { ComponentPluginRegistry } from '@/types/componentPlugin';

export interface ComponentPluginContextType {
  /** The plugin registry for looking up custom components */
  registry: ComponentPluginRegistry;
}

export const ComponentPluginContext = createContext<ComponentPluginContextType | undefined>(undefined);
