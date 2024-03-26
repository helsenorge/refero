import * as React from 'react';

import {sanitize } from 'dompurify';


interface Props {
  subLabelText: string;
}

const SubLabel = ({ subLabelText }: Props): JSX.Element | null => {
  return (
    <span
      className="page_refero__sublabel"
      dangerouslySetInnerHTML={{
        __html: sanitize(subLabelText, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'], }) as unknown as string,
      }}
    />
  );
};

export default SubLabel;
