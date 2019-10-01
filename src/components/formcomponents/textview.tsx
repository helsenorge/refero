import * as React from 'react';
import { renderPrefix, getText } from '../../util/index';
import { QuestionnaireItem } from '../../types/fhir';

interface Props {
  item: QuestionnaireItem;
  value?: string | number;
}

const textView: React.SFC<Props> = ({ item, value, children }) => {
  return (
    <div>
      <b dangerouslySetInnerHTML={{ __html: `${renderPrefix(item)} ${getText(item)} ` }} />
      <div>{value}</div>
      {children ? (
        <span>
          <br />
          {children}
        </span>
      ) : null}
      <br />
      <br />
    </div>
  );
};

export default textView;
