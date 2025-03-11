export const ReferoButtonTypes = {
  Cancel: '1',
  Submit: '2',
  Save: '3',
  ProceedInternal: '4',
  ProceedExternal: '5',
  Close: '6',
  Forward: '7',
  Back: '8',
} as const;

// Create a type that represents the keys of ReferoButtonTypes
type ReferoButtonTypes = typeof ReferoButtonTypes;

export const ButtonExtensionCodeValue = {
  button: 'button',
} as const;

export type BUTTON_CODES_KEYS = keyof typeof ButtonExtensionCodeValue;
export type BUTTON_CODES_VALUES = (typeof ButtonExtensionCodeValue)[BUTTON_CODES_KEYS];
