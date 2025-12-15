import { useEffect, useRef } from 'react';

export const useSetFocusOnFirstElement = (stepIndex: number): React.RefObject<HTMLDivElement> => {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusOnContainer = (): void => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  useEffect(() => {
    //Setting focus on the first step is not desirable
    if (stepIndex !== 0) {
      focusOnContainer();
    }
  }, [stepIndex]);

  return containerRef;
};
