import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';
import { QuestionnaireItem } from 'fhir/r4';
import ItemControlConstants from '@/constants/itemcontrol';
import classNames from 'classnames';
import { Collapse } from 'react-collapse';
import SafeText from '../../referoLabel/SafeText';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type Props = {
  isHelpVisible: boolean;
  item?: QuestionnaireItem;
};

const RenderHelpElement = ({ isHelpVisible, item }: Props): JSX.Element | null => {
  const { onRequestHelpElement } = useExternalRenderContext();

  if (!item) {
    return null;
  }

  const helpItem = findHelpItem(item);
  if (!helpItem) {
    return null;
  }

  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpElement) {
    return onRequestHelpElement(item, helpItem, helpItemType, getText(helpItem), isHelpVisible);
  }

  const collapseClasses: string = classNames({
    page_refero__helpComponent: true,
    'page_refero__helpComponent--open': isHelpVisible,
  });
  return (
    <Collapse isOpened={isHelpVisible}>
      <SafeText as="div" text={getText(helpItem)} data-testid={`${helpItem.linkId}-help-element`} className={collapseClasses} />
    </Collapse>
  );
};

export default RenderHelpElement;
