import type { Resources } from '../resources';
import type { QuestionnaireItem } from 'fhir/r4';

import { scriptInjectionValidation, getSublabelText } from '..';
import { Extensions } from '../../constants/extensions';

describe('utils-index', () => {
  describe('getSublabelText', () => {
    it('should return empty string when item is undefined', () => {
      expect(getSublabelText(undefined)).toBe('');
    });

    it('should return empty string when item has no sublabel extensions', () => {
      const item: QuestionnaireItem = { linkId: '1', type: 'string' };
      expect(getSublabelText(item)).toBe('');
    });

    it('should return sublabel text from sdf-sublabel-text extension', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_TEXT_URL,
            valueString: 'Plain sublabel text',
          },
        ],
      };
      expect(getSublabelText(item)).toBe('Plain sublabel text');
    });

    it('should return rendered markdown from sdf-sublabel extension when both extensions are present', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_URL,
            valueMarkdown: '**bold sublabel**',
          },
          {
            url: Extensions.SUBLABEL_TEXT_URL,
            valueString: 'Plain sublabel text',
          },
        ],
      };
      const result = getSublabelText(item);
      expect(result).toContain('<strong>bold sublabel</strong>');
    });

    it('should prefer markdown sublabel over plain text sublabel', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_URL,
            valueMarkdown: '**bold**',
          },
          {
            url: Extensions.SUBLABEL_TEXT_URL,
            valueString: 'plain text',
          },
        ],
      };
      const result = getSublabelText(item);
      expect(result).not.toBe('plain text');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should use onRenderMarkdown callback when provided with markdown sublabel', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_URL,
            valueMarkdown: '**bold**',
          },
        ],
      };
      const onRenderMarkdown = (_item: QuestionnaireItem, markdown: string): string => `<custom>${markdown}</custom>`;
      const result = getSublabelText(item, onRenderMarkdown);
      expect(result).toBe('<custom>**bold**</custom>');
    });

    it('should not use onRenderMarkdown callback when only plain text sublabel is present', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_TEXT_URL,
            valueString: 'Plain text',
          },
        ],
      };
      const onRenderMarkdown = (_item: QuestionnaireItem, markdown: string): string => `<custom>${markdown}</custom>`;
      const result = getSublabelText(item, onRenderMarkdown);
      expect(result).toBe('Plain text');
    });

    it('should return plain text sublabel when markdown sublabel extension has no value', () => {
      const item: QuestionnaireItem = {
        linkId: '1',
        type: 'string',
        extension: [
          {
            url: Extensions.SUBLABEL_URL,
          },
          {
            url: Extensions.SUBLABEL_TEXT_URL,
            valueString: 'Fallback text',
          },
        ],
      };
      expect(getSublabelText(item)).toBe('Fallback text');
    });
  });

  describe('scriptInjectionValidation', () => {
    it('should return resource.validationNotAllowed if script is in value and resources.validationNotAllowed is defined', () => {
      const value = '<script>alert("Hello")</script>';
      expect(
        scriptInjectionValidation(value, {
          validationNotAllowed: 'not allowed',
        } as Resources)
      ).toBe('<script>, </script> not allowed');
    });
    it('should return script tags and default error message if script is in value and resources.validationNotAllowed is not defined', () => {
      const value = '<script>alert("Hello")</script>';
      expect(scriptInjectionValidation(value)).toBe('<script>, </script> er ikke tillatt');
    });
    it('should return true if script is not in value', () => {
      const value = 'Hello';
      expect(scriptInjectionValidation(value)).toBe(true);
    });
  });
});
