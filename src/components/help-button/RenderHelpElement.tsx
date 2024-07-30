import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';
import { QuestionnaireItem } from 'fhir/r4';
import ItemControlConstants from '@/constants/itemcontrol';
import classNames from 'classnames';
import { Collapse } from 'react-collapse';
import SafeText from '../referoLabel/SafeText';

type Props = {
  isHelpVisible: boolean;
  item: QuestionnaireItem;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
};

const renderHelpElement = ({ isHelpVisible, item, onRequestHelpElement }: Props): JSX.Element | null => {
  if (!item) {
    return null;
  }
  const qItem = item;

  const helpItem = findHelpItem(qItem);
  if (!helpItem) {
    return null;
  }

  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpElement) {
    return onRequestHelpElement(qItem, helpItem, helpItemType, getText(helpItem), isHelpVisible);
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

export default renderHelpElement;
