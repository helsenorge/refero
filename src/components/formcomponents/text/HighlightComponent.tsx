import React from 'react';

import DOMPurify from 'dompurify';

type HighlightComponentProps = {
  id?: string;
  text: string;
};

export const HighlightComponent = ({ text, id }: HighlightComponentProps): JSX.Element => {
  return (
    <div
      id={id}
      className="page_refero__component page_refero__component_highlight"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(text, {
          RETURN_TRUSTED_TYPE: true,
          ADD_ATTR: ['target'],
        }) as unknown as string,
      }}
    />
  );
};
