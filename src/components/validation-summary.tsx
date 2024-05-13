import React, { useRef } from 'react';
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';
import { Resources } from '../util/resources';

import '../styles/validationSummary.scss';

interface ValidationSummaryProps {
  resources: Resources;
  errors: FieldErrors<FieldValues>;
}

export const ValidationSummary = ({ errors, resources }: ValidationSummaryProps) => {
  const errorArray = Object.entries(errors);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const { setFocus, formState } = useFormContext();

  const handleErrorButtonClicked = (fieldName: string) => {
    setFocus(fieldName);
  };

  React.useEffect(() => {
    if (errorArray.length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formState.submitCount]);

  if (errorArray.length === 0) {
    return <></>;
  } else
    return (
      <div ref={errorSummaryRef}>
        <ol className="validationSummary_list">
          <h3 className="validationSummary_header">{resources.validationSummaryHeader}</h3>
          {errorArray &&
            errorArray.map(([fieldName], index) => (
              <li className="validationSummary_listItem" key={fieldName + index.toString()}>
                <button className="validationSummary_button" onClick={() => handleErrorButtonClicked(fieldName)}>
                  {fieldName}
                </button>
              </li>
            ))}
        </ol>
      </div>
    );
};
