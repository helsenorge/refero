import { scriptInjectionValidation } from '..';
import { Resources } from '../resources';

describe('utils-index', () => {
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
