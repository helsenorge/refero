import React, { useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { QuestionnaireItem, QuestionnaireResponseItem, Resource } from 'fhir/r4';

import { RenderContext } from '@/util/renderContext';
import { isHiddenItem } from '@/util/index';
import { getCodingTextTableValues, getNavigatorExtension } from '@/util/extension';
import { getFormData, getFormDefinition } from '@/reducers/form';
import { isHelpItem } from '@/util/help';
import { GlobalState } from '@/reducers';
import { Path } from '@/util/refero-core';
import { getComponentForItem } from './utils';
import { RenderResponseItems } from './RenderResponseItems';
import { useCheckIfEnabled } from '@/hooks/useIsEnabled';
import { getFlatMapResponseItemsForItemSelector } from '@/reducers/selectors';

export type QuestionnaireComponentItemProps = {
  containedResources?: Resource[];
  linkId: string;
  headerTag?: number;
  pdf?: boolean;
  language?: string;
  includeSkipLink?: boolean;
  blindzone?: JSX.Element | null;
  path: Path[];
  id: string;
  index: number;
  renderContext: RenderContext;
  idWithLinkIdAndItemIndex: string;
  children?: React.ReactNode;
};

export type QuestionnaireItemsProps = {
  items: QuestionnaireItem[] | undefined;
  path?: Path[];
  pdf?: boolean;
  renderContext?: RenderContext;
  headerTag?: number;
};

const GenerateQuestionnaireComponents = (props: QuestionnaireItemsProps): JSX.Element | null => {
  const { items, path, pdf = false, renderContext = new RenderContext(), headerTag } = props;
  const checkIfEnabled = useCheckIfEnabled();
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state), shallowEqual);
  const formData = useSelector((state: GlobalState) => getFormData(state), shallowEqual);

  const questionnaire = useMemo(() => formDefinition?.Content, [formDefinition]);
  const containedResources = useMemo(() => questionnaire?.contained, [questionnaire]);
  const language = useMemo(() => formData?.Content?.language, [formData]);
  const isNavigatorEnabled = useMemo(() => !!getNavigatorExtension(questionnaire), [questionnaire]);

  if (!items || !questionnaire || questionnaire.item?.length === 0) {
    return null;
  }

  return (
    <>
      {items.map(item => {
        if (isHelpItem(item) || isHiddenItem(item)) {
          return null;
        }

        const ItemComponent = getComponentForItem(item.type, getCodingTextTableValues(item));
        if (!ItemComponent) {
          return null;
        }

        const responseItems = useSelector<GlobalState, QuestionnaireResponseItem[] | undefined>(state =>
          getFlatMapResponseItemsForItemSelector(state, item.linkId, path)
        );
        if (!responseItems || responseItems.length === 0) {
          return null;
        }

        return (
          <RenderResponseItems
            key={item.linkId}
            item={item}
            responseItems={responseItems}
            path={path}
            ItemComponent={ItemComponent}
            language={language}
            checkIfEnabled={checkIfEnabled}
            containedResources={containedResources}
            renderContext={renderContext}
            pdf={pdf}
            isNavigatorEnabled={isNavigatorEnabled}
            headerTag={headerTag}
          />
        );
      })}
    </>
  );
};

export default GenerateQuestionnaireComponents;
