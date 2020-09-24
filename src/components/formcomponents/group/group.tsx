import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import CustomTag from '@helsenorge/core-utils/custom-tag';

import { GlobalState } from '../../../reducers';
import { NewValueAction } from '../../../actions/newValue';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { renderPrefix, getText, getId } from '../../../util/index';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import withCommonFunctions from '../../with-common-functions';
import { Resources } from '../../../util/resources';
import { getGroupItemControl } from '../../../util/group-item-control';
import { RenderContextType } from '../../../constants/renderContextType';
import { RenderContext } from '../../../util/renderContext';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  responseItem: QuestionnaireResponseItem;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
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

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const repeatButtonHasChanged = this.props.repeatButton !== nextProps.repeatButton;
    const resourcesHasChanged = this.props.resources !== nextProps.resources;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || repeatButtonHasChanged || resourcesHasChanged || repeats;
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
      for (let column of renderContext.Columns) {
        let childItem = childItems.find(item => item.text === column);

        if (childItem) {
          renderedChildItems.push(
            <td key={counter} className="page_skjemautfyller__grid--cell">
              {...itemRenderer(childItem, renderContext)}
            </td>
          );
        } else {
          renderedChildItems.push(
            <td key={counter} className="page_skjemautfyller__grid--cell page_skjemautfyller__grid--cell-empty">
              &nbsp;
            </td>
          );
        }

        counter++;
      }

      return renderedChildItems;
    };

    return (
      <tr key={item.linkId} className="page_skjemautfyller__grid--row">
        <td className="page_skjemautfyller__grid--cell page_skjemautfyller__grid--cell-first">{this.renderGroupHeader()}</td>
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
        <table id={getId(this.props.id)} className="page_skjemautfyller__grid">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{this.props.renderChildrenItems(newRenderContext)}</tbody>
        </table>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </React.Fragment>
    );
  };

  renderGroup = (): JSX.Element => {
    return (
      <section id={getId(this.props.id)}>
        {this.renderGroupHeader()}
        {this.props.renderHelpElement()}
        <div className={this.getClassNames()}>{this.props.renderChildrenItems(new RenderContext())}</div>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </section>
    );
  };

  getColumns = (): Array<string> => {
    const item = this.props.item;
    const seenColumns = {};
    const columns: Array<string> = [];
    if (!item.item || item.item.length === 0) return columns;
    for (let group of item.item) {
      if (group.item && group.item.length > 0) {
        for (let cell of group.item) {
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
    var coding = getGroupItemControl(this.props.item);
    if (coding.length > 0) {
      switch (coding[0].code) {
        case 'grid':
          return RenderContextType.Grid;
      }
    }
    return RenderContextType.None;
  };

  getClassNames = (): string => {
    const classNames = ['page_skjemautfyller__component', 'page_skjemautfyller__component_group'];
    const coding = getGroupItemControl(this.props.item);
    if (coding.length > 0) {
      classNames.push('page_skjemautfyller__itemControl_' + coding[0].code);
    }

    return classNames.join(' ');
  };

  getComponentToValidate = (): undefined => {
    return undefined;
  };

  renderGroupHeader = (): JSX.Element | null => {
    if (!getText(this.props.item, this.props.onRenderMarkdown)) {
      return null;
    }
    const tagName = `h${this.props.headerTag}`;
    return (
      <React.Fragment>
        <CustomTag tagName={tagName} className={'page_skjemautfyller__heading'}>
          {renderPrefix(this.props.item) + ' ' + getText(this.props.item, this.props.onRenderMarkdown)}
        </CustomTag>
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
