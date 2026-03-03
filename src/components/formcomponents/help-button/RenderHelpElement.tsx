import type { QuestionnaireItem } from 'fhir/r4';

import SafeText from '../../referoLabel/SafeText';

import styles from './renderHelpElement.module.scss';

import ItemControlConstants from '@/constants/itemcontrol';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';

type Props = {
  isHelpVisible: boolean;
  item?: QuestionnaireItem;
};

const RenderHelpElement = ({ isHelpVisible, item }: Props): React.JSX.Element | null => {
  const { onRequestHelpElement } = useExternalRenderContext();

  if (!item) return null;

  const helpItem = findHelpItem(item);
  if (!helpItem) return null;

  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpElement) {
    return onRequestHelpElement(item, helpItem, helpItemType, getText(helpItem), isHelpVisible);
  }

  const className = `${styles.page_refero__helpComponent} ${isHelpVisible ? styles['page_refero__helpComponent--open'] : ''}`;

  return (
    <div aria-hidden={!isHelpVisible} aria-live="polite" className={className} data-testid={`${helpItem.linkId}-help-element`}>
      <SafeText as="div" text={getText(helpItem)} />
    </div>
  );
};

export default RenderHelpElement;
