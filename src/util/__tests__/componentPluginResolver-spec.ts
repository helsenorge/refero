import { describe, it, expect } from 'vitest';

import type { QuestionnaireItem } from 'fhir/r4';

import { ITEMCONTROL_URL } from '@/constants/extensions';
import { createPluginRegistry, createPluginKey, type ComponentPluginRegistry, type PluginComponentProps } from '@/types/componentPlugin';
import { resolvePluginComponent, hasPluginComponent, getPluginItemControlCode } from '@/util/componentPluginResolver';

// Simple mock component for testing
const MockPluginComponent: React.FC<PluginComponentProps> = () => null;

const createItemWithItemControl = (code: string): QuestionnaireItem => ({
  linkId: 'test-item',
  type: 'string',
  extension: [
    {
      url: ITEMCONTROL_URL,
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://hl7.org/fhir/questionnaire-item-control',
            code: code,
          },
        ],
      },
    },
  ],
});

const createItemWithoutItemControl = (): QuestionnaireItem => ({
  linkId: 'test-item',
  type: 'string',
});

describe('componentPluginResolver', () => {
  describe('resolvePluginComponent', () => {
    it('returns undefined component when item is undefined', () => {
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      const result = resolvePluginComponent(undefined, registry);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    it('returns undefined component when registry is undefined', () => {
      const item = createItemWithItemControl('custom-code');

      const result = resolvePluginComponent(item, undefined);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    it('returns undefined component when registry is empty', () => {
      const item = createItemWithItemControl('custom-code');
      const registry: ComponentPluginRegistry = new Map();

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    it('returns undefined component when item has no itemControl extension', () => {
      const item = createItemWithoutItemControl();
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    it('returns undefined component when no matching plugin is registered', () => {
      const item = createItemWithItemControl('unregistered-code');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    it('returns the matching plugin component and code', () => {
      const item = createItemWithItemControl('my-custom-control');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'my-custom-control', component: MockPluginComponent }]);

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBe(MockPluginComponent);
      expect(result.matchedCode).toBe('my-custom-control');
    });

    it('returns the correct plugin when multiple are registered', () => {
      const AnotherMockComponent: React.FC<PluginComponentProps> = () => null;
      const item = createItemWithItemControl('second-control');
      const registry = createPluginRegistry([
        { itemType: 'string', itemControlCode: 'first-control', component: MockPluginComponent },
        { itemType: 'string', itemControlCode: 'second-control', component: AnotherMockComponent },
      ]);

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBe(AnotherMockComponent);
      expect(result.matchedCode).toBe('second-control');
    });

    it('uses createPluginKey for consistent key lookup', () => {
      const item = createItemWithItemControl('test-code');
      // Manually create a registry with a key that matches createPluginKey format
      const registry: ComponentPluginRegistry = new Map();
      registry.set(createPluginKey('string', 'test-code'), {
        itemType: 'string',
        itemControlCode: 'test-code',
        component: MockPluginComponent,
      });

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBe(MockPluginComponent);
    });

    it('returns undefined when item type does not match plugin', () => {
      const item = createItemWithItemControl('custom-code');
      const registry = createPluginRegistry([{ itemType: 'integer', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      const result = resolvePluginComponent(item, registry);

      expect(result.component).toBeUndefined();
      expect(result.matchedCode).toBeUndefined();
    });

    describe('protected itemControl codes', () => {
      const protectedCodes = [
        'check-box',
        'drop-down',
        'radio-button',
        'autocomplete',
        'help',
        'help-link',
        'inline',
        'highlight',
        'sidebar',
        'year',
        'yearMonth',
        'receiver-component',
        'data-receiver',
        'slider',
        'table',
        'htable',
        'gtable',
        'atable',
        'grid',
      ];

      it.each(protectedCodes)('does not resolve a plugin for protected code "%s"', code => {
        const item: QuestionnaireItem = {
          linkId: 'test-item',
          type: 'choice',
          extension: [
            {
              url: ITEMCONTROL_URL,
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code }],
              },
            },
          ],
        };
        const registry = createPluginRegistry([{ itemType: 'choice', itemControlCode: code, component: MockPluginComponent }]);

        const result = resolvePluginComponent(item, registry);

        expect(result.component).toBeUndefined();
        expect(result.matchedCode).toBeUndefined();
      });

      it('resolves a plugin for a custom (non-protected) code', () => {
        const item = createItemWithItemControl('image-picker');
        const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'image-picker', component: MockPluginComponent }]);

        const result = resolvePluginComponent(item, registry);

        expect(result.component).toBe(MockPluginComponent);
        expect(result.matchedCode).toBe('image-picker');
      });

      it('skips protected code but resolves second custom code on same item', () => {
        const item: QuestionnaireItem = {
          linkId: 'test-item',
          type: 'choice',
          extension: [
            {
              url: ITEMCONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  { system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'check-box' },
                  { system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'my-custom' },
                ],
              },
            },
          ],
        };
        const registry = createPluginRegistry([
          { itemType: 'choice', itemControlCode: 'check-box', component: MockPluginComponent },
          { itemType: 'choice', itemControlCode: 'my-custom', component: MockPluginComponent },
        ]);

        const result = resolvePluginComponent(item, registry);

        expect(result.component).toBe(MockPluginComponent);
        expect(result.matchedCode).toBe('my-custom');
      });
    });
  });

  describe('hasPluginComponent', () => {
    it('returns false when item is undefined', () => {
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      expect(hasPluginComponent(undefined, registry)).toBe(false);
    });

    it('returns false when registry is undefined', () => {
      const item = createItemWithItemControl('custom-code');

      expect(hasPluginComponent(item, undefined)).toBe(false);
    });

    it('returns false when no matching plugin exists', () => {
      const item = createItemWithItemControl('unregistered-code');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      expect(hasPluginComponent(item, registry)).toBe(false);
    });

    it('returns true when a matching plugin exists', () => {
      const item = createItemWithItemControl('custom-code');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      expect(hasPluginComponent(item, registry)).toBe(true);
    });
  });

  describe('getPluginItemControlCode', () => {
    it('returns undefined when item is undefined', () => {
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      expect(getPluginItemControlCode(undefined, registry)).toBeUndefined();
    });

    it('returns undefined when registry is undefined', () => {
      const item = createItemWithItemControl('custom-code');

      expect(getPluginItemControlCode(item, undefined)).toBeUndefined();
    });

    it('returns undefined when no matching plugin exists', () => {
      const item = createItemWithItemControl('unregistered-code');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'custom-code', component: MockPluginComponent }]);

      expect(getPluginItemControlCode(item, registry)).toBeUndefined();
    });

    it('returns the itemControl code when a matching plugin exists', () => {
      const item = createItemWithItemControl('my-plugin-code');
      const registry = createPluginRegistry([{ itemType: 'string', itemControlCode: 'my-plugin-code', component: MockPluginComponent }]);

      expect(getPluginItemControlCode(item, registry)).toBe('my-plugin-code');
    });
  });
});
