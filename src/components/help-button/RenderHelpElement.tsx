import { findHelpItem } from "@/util/help";
import classNames from "classnames";
import { QuestionnaireItem } from "fhir/r4";

type Props = {
  item: QuestionnaireItem,
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element
}

export const renderHelpElement = ({ item, onRequestHelpElement }: Props): JSX.Element | null => {
  const helpItem = findHelpItem(item);

  if (!item || !helpItem) return null;

  const helpItemType = getHelpItemType(helpItem) || itemControlConstants.HELP;

  if (onRequestHelpElement) {
    return onRequestHelpElement(qItem, helpItem, helpItemType, getText(helpItem), isHelpVisible);
  }

  const collapseClasses: string = classNames({
    page_refero__helpComponent: true,
    'page_refero__helpComponent--open': isHelpVisible,
  });
  return (
    <Collapse isOpened={isHelpVisible}>
      <SafeText />
      <div
        data-testid={`${helpItem.linkId}-help-element`}
        className={collapseClasses}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(`${getText(helpItem)}`, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'] }) as unknown as string,
        }}
      />
    </Collapse>
  );
};
