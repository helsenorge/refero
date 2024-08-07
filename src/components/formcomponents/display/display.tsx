import designsystemtypography from '@helsenorge/designsystem-react/scss/typography.module.scss';

import itemControlConstants from '@/constants/itemcontrol';
import { getItemControlExtensionValue, getMarkdownExtensionValue } from '@/util/extension';
import { renderPrefix, getText, getId } from '@/util/index';

import SafeText from '@/components/referoLabel/SafeText';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';

export type Props = RenderItemProps;

const Display = ({ id, pdf, item, resources, path }: Props): JSX.Element | null => {
  const { onRenderMarkdown } = useExternalRenderContext();
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  const itemControls = item ? getItemControlExtensionValue(item) : null;
  const enable = useIsEnabled(item, path);
  const highlightClass =
    itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)
      ? 'page_refero__component_highlight'
      : '';
  if (!enable) {
    return null;
  }
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
};

export default Display;
