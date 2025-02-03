import React, { useMemo } from 'react';

import { Resource, QuestionnaireItem } from 'fhir/r4';
import { useSelector } from 'react-redux';

import ItemRenderer from './ItemRenderer';

import { languageSelector, questionnaireSelector } from '@/reducers/selectors';
import { getNavigatorExtension } from '@/util/extension';
import { Path } from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';



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
  items?: QuestionnaireItem[];
  path?: Path[];
  pdf?: boolean;
  renderContext?: RenderContext;
  headerTag?: number;
  isNavigatorEnabled?: boolean;
  containedResources?: Resource[];
};

const GenerateQuestionnaireComponents = (props: QuestionnaireItemsProps): JSX.Element | null => {
  const { items, path, pdf = false, renderContext, headerTag } = props;

  const renderContextValue = useMemo(() => renderContext || new RenderContext(), [renderContext]);
  const language = useSelector(languageSelector);
  const questionnaire = useSelector(questionnaireSelector);
  const containedResources = useMemo(() => questionnaire?.contained, [questionnaire]);
  const isNavigatorEnabled = useMemo(() => !!getNavigatorExtension(questionnaire), [questionnaire]);

  if (!items) {
    return null;
  }

  return (
    <>
      {items.map(item => (
        <ItemRenderer
          key={item.linkId}
          item={item}
          path={path}
          renderContextValue={renderContextValue}
          language={language}
          containedResources={containedResources}
          pdf={pdf}
          isNavigatorEnabled={isNavigatorEnabled}
          headerTag={headerTag}
        />
      ))}
    </>
  );
};

export default GenerateQuestionnaireComponents;
