import { useEffect, useRef } from 'react';

import type { FormViewChange } from '@/types/referoProps';

export const useFormViewChange = (onFormViewChange?: FormViewChange, stepIndex?: number): React.Ref<HTMLDivElement> => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (onFormViewChange) {
      onFormViewChange(containerRef.current, stepIndex);
    }
  }, [stepIndex]);

  return containerRef;
};
