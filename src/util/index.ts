import { marked } from 'marked';
import * as uuid from 'uuid';

import type { Resources } from '@/util/resources';
import type { Questionnaire, QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { isValid, invalidNodes } from '@helsenorge/core-utils/string-utils';

import { getQuestionnaireItemCodeValue } from './codingsystem';
import {
  getMaxOccursExtensionValue,
  getMarkdownExtensionValue,
  getValidationTextExtension,
  getQuestionnaireHiddenExtensionValue,
  getExtension,
  getSublabelExtensionValue,
  getHyperlinkExtensionValue,
  getCopyExtension,
} from './extension';
import codeSystems from '../constants/codingsystems';
import { Extensions } from '../constants/extensions';
import { HyperlinkTarget } from '../constants/hyperlinkTarget';
import Constants from '../constants/index';
import { RenderOptionCode } from '../constants/renderOptionCode';
import { TableCodes } from '../constants/tableTypes';

import { VALIDATE_READONLY_CODE } from '@/constants/codes';

function openNewIfAbsolute(url: string): string {
  const regex = new RegExp('^(([a-z][a-z0-9+.-]*):.*)');
  if (regex.test(url)) {
    return '_blank';
  }
  return '_self';
}
export const isTableCode = (extensionCode: string | string[]): boolean => {
  let lowerCode: string | string[] = '';
  if (Array.isArray(extensionCode)) {
    lowerCode = extensionCode.map(code => code.toLocaleLowerCase());
  } else {
    lowerCode = extensionCode.toLowerCase();
  }
  const isTable = Object.values(TableCodes).some(value => {
    return lowerCode.indexOf(value.toLocaleLowerCase()) === -1 ? false : true;
  });
  return isTable;
};

export function isStringEmpty(string: string | undefined): boolean {
  return string === '' || string === null || string === undefined;
}

export function isReadOnly(item?: QuestionnaireItem): boolean {
  if (item && item.readOnly) {
    return item.readOnly;
  }
  return false;
}

export function shouldValidateReadOnly(item?: QuestionnaireItem): boolean {
  return getQuestionnaireItemCodeValue(item, codeSystems.ValidationOptions) === VALIDATE_READONLY_CODE;
}

export function isRequired(item?: QuestionnaireItem): boolean {
  if (item && item.required) {
    return item.required;
  }
  return false;
}

export function isRepeat(item?: QuestionnaireItem): boolean {
  if (item && item.repeats) {
    return item.repeats;
  }
  return false;
}

export function isDataReceiver(item?: QuestionnaireItem): boolean {
  return getCopyExtension(item) !== undefined;
}

export function isHiddenItem(item?: QuestionnaireItem): boolean | undefined {
  return (
    getQuestionnaireHiddenExtensionValue(item) ||
    getQuestionnaireItemCodeValue(item, codeSystems.RenderingOptions) === RenderOptionCode.KunPdf
  );
}

export function getId(id?: string): string {
  if (id) {
    return id;
  }
  return uuid.v4();
}

export function renderPrefix(item?: QuestionnaireItem): string {
  if (!item || !item.prefix) {
    return '';
  }
  return item.prefix;
}

export function getSublabelText(
  item?: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  resources?: Resources
): string {
  if (item) {
    const markdown = getSublabelExtensionValue(item) || '';
    return markdown ? getMarkdownValue(markdown, item, onRenderMarkdown, questionnaire, resources?.linkOpensInNewTab) : '';
  }
  return '';
}
export function getLabelText(
  item?: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  resources?: Resources
): string {
  return `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
}
export function getText(
  item?: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  resources?: Resources
): string {
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
    if (markdown) {
      return getMarkdownValue(markdown, item, onRenderMarkdown, questionnaire, resources?.linkOpensInNewTab);
    } else if (item.text) {
      return item.text;
    }
  }
  return '';
}

function getAriaLabelTextForLink(href: string, linkText: string, linkOpensInNewTabText?: string): string {
  const opensInNewTab: boolean = openNewIfAbsolute(href) === '_blank';
  if (opensInNewTab && linkOpensInNewTabText) {
    return linkText + ', ' + linkOpensInNewTabText;
  } else {
    return linkText;
  }
}

function getMarkdownValue(
  markdownText: string,
  item: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  linkOpensInNewTabText?: string
): string {
  const itemValue = getHyperlinkExtensionValue(item);
  const questionnaireValue = questionnaire ? getHyperlinkExtensionValue(questionnaire) : undefined;
  const renderer = new marked.Renderer();

  renderer.link = ({ href, title, text }): string => {
    const ariaLabel = getAriaLabelTextForLink(href, text, linkOpensInNewTabText);
    const urlString = `<a href=${href} ${
      title ? `title=${title}` : ''
    } target="_blank" rel="noopener noreferrer" class="external" aria-label="${ariaLabel}">${text}</a>`;
    return urlString;
  };

  const rendererSameWindow = new marked.Renderer();
  rendererSameWindow.link = ({ href, title, text }): string => {
    const ariaLabel = getAriaLabelTextForLink(href, text, linkOpensInNewTabText);
    const urlString = `<a href=${href} ${title ? `title=${title}` : ''} target="${openNewIfAbsolute(
      href
    )}" rel="noopener noreferrer" aria-label="${ariaLabel}">${text}</a>`;
    return urlString;
  };

  if (onRenderMarkdown) {
    return onRenderMarkdown(item, markdownText.toString());
  }
  if (itemValue === HyperlinkTarget.SAME_WINDOW || (!itemValue && questionnaireValue === HyperlinkTarget.SAME_WINDOW)) {
    return marked(markdownText.toString(), { async: false, renderer: rendererSameWindow });
  }

  return marked(markdownText.toString(), { renderer: renderer, async: false });
}

export function getChildHeaderTag(item?: QuestionnaireItem, headerTag?: number): number {
  if (!headerTag || !item) {
    return Constants.DEFAULT_HEADER_TAG;
  }
  return hasHeader(item) ? headerTag + 1 : headerTag;
}

function hasHeader(item?: QuestionnaireItem): boolean {
  if (!getText(item)) {
    return false;
  }
  if (!item || item.type !== Constants.ITEM_TYPE_GROUP) {
    return false;
  }
  return true;
}

export function getLinkId(item?: QuestionnaireItem): string {
  if (item && item.linkId) {
    return item.linkId;
  }
  return uuid.v4();
}

export function getStringValue(answer?: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>): string {
  if (answer && Array.isArray(answer)) {
    const stringAnswer = answer.filter(f => f.valueString);
    return stringAnswer.length > 0 ? stringAnswer.map(m => m.valueString).join(', ') : '';
  }
  return answer?.valueString ?? '';
}

export function getPDFStringValue(
  answer?: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>,
  resources?: Resources
): string {
  const value = getStringValue(answer);
  if (!value) {
    let text = '';
    if (resources && resources.ikkeBesvart) {
      text = resources.ikkeBesvart;
    }
    return text;
  }
  return value;
}

export function getMaxLength(item?: QuestionnaireItem): number | undefined {
  if (!item || !item.maxLength) {
    return undefined;
  }
  return Number(item.maxLength);
}

export function repeats(item?: QuestionnaireItem): boolean {
  if (item && item.repeats) {
    return item.repeats;
  }
  return false;
}

export function shouldRenderRepeatButton(
  item?: QuestionnaireItem,
  response?: Array<QuestionnaireResponseItem> | undefined,
  index?: number
): boolean {
  if (!repeats(item)) {
    return false;
  }

  if (!response) {
    return true;
  }

  if (index !== undefined && index !== response.length - 1) {
    return false;
  }

  const max = getMaxOccursExtensionValue(item);
  if (response && max && response.length && Number(max) <= response.length) {
    return false;
  }

  if (item?.readOnly) {
    return false;
  }

  return true;
}

export function validateText(value: string, validateScriptInjection: boolean): boolean {
  if (!validateScriptInjection) {
    return true;
  }
  return isValid(value);
}

export function getTextValidationErrorMessage(
  value: string,
  validateScriptInjection: boolean,
  item: QuestionnaireItem,
  resources?: Resources
): string {
  if (validateScriptInjection && value && typeof value === 'string') {
    const invalid: string[] = invalidNodes(value);

    if (invalid && invalid.length > 0) {
      return invalid.join(', ') + ' ' + (resources ? resources.validationNotAllowed : 'er ikke tillatt');
    }
  }

  return getValidationTextExtension(item) || '';
}

export function getDecimalPattern(item?: QuestionnaireItem): string | undefined {
  const step = getExtension(Extensions.STEP_URL, item);

  const integerPart = '[+-]?[0-9]+';
  if (step && step.valueInteger != null) {
    const value = Number(step.valueInteger);

    if (value === 0) {
      return `^${integerPart}$`;
    }

    let stepString = '';
    if (value > 1) {
      stepString = `1,${value}`;
    } else if (value === 1) {
      stepString = '1';
    }

    return `^${integerPart}(.[0-9]{${stepString}})?$`;
  }
}

export function getDecimalValue(item?: QuestionnaireItem, value?: number | undefined): number | undefined {
  const decimalPlacesExtension = getExtension(Extensions.STEP_URL, item);
  if (value !== undefined && value !== null && decimalPlacesExtension && decimalPlacesExtension.valueInteger != null) {
    const places = Number(decimalPlacesExtension.valueInteger);
    return Number(value.toFixed(places));
  }
  return value;
}

export function isIE11(): boolean {
  // @ts-expect-error ie 11 stuff
  return !!window['MSInputMethodContext'] && !!document['documentMode'];
}

export const scriptInjectionValidation = (value: string, resources?: Resources): string | true => {
  if (value && typeof value === 'string') {
    const invalid: string[] = invalidNodes(value);

    if (invalid && invalid.length > 0) {
      return invalid.join(', ') + ' ' + (resources && resources.validationNotAllowed ? resources.validationNotAllowed : 'er ikke tillatt');
    }
    return true;
  }
  return true;
};
