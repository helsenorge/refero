import React, { useEffect, useRef } from 'react';

import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';

import { Resources } from '../../util/resources';

import styles from './validationSummary.module.css';

interface ValidationSummaryProps {
  resources: Resources;
  errors: FieldErrors<FieldValues>;
}

export const ValidationSummary = ({ errors, resources }: ValidationSummaryProps): JSX.Element | null => {
  const errorArray = Object.entries(errors);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const { setFocus, formState } = useFormContext();
  const { submitCount } = formState;
  const handleErrorButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, fieldName: string): void => {
    e.preventDefault();
    setFocus(fieldName);
  };

  useEffect(() => {
    if (errorSummaryRef && errorSummaryRef.current && submitCount > 0 && Object.keys(errors).length > 0) {
      errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [submitCount, errors]);

  return errorArray.length > 0 ? (
    <div ref={errorSummaryRef}>
      <ol className={styles.validationSummary_list}>
        <h3 className={styles.validationSummary_header}>{resources.validationSummaryHeader}</h3>
        {errorArray &&
          errorArray.map(([fieldName]) => (
            <li className={styles.validationSummary_listItem} key={fieldName}>
              <button className={styles.validationSummary_button} onClick={(e): void => handleErrorButtonClicked(e, fieldName)}>
                {fieldName}
              </button>
            </li>
          ))}
      </ol>
    </div>
  ) : null;
};
