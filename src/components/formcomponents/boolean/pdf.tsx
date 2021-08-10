import * as React from 'react';

import { QuestionnaireItem } from '../../../types/fhir';

import { renderPrefix, getText } from '../../../util/index';

interface Props {
  item: QuestionnaireItem;
  checked: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const pdf: React.SFC<Props> = ({ item, checked, children, onRenderMarkdown }) => {
  return (
    <div>
      {/* eslint-disable react/jsx-no-literals */}
      {checked ? <b>[ X ]</b> : <b>[&nbsp;&nbsp;&nbsp;&nbsp;]</b>} {`${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`}
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

export default pdf;
