import { QuestionnaireItem } from 'fhir/r4';
import GroupHeader from './GroupHeader';
import { RenderContext } from '@/util/renderContext';
import { Dispatch } from 'react';
import { RenderChildrenItems, RenderItemProps } from '../renderChildren/RenderChildrenItems';

type ContextTypeGridRowProps = RenderItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const ContextTypeGridRow = (props: ContextTypeGridRowProps): JSX.Element => {
  const { isHelpVisible, setIsHelpVisible, item, resources, renderContext, headerTag, questionnaire } = props;

  renderContext.RenderChildren = (
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
          questionnaire={questionnaire}
          resources={resources}
        />
      </td>
      {<RenderChildrenItems otherProps={props} />}
    </tr>
  );
};
export default ContextTypeGridRow;
