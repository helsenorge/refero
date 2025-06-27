import { QuestionnaireItem } from 'fhir/r4';

import Icon from '@helsenorge/designsystem-react/components/Icon';
import HelpSign from '@helsenorge/designsystem-react/components/Icons/HelpSign';

import HelpButton from './HelpButton';

import ItemControlConstants from '@/constants/itemcontrol';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { getText } from '@/util';
import { findHelpItem, getHelpItemType } from '@/util/help';

type Props = {
  item?: QuestionnaireItem;
  setIsHelpVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isHelpVisible: boolean;
  ariaLabeledBy?: string;
  padding?: boolean;
};

export const RenderHelpButton = ({ item, setIsHelpVisible, isHelpVisible, ariaLabeledBy, padding }: Props): JSX.Element | null => {
  const { onRequestHelpButton } = useExternalRenderContext();

  if (!item) return null;
  const helpItem = findHelpItem(item);

  if (!helpItem) return null;
  const helpItemType = getHelpItemType(helpItem) || ItemControlConstants.HELP;

  if (onRequestHelpButton) {
    return (
      <HelpButton item={helpItem} padding={padding} callback={setIsHelpVisible} ariaLabeledBy={ariaLabeledBy}>
        {onRequestHelpButton(item, helpItem, helpItemType, getText(helpItem), isHelpVisible)}
      </HelpButton>
    );
  }
  return (
    <HelpButton item={helpItem} padding={padding} callback={setIsHelpVisible} ariaLabeledBy={ariaLabeledBy}>
      <Icon svgIcon={HelpSign} />
    </HelpButton>
  );
};
export default RenderHelpButton;
