import React, { useRef } from 'react';
import { FieldErrors, FieldValues, useForm, useFormContext } from 'react-hook-form';
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
            errorArray.map(([fieldName, error], errorArrayIndex) => (
              <div key={fieldName + errorArrayIndex.toString()}>
                {error?.types &&
                  Object.entries(error?.types).map(([type, typeMessage], typesIndex) => (
                    <li className="validationSummary_listItem" key={fieldName + type + typesIndex.toString()}>
                      {console.log(fieldName + type + typesIndex.toString())}
                      <button className="validationSummary_button" onClick={() => handleErrorButtonClicked(fieldName)}>
                        {typeMessage}
                      </button>
                    </li>
                  ))}
              </div>
            ))}
        </ol>
      </div>
    );
};
