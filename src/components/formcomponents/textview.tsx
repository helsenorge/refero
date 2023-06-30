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
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
}

const textView: React.SFC<Props> = ({ id, item, value, textClass, children, onRenderMarkdown, helpButton, helpElement }) => {
  return (
    <div id={getId(id)}>
      <>
        <b
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(`${renderPrefix(item)} ${getText(item, onRenderMarkdown)} `, {
              RETURN_TRUSTED_TYPE: true,
              ADD_ATTR: ['target'],
            }) as unknown as string,
          }}
        />
        <>{helpButton}</>
        <>{helpElement}</>
      </>
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
