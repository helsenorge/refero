export interface FormChild extends Element {
  label?: string;
  legend?: string;
  validateField: () => Promise<void>;
  isValid: () => boolean;
  getWrappedInstance: () => FormChild;
  getText: () => string;
  getId: () => string;
  notifyValidated?: (valid: boolean) => void;
  props: FormChildProps;
}
export interface FormChildProps extends Element {
  id: string;
  key: string;
  label?: string;
  legend?: string;
  requiredLabel?: string;
  optionalLabel?: string;
  validateField?: () => Promise<void>;
  isValid?: () => boolean;
  isRequired?: boolean;
  /** Optional ref som overskriver lokal ref*/
  ref?: React.RefObject<HTMLButtonElement>;
}