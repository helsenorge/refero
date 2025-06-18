import { useEffect, useRef } from "react";

const focusableElements = 'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';

export const useSetFocusOnFirstElement = (stepIndex: number): React.RefObject<HTMLDivElement> => {
    const containerRef = useRef<HTMLDivElement>(null);

    const focusOnFirstElementInStep = (): void => {
    if (containerRef.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(focusableElements);

      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  useEffect(() => {
    focusOnFirstElementInStep();
  }, [stepIndex])

  return containerRef;
}