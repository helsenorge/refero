import { unescapeHexEntities, unescapeHtmlEntities } from './html-entities';

/**
 * Returnerer true når en streng er null, undefined eller tom
 * @param s - streng som skal sjekkes
 */
export const isEmpty = (string: string | undefined | null): boolean => {
  if (string && string.trim) string = string.trim();
  return string === '' || string === null || string === undefined;
};

/**
 * Returnerer true når strengen inneholder følgende symboler: "!#¤%=?`´^¨~*:;£${[\]}|§€><\|
 * @param s - streng som skal sjekkes
 */
export const hasInvalidCharacters = (s: string): boolean => {
  return /[""!#¤%=?`´^¨~*:;£${[\]}|§€><\|]/.test(s);
};

/**
 * Returnerer en streng med uppercase på første bokstav
 * @param s - streng å konvertere
 */
export const capitalize = (s: string): string => {
  const capitalized: string = s.charAt(0).toUpperCase() + s.substring(1);
  return capitalized;
};

/**
 * Returnerer en streng uten uppercase på første bokstav
 * @param s - streng å konvertere
 */
export const decapitalize = (s: string): string => {
  const decapitalized: string = s.charAt(0).toLowerCase() + s.substring(1);
  return decapitalized;
};

/**
 * Returns true if the input corresponds with a norwegian phone number format
 * @param phoneNumber - string or number of the phone number
 */
export const isNorwegianPhoneNumber = (phoneNumber: string | number): boolean => {
  const regexString = '^(0047|[+]47)?[4|9][0-9]{7,7}$';
  return new RegExp(regexString, 'i').test(phoneNumber.toString().replace(new RegExp(' ', 'g'), ''));
};

/**
 * Returns a new string where plaeholders {number} have been replaced by items
 * ex: 'my string {0} ' where 0 will be replaced by the first element in  args array
 * Note: The order of elements in string decide what order it should be replaced, not number!
 * @param s - string to format
 * @param args is a array in order you want them replaced ex: ['foo', 'bar']
 * @param allowEmptyStrings if '' is allowed or not
 */
export const format = (s: string, args: string[], allowEmptyStrings?: boolean): string => {
  return s.replace(/{(\d+)}/g, function replace(match: string, number: number): string {
    if (allowEmptyStrings) {
      return args[number];
    }
    return args[number] ? args[number] : match;
  });
};

const regexEmoticonsRule =
  /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

/**
 * Returns en Array med alle html tags som er funnet i en string <...></...>
 * @param s - string som skal sjekkes
 */
export const invalidNodes = (s: string): string[] => {
  const tagsMatches = unescapeHtmlEntities(unescapeHexEntities(s)).match(/<.*?>/g);
  const tags = tagsMatches ? tagsMatches.map(i => i.toString()) : [];

  const emoticonsMatches = s.match(regexEmoticonsRule);
  const emoticons = emoticonsMatches ? emoticonsMatches.map(i => i.toString()) : [];

  return tags.concat(emoticons);
};

/**
 * Returns true når strengen ikke inneholder emoticon og tags
 * @param s - string som skal sjekkes
 */
export const isValid = (s: string): boolean => {
  return (
    !/<.*?>/g.test(s) &&
    !regexEmoticonsRule.test(s) &&
    !/<.*?>/g.test(unescapeHtmlEntities(s)) &&
    !/<.*?>/g.test(unescapeHtmlEntities(unescapeHexEntities(s)))
  );
};
