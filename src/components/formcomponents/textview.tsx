import * as React from 'react';
import { renderPrefix, getText } from '../../util/index';
import { QuestionnaireItem } from '../../types/fhir';

interface Props {
  item: QuestionnaireItem;
  value?: string | number;
  textClass?: string;
}

const textView: React.SFC<Props> = ({ item, value, textClass, children }) => {
  return (
    <div>
      <b dangerouslySetInnerHTML={{ __html: `${renderPrefix(item)} ${getText(item)} ` }} />
      <div className={textClass || ''}>{value}</div>
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
