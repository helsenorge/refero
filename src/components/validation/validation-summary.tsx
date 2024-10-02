import React, { useEffect, useRef } from 'react';

import { useFormContext } from 'react-hook-form';

import { getItemTextFromErrors } from './utils';
import { Resources } from '../../util/resources';
import SafeText from '../referoLabel/SafeText';

import styles from './validationSummary.module.css';

import { GlobalState } from '@/reducers';
import { FormData, FormDefinition, getFormData, getFormDefinition } from '@/reducers/form';
import { useSelector } from 'react-redux';

type Props = {
  resources: Resources;
};

const ValidationSummary = ({ resources }: Props): JSX.Element | null => {
  const formData = useSelector<GlobalState, FormData | null>(state => getFormData(state));
  const formDefinition = useSelector<GlobalState, FormDefinition | null>(state => getFormDefinition(state));

  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const { setFocus, formState } = useFormContext();
  const { submitCount, errors } = formState;
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

  const allErrors = getItemTextFromErrors(errors, formData, formDefinition?.Content?.item);
  return allErrors.length > 0 ? (
    <div ref={errorSummaryRef} data-testid="validation-summary">
      <ul className={styles.validationSummary_list}>
        <h3 className={styles.validationSummary_header}>{resources.validationSummaryHeader}</h3>
        {allErrors &&
          allErrors.map(({ text, fieldName }) => (
            <li data-testid={`summary-element-${text}`} className={styles.validationSummary_listItem} key={fieldName}>
              <button
                data-testid={`summary-button-${text}`}
                className={styles.validationSummary_button}
                onClick={(e): void => handleErrorButtonClicked(e, fieldName)}
              >
                <SafeText as="p" text={text.toString()} />
              </button>
            </li>
          ))}
      </ul>
    </div>
  ) : null;
};

export { ValidationSummary };
export default ValidationSummary;
