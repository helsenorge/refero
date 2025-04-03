export const isValidDecimal = (str: string): boolean => /^\d+$/.test(str);

export const isValidHex = (str: string): boolean => /^(0x)?[0-9A-Fa-f]{1,6}$/.test(str);

export const isValidHtmlCode = (str: string): boolean => /^&#(x[0-9A-Fa-f]+|\d+);$/.test(str);

export const isValidUnicodeHex = (str: string): boolean => /^U\+[0-9A-Fa-f]{4,6}$/.test(str);

export const getCodePoint = (value: string): number | null => {
  if (isValidDecimal(value)) {
    return parseInt(value, 10);
  }
  if (isValidHtmlCode(value)) {
    if (value.startsWith('&#x')) {
      return parseInt(value.replace(/^&#x|;$/g, ''), 16);
    } else {
      return parseInt(value.replace(/^&#|;$/g, ''), 10);
    }
  }
  if (isValidUnicodeHex(value)) {
    return parseInt(value.replace(/^U\+/, ''), 16);
  }
  if (isValidHex(value)) {
    return parseInt(value.replace(/^0x/, ''), 16);
  }
  return null;
};
export const convertToEmoji = (value: string): string => {
  const codePoint = getCodePoint(value);

  if (codePoint !== null && codePoint >= 0 && codePoint <= 0x10ffff) {
    try {
      return String.fromCodePoint(codePoint);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return value;
    }
  } else {
    return value;
  }
};
