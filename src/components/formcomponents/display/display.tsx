import { memo } from 'react';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

import designsystemtypography from '@helsenorge/designsystem-react/scss/typography.module.scss';

import SafeText from '@/components/referoLabel/SafeText';
import itemControlConstants from '@/constants/itemcontrol';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getItemControlExtensionValue, getMarkdownExtensionValue } from '@/util/extension';
import { renderPrefix, getText, getId } from '@/util/index';

export type Props = QuestionnaireComponentItemProps;

const Display = memo(function Display({ id, pdf, linkId }: Props): JSX.Element | null {
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const { onRenderMarkdown, resources } = useExternalRenderContext();
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  const itemControls = item ? getItemControlExtensionValue(item) : null;
  const highlightClass =
    itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)
      ? 'page_refero__component_highlight'
      : '';

  let value: JSX.Element | undefined = undefined;
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
    const text = getText(item, onRenderMarkdown, questionnaire, resources);
    if (markdown) {
      value = (
        <SafeText as="div" text={text} id={getId(id)} className={`page_refero__markdown ${designsystemtypography['anchorlink-wrapper']}`} />
      );
    } else {
      value = <p id={getId(id)}>{`${renderPrefix(item)} ${text}`}</p>;
    }
  }

  if (pdf) {
    if (!value) {
      return null;
    }
    return <div>{value}</div>;
  }

  return <div className={`page_refero__component page_refero__component_display ${highlightClass}`}>{value}</div>;
});

export default Display;
