import * as React from 'react';

import DOMPurify from 'dompurify';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import { NewValueAction } from '../../../actions/newValue';
import { RenderContextType } from '../../../constants/renderContextType';
import { GlobalState } from '../../../reducers';
import { getGroupItemControl } from '../../../util/group-item-control';
import { renderPrefix, getText, getId } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
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

  renderAllItems = (): JSX.Element => {
    const { renderContext } = this.props;
    const localRenderContextType = this.getLocalRenderContextType();

    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return this.renderContextTypeGrid();
      }
    }

    switch (renderContext.RenderContextType) {
      case RenderContextType.Grid:
        return this.isDirectChildOfRenderContextOwner() ? this.renderContextTypeGridRow() : this.renderGroup();
      default:
        return this.renderGroup();
    }
  };

  isDirectChildOfRenderContextOwner = (): boolean => {
    const { path, item, renderContext } = this.props;

    const myIndex = path.findIndex(p => p.linkId === item.linkId);
    if (myIndex > 0) {
      const directParentLinkId = path[myIndex - 1].linkId;
      return directParentLinkId === renderContext.Owner;
    }

    return false;
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
    const { item } = this.props;

    const columns = this.getColumns();
    const headers = columns.map(c => <th key={item.linkId + '-' + c}>{c}</th>);
    headers.unshift(<th key={item.linkId + 'X'}>{item.text ? item.text : ''}</th>);

    const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
    return (
      <React.Fragment>
        <table id={getId(this.props.id)} className="page_refero__grid">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{this.props.renderChildrenItems(newRenderContext)}</tbody>
        </table>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
      </React.Fragment>
    );
  };

  renderGroup = (): JSX.Element => {
    return (
      <section id={getId(this.props.id)} data-sectionname={this.getHeaderText()}>
        {this.renderGroupHeader()}
        {this.props.renderHelpElement()}
        <div id={`${getId(this.props.id)}-navanchor`} className={this.getClassNames()}>
          {this.props.renderChildrenItems(new RenderContext())}
        </div>
        {this.props.includeSkipLink && this.props.path.length === 1 && (
          <AnchorLink className="page_refero__skiplink" href="#navigator-button">
            {this.props.resources?.skipLinkText}
          </AnchorLink>
        )}
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
      </section>
    );
  };

  getColumns = (): Array<string> => {
    const item = this.props.item;
    const seenColumns = {};
    const columns: Array<string> = [];
    if (!item.item || item.item.length === 0) return columns;
    for (const group of item.item) {
      if (group.item && group.item.length > 0) {
        for (const cell of group.item) {
          const key = cell.text || '';
          if (key in seenColumns) continue;

          columns.push(key);
          seenColumns[key] = 1;
        }
      }
    }

    return columns;
  };

  getLocalRenderContextType = (): RenderContextType => {
    const coding = getGroupItemControl(this.props.item);
    if (coding.length > 0) {
      switch (coding[0].code) {
        case 'grid':
          return RenderContextType.Grid;
      }
    }
    return RenderContextType.None;
  };

  getClassNames = (): string => {
    const classNames = ['page_refero__component', 'page_refero__component_group'];
    const coding = getGroupItemControl(this.props.item);
    if (coding.length > 0) {
      classNames.push('page_refero__itemControl_' + coding[0].code);
    }

    return classNames.join(' ');
  };

  getComponentToValidate = (): undefined => {
    return undefined;
  };

  getHeaderText = (): string => {
    return (
      renderPrefix(this.props.item) +
      ' ' +
      getText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources)
    );
  };

  renderGroupHeader = (): JSX.Element | null => {
    if (!getText(this.props.item, this.props.onRenderMarkdown)) {
      return null;
    }

    const HeaderTag = `h${this.props.headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const headerText = DOMPurify.sanitize(this.getHeaderText(), {
      RETURN_TRUSTED_TYPE: true,
      ADD_ATTR: ['target'],
    }) as unknown as string;
    return (
      <React.Fragment>
        <HeaderTag className={'page_refero__heading'} dangerouslySetInnerHTML={{ __html: headerText }} />
        {this.props.renderHelpButton()}
      </React.Fragment>
    );
  };

  render(): JSX.Element | null {
    const { pdf } = this.props;

    if (pdf) {
      return <div>{this.renderAllItems()}</div>;
    }

    return this.renderAllItems();
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
