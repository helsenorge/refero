import type { TABLE_CODES_VALUES } from '../constants/tableTypes';
import type { SidebarItem } from '../types/sidebar';
import type { QuestionnaireItem, Extension, Element, Questionnaire, Coding } from 'fhir/r4';

import { hasCode, isTableCode } from './typeguards';
import { Extensions } from '../constants/extensions';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { PresentationButtonsType } from '../constants/presentationButtonsType';
import { getText } from '../util/index';

export function getValidationTextExtension(item?: QuestionnaireItem): string | undefined {
  const validationTextExtension = getExtension(Extensions.VALIDATIONTEXT_URL, item);
  if (!validationTextExtension || !validationTextExtension.valueString) {
    return undefined;
  }
  return validationTextExtension.valueString;
}

export function getPresentationButtonsExtension(questionniare: Questionnaire | undefined | null): PresentationButtonsType | null {
  if (!questionniare) {
    return null;
  }
  const extension = getExtension(Extensions.PRESENTATION_BUTTONS_URL, questionniare);
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

export function getNavigatorExtension(questionniare?: Questionnaire | null): Coding[] | undefined {
  const navigatorExtension = getExtension(Extensions.NAVIGATOR_URL, questionniare);
  return navigatorExtension?.valueCodeableConcept?.coding;
}

export function getSidebarSections(
  questionniare: Questionnaire,
  onRenderMarkdown?: (item?: QuestionnaireItem, markup?: string) => string
): SidebarItem[] {
  const items: SidebarItem[] = [];
  const getSidebarItems = (currentItem?: QuestionnaireItem, currentItems?: SidebarItem[]): void => {
    const itemControls = getItemControlExtensionValue(currentItem);
    if (
      currentItem?.type === itemType.TEXT &&
      itemControls &&
      itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)
    ) {
      items.push({
        item: currentItem,
        markdownText: getText(currentItem, onRenderMarkdown),
      });
    }
    currentItem?.item?.forEach((item?: QuestionnaireItem) => {
      getSidebarItems(item, currentItems);
    });
  };
  questionniare.item?.forEach((item?: QuestionnaireItem) => {
    getSidebarItems(item, items);
  });
  return items;
}

export function isItemSidebar(item?: QuestionnaireItem): boolean {
  const itemControls = getItemControlExtensionValue(item);
  return itemControls !== undefined && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR);
}

export function getExtensions(item?: QuestionnaireItem): Extension[] {
  return item?.extension ?? [];
}

export function getExtension(url: string, item?: QuestionnaireItem | Element | Questionnaire | null): Extension | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const filteredExtension: Array<Extension> = item.extension.filter((e: Extension) => e.url === url);
  if (!filteredExtension || filteredExtension.length === 0) {
    return undefined;
  }
  return filteredExtension[0];
}
export function getExtensionFromExtensions(url: string, extensions?: Extension[]): Extension | undefined {
  if (!extensions || extensions.length === 0) {
    return undefined;
  }
  const filteredExtension: Array<Extension> = extensions.filter((e: Extension) => e.url === url);
  if (!filteredExtension || filteredExtension.length === 0) {
    return undefined;
  }
  return filteredExtension[0];
}

export function getPlaceholder(item?: QuestionnaireItem): string | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const extension = getExtension(Extensions.ENTRY_FORMAT_URL, item);
  if (!extension) {
    return undefined;
  }
  return extension.valueString;
}

export function getQuestionnaireUnitExtensionValue(item?: QuestionnaireItem): Coding | undefined {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const extension = getExtension(Extensions.QUESTIONNAIRE_UNIT_URL, item);
  if (!extension) {
    return undefined;
  }
  return extension.valueCoding;
}

export function getMaxDecimalPlacesExtensionValue(item?: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(Extensions.MAX_DECIMAL_PLACES, item);
  if (maxValue && maxValue.valueDecimal !== null && maxValue.valueDecimal !== undefined) {
    return maxValue.valueDecimal;
  }
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return maxValue.valueInteger;
  }
  return undefined;
}

export function getMaxValueExtensionValue(item?: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(Extensions.MAX_VALUE_URL, item);
  if (maxValue && maxValue.valueDecimal !== null && maxValue.valueDecimal !== undefined) {
    return Number(maxValue.valueDecimal);
  }
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return Number(maxValue.valueInteger);
  }
  return undefined;
}

export function getMinValueExtensionValue(item?: QuestionnaireItem): number | undefined {
  const minValue = getExtension(Extensions.MIN_VALUE_URL, item);

  if (minValue && minValue.valueDecimal !== null && minValue.valueDecimal !== undefined) {
    return Number(minValue.valueDecimal);
  }
  if (minValue && minValue.valueInteger !== null && minValue.valueInteger !== undefined) {
    return Number(minValue.valueInteger);
  }
  return undefined;
}

export function getMinOccursExtensionValue(item?: QuestionnaireItem): number | undefined {
  const minValue = getExtension(Extensions.MIN_OCCURS_URL, item);
  if (minValue && minValue.valueInteger !== null && minValue.valueInteger !== undefined) {
    return Number(minValue.valueInteger);
  }
  return undefined;
}

export function getMaxOccursExtensionValue(item?: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(Extensions.MAX_OCCURS_URL, item);
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return Number(maxValue.valueInteger);
  }
  return undefined;
}

export function getMinLengthExtensionValue(item?: QuestionnaireItem): number | undefined {
  const minLength = getExtension(Extensions.MIN_LENGTH_URL, item);
  if (minLength && minLength.valueInteger) {
    return Number(minLength.valueInteger);
  }
  return undefined;
}

export function getRegexExtension(item?: QuestionnaireItem): string | undefined {
  const regexExtension = getExtension(Extensions.REGEX_URL, item);
  if (!regexExtension || !regexExtension.valueString) {
    return undefined;
  }
  return regexExtension.valueString;
}

export function getRepeatsTextExtension(item?: QuestionnaireItem): string | undefined {
  const repeatsTextExtension = getExtension(Extensions.REPEATSTEXT_URL, item);
  if (!repeatsTextExtension || !repeatsTextExtension.valueString) {
    return undefined;
  }
  return repeatsTextExtension.valueString;
}

export function getItemControlExtensionValue(item?: QuestionnaireItem): Coding[] | undefined {
  const itemControlExtension = getExtension(Extensions.ITEMCONTROL_URL, item);
  if (!itemControlExtension || !itemControlExtension.valueCodeableConcept || !itemControlExtension.valueCodeableConcept.coding) {
    return undefined;
  }
  return itemControlExtension.valueCodeableConcept.coding;
}

export const getCodingTextTableValues = (item?: QuestionnaireItem): TABLE_CODES_VALUES[] => {
  const extension = getItemControlExtensionValue(item);
  const codeValues =
    extension
      ?.map(x => x.code?.toLocaleLowerCase() as TABLE_CODES_VALUES)
      .filter(hasCode)
      .filter(isTableCode) || [];
  return codeValues;
};

export function getMarkdownExtensionValue(item?: QuestionnaireItem | Element): string | undefined {
  const markdownExtension = getExtension(Extensions.MARKDOWN_URL, item);
  if (!markdownExtension || !markdownExtension.valueMarkdown) {
    return undefined;
  }
  return markdownExtension.valueMarkdown;
}

export function getSublabelExtensionValue(item?: QuestionnaireItem | Element): string | undefined {
  const markdownExtension = getExtension(Extensions.SUBLABEL_URL, item);
  if (!markdownExtension || !markdownExtension.valueMarkdown) {
    return undefined;
  }
  return markdownExtension.valueMarkdown;
}

export function getQuestionnaireHiddenExtensionValue(item?: QuestionnaireItem): boolean | undefined {
  const questionnaireHiddenExtension = getExtension(Extensions.QUESTIONNAIRE_HIDDEN_URL, item);
  if (!questionnaireHiddenExtension || !questionnaireHiddenExtension.valueBoolean) {
    return false;
  }
  return questionnaireHiddenExtension.valueBoolean;
}

export function getCalculatedExpressionExtension(item?: QuestionnaireItem): Extension | undefined {
  const calculatedExpressionExtension = getExtension(Extensions.CALCULATED_EXPRESSION_URL, item);
  if (
    !calculatedExpressionExtension ||
    calculatedExpressionExtension.valueString === null ||
    calculatedExpressionExtension.valueString === undefined
  ) {
    return;
  }
  return calculatedExpressionExtension;
}

export function getCopyExtension(item?: QuestionnaireItem, useLegacyValueString: boolean = true): Extension | undefined {
  const extension = getExtension(Extensions.COPY_EXPRESSION_URL, item);
  if (useLegacyValueString) {
    if (!extension || !extension.valueString) {
      return;
    }
  } else {
    if (!extension || !extension.valueExpression?.expression) {
      return;
    }
  }
  return extension;
}

export function getHyperlinkExtensionValue(item?: QuestionnaireItem | Element | Questionnaire): number | undefined {
  const hyperlinkExtension = getExtension(Extensions.HYPERLINK_URL, item);
  if (hyperlinkExtension && hyperlinkExtension.valueCoding && hyperlinkExtension.valueCoding.code) {
    return parseInt(hyperlinkExtension.valueCoding.code);
  }
  return undefined;
}

export function getMaxSizeExtensionValue(item?: QuestionnaireItem): number | undefined {
  const maxValue = getExtension(Extensions.MAX_SIZE_URL, item);
  if (maxValue && maxValue.valueDecimal !== null && maxValue.valueDecimal !== undefined) {
    return Number(maxValue.valueDecimal);
  }
  if (maxValue && maxValue.valueInteger !== null && maxValue.valueInteger !== undefined) {
    return Number(maxValue.valueInteger);
  }
  return undefined;
}
