import * as React from 'react';

import DOMPurify from 'dompurify';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import AsPdf from './AsPdf';
import { getClassNames, getColumns, getHeaderText, getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { NewValueAction } from '../../../actions/newValue';
import { RenderContextType } from '../../../constants/renderContextType';
import { GlobalState } from '../../../reducers';
import { getText, getId } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  answer: QuestionnaireResponseItemAnswer;
  responseItem: QuestionnaireResponseItem;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  includeSkipLink?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  attachmentErrorMessage?: string;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | null;
  repeatButton: JSX.Element;
  id?: string;
  renderContext: RenderContext;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

export const Group = (props: Props): JSX.Element | null => {
  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = props.responseItem !== nextProps.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== nextProps.isHelpOpen;
  //   const repeatButtonHasChanged = props.repeatButton !== nextProps.repeatButton;
  //   const attachmentErrorMessageHasChanged = props.attachmentErrorMessage !== nextProps.attachmentErrorMessage;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(nextProps.resources);

  //   const repeats = props.item.repeats ?? false;
  //   return (
  //     responseItemHasChanged ||
  //     helpItemHasChanged ||
  //     repeatButtonHasChanged ||
  //     attachmentErrorMessageHasChanged ||
  //     resourcesHasChanged ||
  //     repeats
  //   );
  // }
  const {
    pdf,
    renderContext,
    repeatButton,
    id,
    includeSkipLink,
    path,
    renderDeleteButton,
    item,
    questionnaire,
    onRenderMarkdown,
    resources,
    renderHelpElement,
    renderChildrenItems,
  } = props;

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
        {props.renderChildrenItems(renderContext)}
      </tr>
    );
  };

  const renderContextTypeGrid = (): JSX.Element => {
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

  const renderGroup = (): JSX.Element => {
    return (
      <section id={getId(props.id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
        {renderGroupHeader()}
        {renderHelpElement()}
        <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
          {renderChildrenItems(new RenderContext())}
        </div>
        {includeSkipLink && path.length === 1 && (
          <AnchorLink className="page_refero__skiplink" href="#navigator-button">
            {resources?.skipLinkText}
          </AnchorLink>
        )}
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </section>
    );
  };

  const renderGroupHeader = (): JSX.Element | null => {
    const { item, questionnaire, onRenderMarkdown, resources, headerTag, renderHelpButton } = props;

    if (!getText(item, onRenderMarkdown)) {
      return null;
    }

    const HeaderTag = `h${headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const headerText = DOMPurify.sanitize(getHeaderText(item, questionnaire, resources, onRenderMarkdown), {
      RETURN_TRUSTED_TYPE: true,
      ADD_ATTR: ['target'],
    }) as unknown as string;
    return (
      <>
        <HeaderTag className={'page_refero__heading'} dangerouslySetInnerHTML={{ __html: headerText }} />
        {renderHelpButton()}
      </>
    );
  };
  return <AsPdf pdf={!!pdf}>{renderAllItems(item)}</AsPdf>;
};
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
