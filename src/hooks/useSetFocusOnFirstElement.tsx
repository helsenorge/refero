import { useEffect, useRef } from "react";

const focusableElements = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

export const useSetFocusOnFirstElement = (stepIndex: number) => {
    const stepContainerRef = useRef<HTMLDivElement>(null);

    const focusOnFirstElementInStep = () => {
    if (stepContainerRef.current) {
      const firstFocusable = stepContainerRef.current.querySelector<HTMLElement>(focusableElements);

      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  useEffect(() => {
    focusOnFirstElementInStep();
  }, [stepIndex])

  return stepContainerRef;
}