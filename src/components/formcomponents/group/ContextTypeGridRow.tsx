import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import GroupHeader from './GroupHeader';
import { RenderContext } from '@/util/renderContext';
import { Dispatch } from 'react';
import { Resources } from '@/util/resources';

type ContextTypeGridRowProps = {
  item: QuestionnaireItem;
  renderContext: RenderContext;
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | null;
  headerTag?: number;
  questionnaire?: Questionnaire | null;
  resources?: Resources;
};
const ContextTypeGridRow = ({
  isHelpVisible,
  item,
  renderChildrenItems,
  renderContext,
  setIsHelpVisible,
  headerTag,
  questionnaire,
  resources,
}: ContextTypeGridRowProps): JSX.Element => {
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
          isHelpVisible={isHelpVisible}
          setIsHelpVisible={setIsHelpVisible}
          item={item}
          questionnaire={questionnaire}
          resources={resources}
        />
      </td>
      {renderChildrenItems(renderContext)}
    </tr>
  );
};
export default ContextTypeGridRow;
