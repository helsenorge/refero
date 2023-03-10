import { QuestionnaireItem, Extension, Element, Questionnaire, Coding } from '../types/fhir';
import { SidebarItem } from '../types/sidebar';

import ExtensionConstants from '../constants/extensions';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { PresentationButtonsType } from '../constants/presentationButtonsType';
import { getText } from '../util/index';

export function getValidationTextExtension(item: QuestionnaireItem): string | undefined {
  const validationTextExtension = getExtension(ExtensionConstants.VALIDATIONTEXT_URL, item);
  if (!validationTextExtension || !validationTextExtension.valueString) {
    return undefined;
  }
  return validationTextExtension.valueString;
}

export function getPresentationButtonsExtension(questionniare: Questionnaire): PresentationButtonsType | null {
  const extension = getExtension(ExtensionConstants.PRESENTATION_BUTTONS, questionniare);
  if (!extension || !extension.valueCoding || !extension.valueCoding.code) {
    return null;
  }

  switch (extension.valueCoding.code) {
    case 'none':
      return PresentationButtonsType.None;
    case 'static':
      return PresentationButtonsType.Static;
    case 'sticky':
      return PresentationButtonsType.Sticky;
  }

  return null;
}

export function getNavigatorExtension(questionniare: Questionnaire): Array<Coding> | undefined {
  const navigatorExtension = getExtension(ExtensionConstants.NAVIGATOR, questionniare);
  return navigatorExtension?.valueCodeableConcept?.coding;
}

export function getSidebarSections(
  questionniare: Questionnaire,
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string
): Array<SidebarItem> {
  const items: Array<SidebarItem> = [];
  const getSidebarItems = (currentItem: QuestionnaireItem, currentItems: Array<SidebarItem>): void => {
    const itemControls = getItemControlExtensionValue(currentItem);
    if (
      currentItem.type === itemType.TEXT &&
      itemControls &&
      itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)
    ) {
      items.push({
        item: currentItem,
        markdownText: getText(currentItem, onRenderMarkdown),
      });
    }
    currentItem.item?.forEach((item: QuestionnaireItem) => {
      getSidebarItems(item, currentItems);
    });
  };
  questionniare.item?.forEach((item: QuestionnaireItem) => {
    getSidebarItems(item, items);
  });
  return items;
}

export function isItemSidebar(item: QuestionnaireItem): boolean {
  const itemControls = getItemControlExtensionValue(item);
  return itemControls !== undefined && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR);
}

export function getExtension(url: string, item: QuestionnaireItem | Element | Questionnaire): Extension | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const filteredExtension: Array<Extension> = item.extension.filter((e: Extension) => e.url === url);
  if (!filteredExtension || filteredExtension.length === 0) {
    return undefined;
  }
  return filteredExtension[0];
}

export function getPlaceholder(item: QuestionnaireItem): string | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const extension = getExtension(ExtensionConstants.ENTRY_FORMAT_URL, item);
  if (!extension) {
    return undefined;
  }
  return extension.valueString;
}

export function getQuestionnaireUnitExtensionValue(item: QuestionnaireItem): Coding | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const extension = getExtension(ExtensionConstants.QUESTIONNAIRE_UNIT, item);
  if (!extension) {
    return undefined;
  }
  return extension.valueCoding;
}

export function getMaxValueExtensionValue(item: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(ExtensionConstants.MAX_VALUE_URL, item);
  if (maxValue && maxValue.valueDecimal !== null && maxValue.valueDecimal !== undefined) {
    return Number(maxValue.valueDecimal);
  }
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return Number(maxValue.valueInteger);
  }
  return undefined;
}

export function getMinValueExtensionValue(item: QuestionnaireItem): number | undefined {
  const minValue = getExtension(ExtensionConstants.MIN_VALUE_URL, item);
  if (minValue && minValue.valueDecimal !== null && minValue.valueDecimal !== undefined) {
    return Number(minValue.valueDecimal);
  }
  if (minValue && minValue.valueInteger !== null && minValue.valueInteger !== undefined) {
    return Number(minValue.valueInteger);
  }
  return undefined;
}

export function getMinOccursExtensionValue(item: QuestionnaireItem): number | undefined {
  const minValue = getExtension(ExtensionConstants.MIN_OCCURS_URL, item);
  if (minValue && minValue.valueInteger !== null && minValue.valueInteger !== undefined) {
    return Number(minValue.valueInteger);
  }
  return undefined;
}

export function getMaxOccursExtensionValue(item: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(ExtensionConstants.MAX_OCCURS_URL, item);
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return Number(maxValue.valueInteger);
  }
  return undefined;
}

export function getMinLengthExtensionValue(item: QuestionnaireItem): number | undefined {
  const minLength = getExtension(ExtensionConstants.MIN_LENGTH_URL, item);
  if (minLength && minLength.valueInteger) {
    return Number(minLength.valueInteger);
  }
  return undefined;
}

export function getRegexExtension(item: QuestionnaireItem): string | undefined {
  const regexExtension = getExtension(ExtensionConstants.REGEX_URL, item);
  if (!regexExtension || !regexExtension.valueString) {
    return undefined;
  }
  return regexExtension.valueString;
}

export function getRepeatsTextExtension(item: QuestionnaireItem): string | undefined {
  const repeatsTextExtension = getExtension(ExtensionConstants.REPEATSTEXT_URL, item);
  if (!repeatsTextExtension || !repeatsTextExtension.valueString) {
    return undefined;
  }
  return repeatsTextExtension.valueString;
}

export function getItemControlExtensionValue(item: QuestionnaireItem): Coding[] | undefined {
  const itemControlExtension = getExtension(ExtensionConstants.ITEMCONTROL_URL, item);
  if (!itemControlExtension || !itemControlExtension.valueCodeableConcept || !itemControlExtension.valueCodeableConcept.coding) {
    return undefined;
  }
  return itemControlExtension.valueCodeableConcept.coding;
}

export function getMarkdownExtensionValue(item: QuestionnaireItem | Element): string | undefined {
  const markdownExtension = getExtension(ExtensionConstants.MARKDOWN_URL, item);
  if (!markdownExtension || !markdownExtension.valueMarkdown) {
    return undefined;
  }
  return markdownExtension.valueMarkdown;
}

export function getSublabelExtensionValue(item: QuestionnaireItem | Element): string | undefined {
  const markdownExtension = getExtension(ExtensionConstants.SUBLABEL, item);
  if (!markdownExtension || !markdownExtension.valueMarkdown) {
    return undefined;
  }
  return markdownExtension.valueMarkdown;
}

export function getQuestionnaireHiddenExtensionValue(item: QuestionnaireItem): boolean | undefined {
  const questionnaireHiddenExtension = getExtension(ExtensionConstants.QUESTIONNAIRE_HIDDEN, item);
  if (!questionnaireHiddenExtension || !questionnaireHiddenExtension.valueBoolean) {
    return false;
  }
  return questionnaireHiddenExtension.valueBoolean;
}

export function getCalculatedExpressionExtension(item: QuestionnaireItem): Extension | undefined {
  const calculatedExpressionExtension = getExtension(ExtensionConstants.CALCULATED_EXPRESSION, item);
  if (
    !calculatedExpressionExtension ||
    calculatedExpressionExtension.valueString === null ||
    calculatedExpressionExtension.valueString === undefined
  ) {
    return;
  }
  return calculatedExpressionExtension;
}

export function getCopyExtension(item: QuestionnaireItem): Extension | undefined {
  const extension = getExtension(ExtensionConstants.Copy_EXPRESSION, item);
  if (!extension || !extension.valueString) {
    return;
  }
  return extension;
}

export function getHyperlinkExtensionValue(item: QuestionnaireItem | Element | Questionnaire): number | undefined {
  const hyperlinkExtension = getExtension(ExtensionConstants.HYPERLINK, item);
  if (hyperlinkExtension && hyperlinkExtension.valueCoding && hyperlinkExtension.valueCoding.code) {
    return parseInt(hyperlinkExtension.valueCoding.code);
  }
  return undefined;
}
