import React from 'react';

import Expander from '@helsenorge/designsystem-react/components/Expander';

type Props = {
  renderChildrenWhenClosed: boolean;
  title: string;
  children: React.ReactNode;
  id?: string;
};

export const InlineComponent = ({ renderChildrenWhenClosed, children, title, id }: Props): JSX.Element => {
  return (
    <div id={id} className="page_refero__component page_refero__component_expandabletext">
      <Expander title={title} renderChildrenWhenClosed={renderChildrenWhenClosed}>
        {children}
      </Expander>
    </div>
  );
};
