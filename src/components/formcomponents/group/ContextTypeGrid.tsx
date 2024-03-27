import React from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { getColumns } from './helpers';
import { RenderContextType } from '../../../constants/renderContextType';
import { getId } from '../../../util';
import { RenderContext } from '../../../util/renderContext';

type Props = {
  item: QuestionnaireItem;
  id?: string;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
};

export const ContextTypeGrid = ({ item, id, renderChildrenItems, renderDeleteButton, repeatButton }: Props): JSX.Element => {
  const columns = getColumns(item);
  const headers = columns.map(c => <th key={item.linkId + '-' + c}>{c}</th>);
  headers.unshift(<th key={item.linkId + 'X'}>{item.text ? item.text : ''}</th>);

  const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
  return (
    <>
      <table id={getId(id)} className="page_refero__grid">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{renderChildrenItems(newRenderContext)}</tbody>
      </table>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
    </>
  );
};
