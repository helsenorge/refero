import type React from 'react';

import type { Extension } from 'fhir/r4';

export interface Options {
  id?: string;
  type: string;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  content?: React.JSX.Element;
  hjelpetrigger?: React.JSX.Element;
  extensions?: Extension[];
}
