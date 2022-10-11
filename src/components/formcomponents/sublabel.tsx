import * as React from 'react';

import DOMPurify from 'dompurify';

interface Props {
  subLabelText: string;
}

const SubLabel = ({ subLabelText }: Props): JSX.Element | null => {
  return (
    <span
      className="page_refero__sublabel"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(subLabelText, { RETURN_TRUSTED_TYPE: true }) as unknown as string,
      }}
    />
  );
};

export default SubLabel;
