import classNames from "classnames";
import { QuestionnaireItem } from "fhir/r4";
import { Collapse } from "react-collapse";

import SafeText from "../referoLabel/SafeText";

import ItemControlConstants from "@/constants/itemcontrol";
import { getText } from "@/util";
import { findHelpItem, getHelpItemType } from "@/util/help";

type Props = {
  item: QuestionnaireItem,
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element,
  isHelpVisible: boolean
}

export const renderHelpElement = ({ item, onRequestHelpElement, isHelpVisible }: Props): JSX.Element | null => {
  const helpItem = findHelpItem(item);

  if (!item || !helpItem) return null;

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
      <SafeText as='div' text={getText(helpItem)} data-testid={`${helpItem.linkId}-help-element`} className={collapseClasses} />
    </Collapse>
  );
};
