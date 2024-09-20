import { QuestionnaireItem } from 'fhir/r4';
import GroupHeader from './GroupHeader';
import { RenderContext } from '@/util/renderContext';
import React, { Dispatch } from 'react';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import GenerateQuestionnaireComponents from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

type ContextTypeGridRowProps = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const ContextTypeGridRow = ({ isHelpVisible, setIsHelpVisible, ...rest }: ContextTypeGridRowProps): JSX.Element => {
  const { item, resources, renderContext, headerTag } = rest;
  const renderChildren = (
    childItems: QuestionnaireItem[],
    itemRenderer: (item: QuestionnaireItem, renderContext: RenderContext) => JSX.Element | null
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
          isHelpVisible={isHelpVisible}
          setIsHelpVisible={setIsHelpVisible}
          item={item}
          resources={resources}
        />
      </td>
      {item?.item &&
        renderChildren(item?.item, (childItem, context) => (
          <GenerateQuestionnaireComponents {...rest} items={[childItem]} renderContext={context} />
        ))}
    </tr>
  );
};
export default ContextTypeGridRow;
