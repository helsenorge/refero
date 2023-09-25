import { FormChild } from "./formChild";

export interface ValidationProps {
  addFormComponent?: (component: FormChild) => void;
  removeFormComponent?: (component: FormChild) => void;
  onValidated?: (valid: boolean | undefined) => void;
  isSubmitted?: (isSubmitted: boolean | undefined) => void;
  optionalLabel?: string;
  requiredLabel?: string;
  showOptionalLabel?: boolean;
  showRequiredLabel?: boolean;
  /** Component som skal valideres */
  children?: JSX.Element;
  /** ref (callback function) forwarded when nested validating */
  refCallback?: (el: FormChild) => void;
}