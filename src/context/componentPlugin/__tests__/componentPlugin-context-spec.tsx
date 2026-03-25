import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { ComponentPlugin, PluginComponentProps } from '@/types/componentPlugin';

import { ComponentPluginProvider } from '../ComponentPluginProvider';
import { useComponentPlugin, useComponentPluginRegistry } from '../useComponentPlugin';

const mockComponent: React.ComponentType<PluginComponentProps> = () => null;

describe('ComponentPlugin Context', () => {
  describe('useComponentPlugin', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useComponentPlugin());
      }).toThrow('useComponentPlugin must be used within a ComponentPluginProvider');
    });

    it('returns context when used inside provider', () => {
      const { result } = renderHook(() => useComponentPlugin(), {
        wrapper: ({ children }) => <ComponentPluginProvider>{children}</ComponentPluginProvider>,
      });

      expect(result.current).toBeDefined();
      expect(result.current.registry).toBeDefined();
    });

    it('returns empty registry when no plugins provided', () => {
      const { result } = renderHook(() => useComponentPlugin(), {
        wrapper: ({ children }) => <ComponentPluginProvider>{children}</ComponentPluginProvider>,
      });

      expect(result.current.registry.size).toBe(0);
    });

    it('returns registry with plugins when provided', () => {
      const plugins: ComponentPlugin[] = [
        {
          itemType: 'integer',
          itemControlCode: 'slider',
          component: mockComponent,
        },
      ];

      const { result } = renderHook(() => useComponentPlugin(), {
        wrapper: ({ children }) => <ComponentPluginProvider plugins={plugins}>{children}</ComponentPluginProvider>,
      });

      expect(result.current.registry.size).toBe(1);
      expect(result.current.registry.has('integer:slider')).toBe(true);
    });
  });

  describe('useComponentPluginRegistry', () => {
    it('returns undefined when used outside provider', () => {
      const { result } = renderHook(() => useComponentPluginRegistry());

      expect(result.current).toBeUndefined();
    });

    it('returns registry when used inside provider', () => {
      const { result } = renderHook(() => useComponentPluginRegistry(), {
        wrapper: ({ children }) => <ComponentPluginProvider>{children}</ComponentPluginProvider>,
      });

      expect(result.current).toBeDefined();
      expect(result.current?.size).toBe(0);
    });

    it('returns registry with correct plugins', () => {
      const plugins: ComponentPlugin[] = [
        {
          itemType: 'string',
          itemControlCode: 'spinner',
          component: mockComponent,
        },
        {
          itemType: 'decimal',
          itemControlCode: 'slider',
          component: mockComponent,
        },
      ];

      const { result } = renderHook(() => useComponentPluginRegistry(), {
        wrapper: ({ children }) => <ComponentPluginProvider plugins={plugins}>{children}</ComponentPluginProvider>,
      });

      expect(result.current?.size).toBe(2);
      expect(result.current?.has('string:spinner')).toBe(true);
      expect(result.current?.has('decimal:slider')).toBe(true);
    });
  });

  describe('ComponentPluginProvider', () => {
    it('renders children and provides registry', () => {
      const plugin: ComponentPlugin = {
        itemType: 'integer',
        itemControlCode: 'slider',
        component: mockComponent,
      };

      const { result } = renderHook(() => useComponentPlugin(), {
        wrapper: ({ children }) => <ComponentPluginProvider plugins={[plugin]}>{children}</ComponentPluginProvider>,
      });

      // Verify the registry is provided and accessible
      expect(result.current.registry).toBeDefined();
      expect(result.current.registry.size).toBe(1);
      expect(result.current.registry.get('integer:slider')?.component).toBe(mockComponent);
    });
  });
});
