import React from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { Resources } from '../util/resources';
import { palette } from '@helsenorge/designsystem-react/theme/palette';
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
                <a className="validationSummary_link" href={`#${fieldName}`}>
                  {error?.message}
                </a>
              </li>
            ))}
        </ol>
      </>
    );
};
