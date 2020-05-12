import * as React from 'react';
import { renderPrefix, getText } from '../../util/index';
import { QuestionnaireItem } from '../../types/fhir';

interface Props {
  item: QuestionnaireItem;
  value?: string | number;
  textClass?: string;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const textView: React.SFC<Props> = ({ item, value, textClass, children, onRenderMarkdown }) => {
  return (
    <div>
      <b dangerouslySetInnerHTML={{ __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)} ` }} />
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
