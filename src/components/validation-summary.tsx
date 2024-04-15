import React from 'react';
import { FieldErrors, FieldValues, useForm, useFormContext } from 'react-hook-form';
import { Resources } from '../util/resources';
import {
  validationSummaryHeader,
  validationSummaryLink,
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

  const doStuff = (enString: string) => {
    setFocus(enString);
    console.log(enString);
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
          {validationSummaryLink}
        </style>
        <ol className="validationSummary_list">
          <h3 className="validationSummary_header">{resources.validationSummaryHeader}</h3>
          {errorArray &&
            errorArray.map(([fieldName, error], index) => (
              <li className="validationSummary_listItem" key={fieldName + index.toString()}>
                {console.log(error)}
                <a className="validationSummary_link" onClick={() => doStuff(fieldName)}>
                  {/*TODO: remove index.toString when error message actually displays something*/}
                  {error?.message + index.toString()}
                </a>
              </li>
            ))}
        </ol>
      </>
    );
};
