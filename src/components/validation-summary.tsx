import React, { useRef } from 'react';

import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';

import styles from '../styles/validationSummary.module.css';
import { Resources } from '../util/resources';

interface ValidationSummaryProps {
  resources: Resources;
  errors: FieldErrors<FieldValues>;
}

export const ValidationSummary = ({ errors, resources }: ValidationSummaryProps): JSX.Element | null => {
  const errorArray = Object.entries(errors);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const { setFocus, formState } = useFormContext();

  const handleErrorButtonClicked = (fieldName: string): void => {
    setFocus(fieldName);
  };

  React.useEffect(() => {
    if (errorArray.length > 0 && errorSummaryRef && errorSummaryRef.current) {
      errorSummaryRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formState.submitCount]);

  if (errorArray.length === 0) {
    return null;
  } else
    return (
      <div ref={errorSummaryRef}>
        <ol className={styles.validationSummary_list}>
          <h3 className={styles.validationSummary_header}>{resources.validationSummaryHeader}</h3>
          {errorArray &&
            errorArray.map(([fieldName], index) => (
              <li className={styles.validationSummary_listItem} key={fieldName + index.toString()}>
                <button className={styles.validationSummary_button} onClick={(): void => handleErrorButtonClicked(fieldName)}>
                  {fieldName}
                </button>
              </li>
            ))}
        </ol>
      </div>
    );
};
