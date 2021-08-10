import * as React from 'react';

import { QuestionnaireItem } from '../../types/fhir';

import { renderPrefix, getText, getId } from '../../util/index';

interface Props {
  id?: string;
  item: QuestionnaireItem;
  value?: string | number;
  textClass?: string;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const textView: React.SFC<Props> = ({ id, item, value, textClass, children, onRenderMarkdown }) => {
  return (
    <div id={getId(id)}>
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
