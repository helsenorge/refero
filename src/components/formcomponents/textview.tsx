import * as React from 'react';

import DOMPurify from 'dompurify';

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
      <b
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(`${renderPrefix(item)} ${getText(item, onRenderMarkdown)} `, {
            RETURN_TRUSTED_TYPE: true,
          }) as unknown as string,
        }}
      />
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
