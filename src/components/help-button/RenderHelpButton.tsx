import ItemControlConstants from '@/constants/itemcontrol';
import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';
import Icon from '@helsenorge/designsystem-react/components/Icon';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';
import { QuestionnaireItem } from 'fhir/r4';
import { useState } from 'react';
import HelpButton from './HelpButton';

type Props = {
  item: QuestionnaireItem;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    helpItem: QuestionnaireItem,
    helpItemType: string,
    helpText: string,
    isHelpVisible: boolean
  ) => JSX.Element;
};

export const RenderHelpButton = ({ item, onRequestHelpButton }: Props): JSX.Element | null => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const helpItem = findHelpItem(item);

  if (!item || !helpItem) return null;

  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpButton) {
    return (
      <HelpButton item={helpItem} callback={setIsHelpVisible}>
        {onRequestHelpButton(item, helpItem, helpItemType, getText(helpItem), isHelpVisible)}
      </HelpButton>
    );
  }
  return (
    <HelpButton item={helpItem} callback={setIsHelpVisible}>
      <Icon svgIcon={HelpSign} />
    </HelpButton>
  );
};
export default RenderHelpButton;
