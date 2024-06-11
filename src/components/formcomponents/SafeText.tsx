import * as React from 'react';

import DOMPurify from 'dompurify';

interface Props {
  text: string;
}

const SafeText = ({ text }: Props): JSX.Element => {
  return (
    <span
      style={{ display: 'inline-block', fontWeight: 'normal', fontSize: '1.25rem', lineHeight: '1.75rem', marginBottom: '-0.5rem' }}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(text, {
          RETURN_TRUSTED_TYPE: true,
          ADD_ATTR: ['target'],
        }) as unknown as string,
      }}
    />
  );
};

export default SafeText;
