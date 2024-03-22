import React from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { GroupHeader } from './GroupHeader';
import { RenderContext } from '../../../util/renderContext';
type Props = {
  renderContext: RenderContext;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  item: QuestionnaireItem;
  headerTag?: number;
  renderHelpButton: () => JSX.Element;
  headerText: string;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
};

export const ContextTypeGridRow = ({
  renderContext,
  renderChildrenItems,
  item,
  headerTag,
  headerText,
  renderHelpButton,
  onRenderMarkdown,
}: Props): JSX.Element => {
  renderContext.RenderChildren = (
    childItems: QuestionnaireItem[],
    itemRenderer: (item: QuestionnaireItem, renderContext: RenderContext) => Array<JSX.Element | undefined>
  ): JSX.Element[] => {
    const renderedChildItems = [];
    let counter = 1;
    for (const column of renderContext.Columns) {
      const childItem = childItems.find(item => item.text === column);

      if (childItem) {
        renderedChildItems.push(
          <td key={counter} className="page_refero__grid--cell">
            {itemRenderer(childItem, renderContext)}
          </td>
        );
      } else {
        renderedChildItems.push(<td key={counter} className="page_refero__grid--cell page_refero__grid--cell-empty">{` `}</td>);
      }

      counter++;
    }

    return renderedChildItems;
  };

  return (
    <tr key={item.linkId} className="page_refero__grid--row">
      <td className="page_refero__grid--cell page_refero__grid--cell-first">
        <GroupHeader
          headerTag={headerTag}
          item={item}
          renderHelpButton={renderHelpButton}
          text={headerText}
          onRenderMarkdown={onRenderMarkdown}
        />
      </td>
      {renderChildrenItems(renderContext)}
    </tr>
  );
};
