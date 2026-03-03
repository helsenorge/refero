import type React from 'react';

import type { RenderContext } from '@/util/renderContext';
import type { QuestionnaireItem } from 'fhir/r4';

import GroupHeader from './GroupHeader';

import GenerateQuestionnaireComponents, {
  type QuestionnaireComponentItemProps,
} from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';

type ContextTypeGridRowProps = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
const ContextTypeGridRow = ({ isHelpVisible, setIsHelpVisible, ...rest }: ContextTypeGridRowProps): React.JSX.Element => {
  const { renderContext, headerTag, linkId } = rest;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const { resources } = useExternalRenderContext();
  const renderChildren = (
    childItems: QuestionnaireItem[],
    itemRenderer: (item: QuestionnaireItem, renderContext: RenderContext) => React.JSX.Element | null
  ): React.JSX.Element[] => {
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
    <tr key={item?.linkId} className="page_refero__grid--row">
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
