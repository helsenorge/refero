import {
  convertToEmoji,
  getCodePoint,
  isValidDecimal,
  isValidHex,
  isValidHtmlCode,
  isValidUnicodeHex,
} from '../formcomponents/choice/slider-view';

// Tests for validation functions
describe('Validation functions', () => {
  test('isValidDecimal', () => {
    expect(isValidDecimal('123')).toBe(true);
    expect(isValidDecimal('abc')).toBe(false);
    expect(isValidDecimal('123abc')).toBe(false);
    expect(isValidDecimal('')).toBe(false);
  });

  test('isValidHtmlCode', () => {
    expect(isValidHtmlCode('&#128512;')).toBe(true);
    expect(isValidHtmlCode('&#x1F600;')).toBe(true);
    expect(isValidHtmlCode('&#123abc;')).toBe(false);
    expect(isValidHtmlCode('&128512;')).toBe(false);
    expect(isValidHtmlCode('&#abc;')).toBe(false);
    expect(isValidHtmlCode('')).toBe(false);
  });

  test('isValidHex', () => {
    // Valid hex values
    expect(isValidHex('0x1F600')).toBe(true);
    expect(isValidHex('1F600')).toBe(true);
    expect(isValidHex('123')).toBe(true);
    expect(isValidHex('abc')).toBe(true);
    expect(isValidHex('123abc')).toBe(true);

    // Invalid hex values
    expect(isValidHex('0xGHI')).toBe(false);
    expect(isValidHex('GHI')).toBe(false);
    expect(isValidHex('')).toBe(false);
    expect(isValidHex('0x')).toBe(false);
    expect(isValidHex('0x1F6001')).toBe(true);
    expect(isValidHex('1F6001')).toBe(true);
  });

  test('isValidUnicodeHex', () => {
    // Valid Unicode hex values
    expect(isValidUnicodeHex('U+1F600')).toBe(true);
    expect(isValidUnicodeHex('U+1234')).toBe(true);

    // Invalid Unicode hex values
    expect(isValidUnicodeHex('1F600')).toBe(false);
    expect(isValidUnicodeHex('U+GHI')).toBe(false);
    expect(isValidUnicodeHex('U+abc')).toBe(false);
    expect(isValidUnicodeHex('')).toBe(false);
    expect(isValidUnicodeHex('U+123')).toBe(false);
    expect(isValidUnicodeHex('U+1F6001')).toBe(true);
  });
});

// Tests for getCodePoint function
describe('getCodePoint', () => {
  test('decimal input', () => {
    expect(getCodePoint('128512')).toBe(128512);
  });

  test('hex input with 0x', () => {
    expect(getCodePoint('0x1F600')).toBe(0x1f600);
  });

  test('hex input without 0x', () => {
    expect(getCodePoint('1F600')).toBe(0x1f600);
  });

  test('HTML code decimal input', () => {
    expect(getCodePoint('&#128512;')).toBe(128512);
  });

  test('HTML code hex input', () => {
    expect(getCodePoint('&#x1F600;')).toBe(0x1f600);
  });

  test('Unicode hex input', () => {
    expect(getCodePoint('U+1F600')).toBe(0x1f600);
  });

  test('invalid input', () => {
    expect(getCodePoint('')).toBeNull();
  });
});

// Tests for convertToEmoji function
describe('convertToEmoji', () => {
  test('valid decimal input', () => {
    expect(convertToEmoji('128512')).toBe('😀');
  });

  test('valid hex input with 0x', () => {
    expect(convertToEmoji('0x1F600')).toBe('😀');
  });

  test('valid hex input without 0x', () => {
    expect(convertToEmoji('1F600')).toBe('😀');
  });

  test('valid HTML code decimal input', () => {
    expect(convertToEmoji('&#128512;')).toBe('😀');
  });

  test('valid HTML code hex input', () => {
    expect(convertToEmoji('&#x1F600;')).toBe('😀');
  });

  test('valid Unicode hex input', () => {
    expect(convertToEmoji('U+1F600')).toBe('😀');
  });

  test('out of range input', () => {
    expect(convertToEmoji('1212966')).toBe('1212966');
  });

  test('invalid input', () => {
    expect(convertToEmoji('')).toBe('');
  });
});
