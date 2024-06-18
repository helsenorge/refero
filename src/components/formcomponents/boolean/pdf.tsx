import React from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { renderPrefix, getText } from '../../../util/index';

interface Props {
  item: QuestionnaireItem;
  checked: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const pdf = ({ item, checked, children, onRenderMarkdown }: Props): JSX.Element => {
  return (
    <div>
      {/* eslint-disable react/jsx-no-literals */}
      {checked ? (
        <b data-testid={`item_${item.linkId}-pdf`}>[ X ]</b>
      ) : (
        <b data-testid={`item_${item.linkId}-pdf`}>[&nbsp;&nbsp;&nbsp;&nbsp;]</b>
      )}{' '}
      {`${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`}
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
