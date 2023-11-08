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
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import { ValidationProps } from '../../../types/formTypes/validation';

export interface GroupProps extends WithCommonFunctionsProps {
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

const Group: React.FC<GroupProps & ValidationProps> = props => {
  // constructor(props: Props) {
  //   super(props);
  // }

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
  //   const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
  //   const repeatButtonHasChanged = this.props.repeatButton !== nextProps.repeatButton;
  //   const attachmentErrorMessageHasChanged = this.props.attachmentErrorMessage !== nextProps.attachmentErrorMessage;
  //   const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);

  //   const repeats = this.props.item.repeats ?? false;

  //   return (
  //     responseItemHasChanged ||
  //     helpItemHasChanged ||
  //     repeatButtonHasChanged ||
  //     attachmentErrorMessageHasChanged ||
  //     resourcesHasChanged ||
  //     repeats
  //   );
  // }

  React.useMemo(() => {
    return (newProps: React.PropsWithChildren<GroupProps & ValidationProps>) => {
      const responseItemHasChanged = props.responseItem !== newProps.responseItem;
      const helpItemHasChanged = props.isHelpOpen !== newProps.isHelpOpen;
      const repeatButtonHasChanged = props.repeatButton !== newProps.repeatButton;
      const attachmentErrorMessageHasChanged = props.attachmentErrorMessage !== newProps.attachmentErrorMessage;
      const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(newProps.resources);

      const repeats = props.item.repeats ?? false;

      return (
        responseItemHasChanged ||
        helpItemHasChanged ||
        repeatButtonHasChanged ||
        attachmentErrorMessageHasChanged ||
        resourcesHasChanged ||
        repeats
      );
    };
  }, [props]);

  const renderAllItems = (): JSX.Element => {
    const { renderContext } = props;
    const localRenderContextType = getLocalRenderContextType();

    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return renderContextTypeGrid();
      }
    }

    switch (renderContext.RenderContextType) {
      case RenderContextType.Grid:
        return isDirectChildOfRenderContextOwner() ? renderContextTypeGridRow() : renderGroup();
      default:
        return renderGroup();
    }
  };

  const isDirectChildOfRenderContextOwner = (): boolean => {
    const { path, item, renderContext } = props;

    const myIndex = path.findIndex(p => p.linkId === item.linkId);
    if (myIndex > 0) {
      const directParentLinkId = path[myIndex - 1].linkId;
      return directParentLinkId === renderContext.Owner;
    }

    return false;
  };

  const renderContextTypeGridRow = (): JSX.Element => {
    const { renderContext, item } = props;

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
    const { item } = props;

    const columns = getColumns();
    const headers = columns.map(c => <th key={item.linkId + '-' + c}>{c}</th>);
    headers.unshift(<th key={item.linkId + 'X'}>{item.text ? item.text : ''}</th>);

    const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
    return (
      <React.Fragment>
        <table id={getId(props.id)} className="page_refero__grid">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{props.renderChildrenItems(newRenderContext)}</tbody>
        </table>
        {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {props.repeatButton}
      </React.Fragment>
    );
  };

  const renderGroup = (): JSX.Element => {
    return (
      <section id={getId(props.id)} data-sectionname={getHeaderText()}>
        {renderGroupHeader()}
        {props.renderHelpElement()}
        <div id={`${getId(props.id)}-navanchor`} className={getClassNames()}>
          {props.renderChildrenItems(new RenderContext())}
        </div>
        {props.includeSkipLink && props.path.length === 1 && (
          <AnchorLink className="page_refero__skiplink" href="#navigator-button">
            {props.resources?.skipLinkText}
          </AnchorLink>
        )}
        {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {props.repeatButton}
      </section>
    );
  };

  const getColumns = (): Array<string> => {
    const item = props.item;
    const seenColumns: Record<string, number> = {};
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

  const getLocalRenderContextType = (): RenderContextType => {
    const coding = getGroupItemControl(props.item);
    if (coding.length > 0) {
      switch (coding[0].code) {
        case 'grid':
          return RenderContextType.Grid;
      }
    }
    return RenderContextType.None;
  };

  const getClassNames = (): string => {
    const classNames = ['page_refero__component', 'page_refero__component_group'];
    const coding = getGroupItemControl(props.item);
    if (coding.length > 0) {
      classNames.push('page_refero__itemControl_' + coding[0].code);
    }

    return classNames.join(' ');
  };

  const getComponentToValidate = (): undefined => {
    return undefined;
  };

  const getHeaderText = (): string => {
    return renderPrefix(props.item) + ' ' + getText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);
  };

  const renderGroupHeader = (): JSX.Element | null => {
    if (!getText(props.item, props.onRenderMarkdown)) {
      return null;
    }

    const HeaderTag = `h${props.headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const headerText = DOMPurify.sanitize(getHeaderText(), {
      RETURN_TRUSTED_TYPE: true,
      ADD_ATTR: ['target'],
    }) as unknown as string;
    return (
      <React.Fragment>
        <HeaderTag className={'page_refero__heading'} dangerouslySetInnerHTML={{ __html: headerText }} />
        {props.renderHelpButton()}
      </React.Fragment>
    );
  };

  const { pdf } = props;

  if (pdf) {
    return <div>{renderAllItems()}</div>;
  }

  return renderAllItems();
};
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
