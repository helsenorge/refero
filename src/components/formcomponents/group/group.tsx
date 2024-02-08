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
import withCommonFunctions from '../../with-common-functions';

export interface Props {
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
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  repeatButton: JSX.Element;
  id?: string;
  renderContext: RenderContext;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}
interface State {
  counter?: number;
}
export class Group extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const repeatButtonHasChanged = this.props.repeatButton !== nextProps.repeatButton;
    const attachmentErrorMessageHasChanged = this.props.attachmentErrorMessage !== nextProps.attachmentErrorMessage;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);

    const repeats = this.props.item.repeats ?? false;
    return (
      responseItemHasChanged ||
      helpItemHasChanged ||
      repeatButtonHasChanged ||
      attachmentErrorMessageHasChanged ||
      resourcesHasChanged ||
      repeats
    );
  }

  renderAllItems = (item: QuestionnaireItem): JSX.Element => {
    const { path, renderContext } = this.props;
    const localRenderContextType = getLocalRenderContextType(item);

    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return this.renderContextTypeGrid();
      }
    }

    switch (renderContext.RenderContextType) {
      case RenderContextType.Grid:
        return isDirectChildOfRenderContextOwner(path, item, renderContext) ? this.renderContextTypeGridRow() : this.renderGroup();
      default:
        return this.renderGroup();
    }
  };

  renderContextTypeGridRow = (): JSX.Element => {
    const { renderContext, item } = this.props;

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
        <td className="page_refero__grid--cell page_refero__grid--cell-first">{this.renderGroupHeader()}</td>
        {this.props.renderChildrenItems(renderContext)}
      </tr>
    );
  };

  renderContextTypeGrid = (): JSX.Element => {
    const { item, renderChildrenItems, repeatButton, renderDeleteButton, id } = this.props;

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

  renderGroup = (): JSX.Element => {
    const {
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
    } = this.props;
    return (
      <section id={getId(this.props.id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
        {this.renderGroupHeader()}
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

  renderGroupHeader = (): JSX.Element | null => {
    const { item, questionnaire, onRenderMarkdown, resources, headerTag, renderHelpButton } = this.props;

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
  render(): JSX.Element | null {
    const { pdf, item } = this.props;
    return <AsPdf pdf={!!pdf}>{this.renderAllItems(item)}</AsPdf>;
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
