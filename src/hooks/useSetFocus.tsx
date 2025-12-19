import { useEffect, useRef } from 'react';

import type { FocusHandler } from '@/types/referoProps';

export const useSetFocus = (focusHandler?: FocusHandler, isStepView?: boolean, stepIndex?: number): React.Ref<HTMLDivElement> => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    //Focus handling in normal view
    if (!isStepView && focusHandler && containerRef.current) {
      focusHandler(containerRef.current);
    }

    //Focus handling in step-view
    if (isStepView && focusHandler) {
      focusHandler(containerRef.current);
      //Default behavior in step-view. Setting focus on the first step is not desirable.
    } else if (isStepView && stepIndex !== 0) {
      containerRef.current?.focus();
    }
  }, [stepIndex]);

  return containerRef;
};
