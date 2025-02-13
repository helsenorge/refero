import React, { useEffect, useRef } from 'react';

import { useFormContext } from 'react-hook-form';

import { getItemTextFromErrors } from './utils';
import { Resources } from '../../util/resources';
import SafeText from '../referoLabel/SafeText';

import styles from './validationSummary.module.css';

import { useAppSelector } from '@/reducers';
import { getFormData, getFormDefinition } from '@/reducers/form';

type Props = {
  resources: Resources;
};

const ValidationSummary = ({ resources }: Props): JSX.Element | null => {
  const formData = useAppSelector(state => getFormData(state));
  const formDefinition = useAppSelector(state => getFormDefinition(state));

  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const { setFocus, formState } = useFormContext();
  const { submitCount, errors } = formState;
  const handleErrorButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, fieldName: string): void => {
    e.preventDefault();
    e.stopPropagation();
    setFocus(fieldName, {
      shouldSelect: true,
    });
    setTimeout(() => {
      const element = document.querySelector(`[name="${fieldName}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);

        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 0);
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
