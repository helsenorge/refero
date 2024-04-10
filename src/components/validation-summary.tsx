import React from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { Resources } from '../util/resources';

interface ValidationSummaryProps {
  resources: Resources;
  errors: FieldErrors<FieldValues>;
}

export const ValidationSummary = ({ errors, resources }: ValidationSummaryProps) => {
  const errorArray = Object.entries(errors);
  return (
    <>
      {errorArray && errorArray.length && (
        <div style={{ backgroundColor: 'red' }}>
          {console.log('yo')}
          <ol style={{ listStyle: 'none', padding: 20, margin: 0 }}>
            <p style={{ padding: '0', margin: 0 }}>{resources.validationSummaryHeader}</p>
            {errorArray &&
              errorArray.map(([fieldName, error], index) => (
                <li key={fieldName + index.toString()}>
                  <a>{error?.message}</a>
                </li>
              ))}
          </ol>
        </div>
      )}
    </>
  );
};
