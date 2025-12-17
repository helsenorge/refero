import type { Extension } from 'fhir/r4';

export interface Options {
  id?: string;
  type: string;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  content?: JSX.Element;
  hjelpetrigger?: JSX.Element;
  extensions?: Extension[];
}
