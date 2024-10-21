import { QuestionnaireItem } from 'fhir/r4';

import Icon from '@helsenorge/designsystem-react/components/Icon';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import HelpButton from './HelpButton';

import ItemControlConstants from '@/constants/itemcontrol';
import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type Props = {
  item?: QuestionnaireItem;
  setIsHelpVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isHelpVisible: boolean;
  padding?: boolean;
};

export const RenderHelpButton = ({ item, setIsHelpVisible, isHelpVisible, padding }: Props): JSX.Element | null => {
  const { onRequestHelpButton } = useExternalRenderContext();

  if (!item) return null;
  const helpItem = findHelpItem(item);

  if (!helpItem) return null;
  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpButton) {
    return (
      <HelpButton item={helpItem} padding={padding} callback={setIsHelpVisible}>
        {onRequestHelpButton(item, helpItem, helpItemType, getText(helpItem), isHelpVisible)}
      </HelpButton>
    );
  }
  return (
    <HelpButton item={helpItem} padding={padding} callback={setIsHelpVisible}>
      <Icon svgIcon={HelpSign} />
    </HelpButton>
  );
};
export default RenderHelpButton;
