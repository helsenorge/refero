import * as React from 'react';
import { renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem } from '../../../types/fhir';

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
