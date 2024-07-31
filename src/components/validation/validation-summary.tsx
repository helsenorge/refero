import React, { useEffect, useRef } from 'react';

import { useFormContext } from 'react-hook-form';

import { getItemTextFromErrors } from './utils';
import { Resources } from '../../util/resources';
import SafeText from '../referoLabel/SafeText';

import styles from './validationSummary.module.css';

import { GlobalState } from '@/reducers';
import { getFormData, getFormDefinition } from '@/reducers/form';
import { useSelector } from 'react-redux';

type Props = {
  resources: Resources;
};

const ValidationSummary = ({ resources }: Props): JSX.Element | null => {
  const { formDefinition, formData } = useSelector((state: GlobalState) => ({
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  }));
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const { setFocus, formState } = useFormContext();
  const { submitCount, errors } = formState;
  const errorArray = Object.entries(errors);

  const handleErrorButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, fieldName: string): void => {
    e.preventDefault();
    setFocus(fieldName, {
      shouldSelect: true,
    });
  };

  useEffect(() => {
    if (errorSummaryRef && errorSummaryRef.current && submitCount > 0 && Object.keys(errors).length > 0) {
      errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [submitCount, errors]);
  const allErrors = getItemTextFromErrors(errors, formData, formDefinition);
  return errorArray.length > 0 ? (
    <div ref={errorSummaryRef} data-testid="validation-summary">
      <ul className={styles.validationSummary_list}>
        <h3 className={styles.validationSummary_header}>{resources.validationSummaryHeader}</h3>
        {errorArray &&
          allErrors.map(({ text, fieldName }) => (
            <li data-testid={`summary-element-${text}`} className={styles.validationSummary_listItem} key={fieldName}>
              <button
                data-testid={`summary-button-${text}`}
                className={styles.validationSummary_button}
                onClick={(e): void => handleErrorButtonClicked(e, fieldName)}
              >
                <SafeText text={text} />
              </button>
            </li>
          ))}
      </ul>
    </div>
  ) : null;
};

export { ValidationSummary };
export default ValidationSummary;
