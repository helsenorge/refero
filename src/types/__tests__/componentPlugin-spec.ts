import { describe, it, expect } from 'vitest';

import { createPluginKey, createPluginRegistry, type ComponentPlugin, type PluginComponentProps } from '../componentPlugin';

describe('componentPlugin', () => {
  describe('createPluginKey', () => {
    it('creates a key from itemType and itemControlCode', () => {
      const key = createPluginKey('integer', 'slider');
      expect(key).toBe('integer:slider');
    });

    it('handles different item types', () => {
      expect(createPluginKey('string', 'spinner')).toBe('string:spinner');
      expect(createPluginKey('choice', 'dropdown')).toBe('choice:dropdown');
      expect(createPluginKey('decimal', 'slider')).toBe('decimal:slider');
    });

    it('handles empty strings', () => {
      expect(createPluginKey('', '')).toBe(':');
      expect(createPluginKey('integer', '')).toBe('integer:');
      expect(createPluginKey('', 'slider')).toBe(':slider');
    });
  });

  describe('createPluginRegistry', () => {
    const mockComponent: React.ComponentType<PluginComponentProps> = () => null;

    it('creates an empty registry from empty array', () => {
      const registry = createPluginRegistry([]);
      expect(registry.size).toBe(0);
    });

    it('creates a registry with single plugin', () => {
      const plugins: ComponentPlugin[] = [
        {
          itemType: 'integer',
          itemControlCode: 'slider',
          component: mockComponent,
        },
      ];

      const registry = createPluginRegistry(plugins);

      expect(registry.size).toBe(1);
      expect(registry.has('integer:slider')).toBe(true);
      expect(registry.get('integer:slider')?.component).toBe(mockComponent);
    });

    it('creates a registry with multiple plugins', () => {
      const sliderComponent: React.ComponentType<PluginComponentProps> = () => null;
      const spinnerComponent: React.ComponentType<PluginComponentProps> = () => null;

      const plugins: ComponentPlugin[] = [
        {
          itemType: 'integer',
          itemControlCode: 'slider',
          component: sliderComponent,
        },
        {
          itemType: 'decimal',
          itemControlCode: 'spinner',
          component: spinnerComponent,
        },
      ];

      const registry = createPluginRegistry(plugins);

      expect(registry.size).toBe(2);
      expect(registry.get('integer:slider')?.component).toBe(sliderComponent);
      expect(registry.get('decimal:spinner')?.component).toBe(spinnerComponent);
    });

    it('overwrites duplicate keys with later plugin', () => {
      const firstComponent: React.ComponentType<PluginComponentProps> = () => null;
      const secondComponent: React.ComponentType<PluginComponentProps> = () => null;

      const plugins: ComponentPlugin[] = [
        {
          itemType: 'integer',
          itemControlCode: 'slider',
          component: firstComponent,
        },
        {
          itemType: 'integer',
          itemControlCode: 'slider',
          component: secondComponent,
        },
      ];

      const registry = createPluginRegistry(plugins);

      expect(registry.size).toBe(1);
      expect(registry.get('integer:slider')?.component).toBe(secondComponent);
    });

    it('preserves plugin metadata in registry', () => {
      const plugins: ComponentPlugin[] = [
        {
          itemType: 'choice',
          itemControlCode: 'autocomplete',
          component: mockComponent,
        },
      ];

      const registry = createPluginRegistry(plugins);
      const plugin = registry.get('choice:autocomplete');

      expect(plugin).toBeDefined();
      expect(plugin?.itemType).toBe('choice');
      expect(plugin?.itemControlCode).toBe('autocomplete');
    });
  });
});
