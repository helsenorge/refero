export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
export function isJsxElement(elm: unknown): elm is JSX.Element {
  return elm instanceof Object && elm.hasOwnProperty('type') && elm.hasOwnProperty('props') && elm !== undefined;
}