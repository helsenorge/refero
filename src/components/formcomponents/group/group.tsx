import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';

import { Resources } from '../../../types/resources';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import AsPdf from './AsPdf';
import { ContextTypeGrid } from './ContextTypeGrid';
import { ContextTypeGridRow } from './ContextTypeGridRow';
import { GroupHeader } from './GroupHeader';
import { getClassNames, getHeaderText, getLocalRenderContextType, isDirectChildOfRenderContextOwner } from './helpers';
import { RenderContextType } from '../../../constants/renderContextType';
import { getId } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';

export interface GroupProps extends WithFormComponentsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  path: Array<Path>;
  pdf?: boolean;
  includeSkipLink?: boolean;
  resources?: Resources;
  headerTag?: number;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | undefined;
  repeatButton: JSX.Element;
  id?: string;
  renderContext: RenderContext;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
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
  const headerText = getHeaderText(item, questionnaire, resources, onRenderMarkdown);
  const localRenderContextType = getLocalRenderContextType(item);

  const renderAllItems = (): JSX.Element => {
    if (localRenderContextType) {
      switch (localRenderContextType) {
        case RenderContextType.Grid:
          return (
            <ContextTypeGrid
              item={item}
              renderChildrenItems={renderChildrenItems}
              renderDeleteButton={renderDeleteButton}
              repeatButton={repeatButton}
              id={id}
            />
          );
      }
    }

    switch (renderContext.RenderContextType) {
      case RenderContextType.Grid:
        return isDirectChildOfRenderContextOwner(path, item, renderContext) ? (
          <ContextTypeGridRow
            renderContext={renderContext}
            headerText={headerText}
            item={item}
            renderChildrenItems={renderChildrenItems}
            renderHelpButton={renderHelpButton}
            headerTag={headerTag}
            onRenderMarkdown={onRenderMarkdown}
          />
        ) : (
          renderGroup()
        );
      default:
        return renderGroup();
    }
  };

  const renderGroup = (): JSX.Element => {
    return (
      <section id={getId(id)} data-sectionname={headerText}>
        <GroupHeader
          headerTag={headerTag}
          item={item}
          renderHelpButton={renderHelpButton}
          text={headerText}
          onRenderMarkdown={onRenderMarkdown}
        />
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

  return <AsPdf pdf={!!pdf}>{renderAllItems()}</AsPdf>;
};
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
