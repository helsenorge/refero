import React from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { Resources } from '../util/resources';
import { palette } from '@helsenorge/designsystem-react/theme/palette';

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
      <ol
        style={{
          listStyle: 'none',
          padding: '30px 60px',
          margin: 0,
          backgroundColor: palette.cherry100,
          borderLeft: `4px solid ${palette.cherry600}`,
        }}
      >
        <h3 style={{ padding: '0', marginBottom: '1.5rem', fontWeight: 400, fontSize: '1.375rem' }}>{resources.validationSummaryHeader}</h3>
        {errorArray &&
          errorArray.map(([fieldName, error], index) => (
            <li style={{ marginTop: '1rem' }} key={fieldName + index.toString()}>
              <a href={`#${fieldName}-wrapper`} style={{ color: palette.cherry600, fontSize: '1.125rem', fontWeight: '400' }}>
                {error?.message}
              </a>
            </li>
          ))}
      </ol>
    );
};
