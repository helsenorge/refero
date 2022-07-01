import * as React from 'react';

interface Props {
  subLabelText: string;
}

const SubLabel = ({ subLabelText }: Props): JSX.Element | null => {
  return (
    <span
      className="page_refero__sublabel"
      dangerouslySetInnerHTML={{
        __html: subLabelText,
      }}
    />
  );
};

export default SubLabel;
