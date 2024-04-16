import React from 'react';
import { FieldErrors, FieldValues, useForm, useFormContext } from 'react-hook-form';
import { Resources } from '../util/resources';
import {
  validationSummaryHeader,
  validationSummaryButton,
  validationSummaryList,
  validationSummaryListItem,
} from '../styles/validationSummaryStyles';

interface ValidationSummaryProps {
  resources: Resources;
  errors: FieldErrors<FieldValues>;
}

export const ValidationSummary = ({ errors, resources }: ValidationSummaryProps) => {
  const errorArray = Object.entries(errors);

  const { setFocus } = useFormContext();

  const handleErrorButtonClicked = (fieldName: string) => {
    setFocus(fieldName);
  }

  if (!errorArray.length) {
    return <></>;
  } else
    return (
      <>
        <style>
          {validationSummaryList}
          {validationSummaryHeader}
          {validationSummaryListItem}
          {validationSummaryButton}
        </style>
        <ol className="validationSummary_list">
          <h3 className="validationSummary_header">{resources.validationSummaryHeader}</h3>
          {errorArray &&
            errorArray.map(([fieldName, error], index) => (
              <li className="validationSummary_listItem" key={fieldName + index.toString()}>
                <button className="validationSummary_button" onClick={() => handleErrorButtonClicked(fieldName)}>
                  {error?.message}
                </button>
              </li>
            ))}
        </ol>
      </>
    );
};
