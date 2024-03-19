import * as React from 'react';

import DOMPurify from 'dompurify';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import AsPdf from './AsPdf';
import { NewValueAction } from '../../../actions/newValue';
import { RenderContextType } from '../../../constants/renderContextType';
import { GlobalState } from '../../../reducers';
import { getGroupItemControl } from '../../../util/group-item-control';
import { getText, getId, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';

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
  children?: React.ReactNode;
}

export const Group = ({
  path,
  item,
  renderContext,
  renderChildrenItems,
  pdf,
  renderDeleteButton,
  repeatButton,
  renderHelpElement,
  id,
  includeSkipLink,
  resources,
  onRenderMarkdown,
  questionnaire,
  renderHelpButton,
  headerTag,
}: GroupProps): JSX.Element => {
  const renderAllItems = (): JSX.Element => {
    const localRenderContextType = getLocalRenderContextType();

    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return renderContextTypeGrid(item);
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
    const myIndex = path.findIndex(p => p.linkId === item.linkId);
    if (myIndex > 0) {
      const directParentLinkId = path[myIndex - 1].linkId;
      return directParentLinkId === renderContext.Owner;
    }

    return false;
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

  const renderContextTypeGrid = (item: QuestionnaireItem): JSX.Element => {
    const columns = getColumns(item);
    const headers = columns.map(c => <th key={item.linkId + '-' + c}>{c}</th>);
    headers.unshift(<th key={item.linkId + 'X'}>{item.text ? item.text : ''}</th>);

    const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
    return (
      <React.Fragment>
        <table id={getId(id)} className="page_refero__grid">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{renderChildrenItems(newRenderContext)}</tbody>
        </table>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </React.Fragment>
    );
  };

  const renderGroup = (): JSX.Element => {
    return (
      <section id={getId(id)} data-sectionname={getHeaderText()}>
        {renderGroupHeader()}
        {renderHelpElement()}
        <div id={`${getId(id)}-navanchor`} className={getClassNames()}>
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

  const getColumns = (item: QuestionnaireItem): Array<string> => {
    // Explicitly define seenColumns as a Record to improve type safety.
    const seenColumns: Record<string, boolean> = {};
    const columns: Array<string> = [];
    if (!item.item || item.item.length === 0) return columns;

    for (const group of item.item) {
      if (group.item && group.item.length > 0) {
        for (const cell of group.item) {
          const key = cell.text || '';
          // Use seenColumns as a map to track seen keys.
          if (seenColumns[key]) continue;

          columns.push(key);
          seenColumns[key] = true; // Mark the key as seen.
        }
      }
    }

    return columns;
  };

  const getLocalRenderContextType = (): RenderContextType => {
    const coding = getGroupItemControl(item);
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
    const coding = getGroupItemControl(item);
    if (coding.length > 0) {
      classNames.push('page_refero__itemControl_' + coding[0].code);
    }

    return classNames.join(' ');
  };

  const getHeaderText = (): string => {
    return renderPrefix(item) + ' ' + getText(item, onRenderMarkdown, questionnaire, resources);
  };

  const renderGroupHeader = (): JSX.Element | null => {
    if (!getText(item, onRenderMarkdown)) {
      return null;
    }

    const HeaderTag = `h${headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const headerText = DOMPurify.sanitize(getHeaderText(), {
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

  return <AsPdf pdf={!!pdf}>{renderAllItems()}</AsPdf>;
};
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
