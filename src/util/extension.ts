import { QuestionnaireItem, Extension, Element, Questionnaire, Coding } from '../types/fhir';
import ExtensionConstants from '../constants/extensions';
import { PresentationButtonsType } from '../constants/presentationButtonsType';
import { SidebarItem } from '../types/sidebar';
import { getText } from '../util/index';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';

export function getValidationTextExtension(item: QuestionnaireItem) {
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

export function getPrintVersion(questionniare: Questionnaire): string | undefined {
  const recipientUrl = getExtension(ExtensionConstants.PRINT_VERSION, questionniare);
  return recipientUrl?.valueReference?.reference;
}

export function getRecipientUrl(questionniare: Questionnaire): string | undefined {
  const recipientUrl = getExtension(ExtensionConstants.RECIPIENT_URL, questionniare);
  return recipientUrl?.valueReference?.reference;
}

export function getGeneratePdfExtensionValue(questionnaire: Questionnaire): boolean | undefined {
  const generatepdf = getExtension(ExtensionConstants.GENERATE_PDF, questionnaire);
  return generatepdf?.valueBoolean;
}

export function getSidebarSections(
  questionniare: Questionnaire,
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string
): Array<SidebarItem> {
  const items: Array<SidebarItem> = [];
  const getSidebarItems = (currentItem: QuestionnaireItem, currentItems: Array<SidebarItem>) => {
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

export function getExtension(url: string, item: QuestionnaireItem | Element | Questionnaire) {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const filteredExtension: Array<Extension> = item.extension.filter((e: Extension) => e.url === url);
  if (!filteredExtension || filteredExtension.length === 0) {
    return undefined;
  }
  return filteredExtension[0];
}

export function getPlaceholder(item: QuestionnaireItem) {
  if (!item || !item.extension || item.extension.length === 0) {
    return undefined;
  }
  const extension = getExtension(ExtensionConstants.ENTRY_FORMAT_URL, item);
  if (!extension) {
    return undefined;
  }
  return extension.valueString;
}

export function getQuestionnaireUnitExtensionValue(item: QuestionnaireItem) {
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

export function getItemControlExtensionValue(item: QuestionnaireItem) {
  const itemControlExtension = getExtension(ExtensionConstants.ITEMCONTROL_URL, item);
  if (!itemControlExtension || !itemControlExtension.valueCodeableConcept || !itemControlExtension.valueCodeableConcept.coding) {
    return undefined;
  }
  return itemControlExtension.valueCodeableConcept.coding;
}

export function getMarkdownExtensionValue(item: QuestionnaireItem | Element) {
  const markdownExtension = getExtension(ExtensionConstants.MARKDOWN_URL, item);
  if (!markdownExtension || !markdownExtension.valueMarkdown) {
    return undefined;
  }
  return markdownExtension.valueMarkdown;
}

export function getQuestionnaireHiddenExtensionValue(item: QuestionnaireItem) {
  const questionnaireHiddenExtension = getExtension(ExtensionConstants.QUESTIONNAIRE_HIDDEN, item);
  if (!questionnaireHiddenExtension || !questionnaireHiddenExtension.valueBoolean) {
    return false;
  }
  return questionnaireHiddenExtension.valueBoolean;
}

export function getAuthenticationRequirementValue(questionnaire: Questionnaire) {
  const itemAuthenticationRequirement = getExtension(ExtensionConstants.AUTHENTICATION_REQUIREMENT_URL, questionnaire);
  if (!itemAuthenticationRequirement || !itemAuthenticationRequirement.valueCoding || !itemAuthenticationRequirement.valueCoding.code) {
    return undefined;
  }

  return parseInt(itemAuthenticationRequirement.valueCoding.code, 10);
}

export function getCanBePerformedByValue(questionnaire: Questionnaire) {
  const itemCanBePerfomedBy = getExtension(ExtensionConstants.CAN_BE_PERFORMED_BY_URL, questionnaire);
  if (!itemCanBePerfomedBy || !itemCanBePerfomedBy.valueCoding || !itemCanBePerfomedBy.valueCoding.code) {
    return undefined;
  }

  return parseInt(itemCanBePerfomedBy.valueCoding.code, 10);
}

export function getAccessibilityToResponse(questionnaire: Questionnaire) {
  const accessibilityToResponse = getExtension(ExtensionConstants.ACCESSIBILITY_TO_RESPONSE, questionnaire);
  if (!accessibilityToResponse || !accessibilityToResponse.valueCoding || !accessibilityToResponse.valueCoding.code) {
    return undefined;
  }

  return parseInt(accessibilityToResponse.valueCoding.code, 10);
}

export function getDiscretion(questionnaire: Questionnaire) {
  const discretion = getExtension(ExtensionConstants.DISCRETION, questionnaire);
  if (!discretion || !discretion.valueCoding || !discretion.valueCoding.code) {
    return undefined;
  }

  return parseInt(discretion.valueCoding.code, 10);
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
