import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import AsPdf from './AsPdf';
import { getClassNames, getColumns, getHeaderText, getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { RenderContextType } from '@/constants/renderContextType';
import { getText, getId } from '@/util/index';
import { Path } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { Resources } from '@/util/resources';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpElement from '@/components/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/help-button/RenderHelpButton';
import { useState } from 'react';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { GlobalState } from '@/reducers';
import SafeText from '@/components/referoLabel/SafeText';

export interface Props extends WithCommonFunctionsAndEnhancedProps {
  item: QuestionnaireItem;
  path: Array<Path>;
  includeSkipLink?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  attachmentErrorMessage?: string;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | null;
  id?: string;
  renderContext: RenderContext;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
}

export const Group = ({
  pdf,
  renderContext,
  id,
  includeSkipLink,
  path,
  item,
  questionnaire,
  resources,
  renderChildrenItems,
  headerTag,
  index,
  responseItem,
  responseItems,
  onAnswerChange,
}: Props): JSX.Element | null => {
  const enable = useIsEnabled(item, path);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { onRenderMarkdown } = useExternalRenderContext();
  const renderAllItems = (item: QuestionnaireItem): JSX.Element => {
    const localRenderContextType = getLocalRenderContextType(item);

    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return renderContextTypeGrid();
      }
    }

    switch (renderContext.RenderContextType) {
      case RenderContextType.Grid:
        return isDirectChildOfRenderContextOwner(path, item, renderContext) ? renderContextTypeGridRow() : renderGroup();
      default:
        return renderGroup();
    }
  };

  const renderContextTypeGridRow = (): JSX.Element => {
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
        <td className="page_refero__grid--cell page_refero__grid--cell-first">{renderGroupHeader()}</td>
        {renderChildrenItems(renderContext)}
      </tr>
    );
  };

  const renderContextTypeGrid = (): JSX.Element => {
    const columns = getColumns(item);
    const headers = columns.map((c, i) => <th key={`${item.linkId}-${c}-${i}`}>{c}</th>);
    headers.unshift(<th key={`${item.linkId}-X`}>{item.text ? item.text : ''}</th>);

    const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
    return (
      <>
        <table id={getId(id)} className="page_refero__grid">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{renderChildrenItems(newRenderContext)}</tbody>
        </table>
        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
          onAnswerChange={onAnswerChange}
          renderContext={renderContext}
          responseItem={responseItem}
          resources={resources}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton
          item={item}
          index={index}
          path={path.slice(0, -1)}
          resources={resources}
          responseItem={responseItem}
          responseItems={responseItems}
        />
      </>
    );
  };

  const renderGroup = (): JSX.Element => {
    return (
      <section id={getId(id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
        {renderGroupHeader && renderGroupHeader()}
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
          {renderChildrenItems(new RenderContext())}
        </div>
        {includeSkipLink && path.length === 1 && (
          <AnchorLink className="page_refero__skiplink" href="#navigator-button">
            {resources?.skipLinkText}
          </AnchorLink>
        )}
        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
          onAnswerChange={onAnswerChange}
          renderContext={renderContext}
          responseItem={responseItem}
          resources={resources}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton
          item={item}
          index={index}
          path={path.slice(0, -1)}
          resources={resources}
          responseItem={responseItem}
          responseItems={responseItems}
        />
      </section>
    );
  };

  const renderGroupHeader = (): JSX.Element | null => {
    if (!getText(item, onRenderMarkdown)) {
      return null;
    }

    const HeaderTag = `h${headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const headerText = getHeaderText(item, questionnaire, resources, onRenderMarkdown);
    return (
      <>
        <SafeText as={HeaderTag} text={headerText} className={'page_refero__heading'} />
        <RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />
      </>
    );
  };
  if (!enable) {
    return null;
  }
  return <AsPdf pdf={!!pdf}>{renderAllItems(item)}</AsPdf>;
};
const withCommonFunctionsComponent = withCommonFunctions(Group);
export default withCommonFunctionsComponent;
