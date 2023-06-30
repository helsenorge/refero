import * as uuid from 'uuid';

import { Questionnaire, QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../types/fhir';

import { isValid, invalidNodes } from '@helsenorge/core-utils/string-utils';

import Attachment from '../components/formcomponents/attachment/attachment';
import Boolean from '../components/formcomponents/boolean/boolean';
import Choice from '../components/formcomponents/choice/choice';
import Date from '../components/formcomponents/date/date';
import DateTime from '../components/formcomponents/date/date-time';
import Time from '../components/formcomponents/date/time';
import Decimal from '../components/formcomponents/decimal/decimal';
import Display from '../components/formcomponents/display/display';
import Group from '../components/formcomponents/group/group';
import Integer from '../components/formcomponents/integer/integer';
import OpenChoice from '../components/formcomponents/open-choice/open-choice';
import Quantity from '../components/formcomponents/quantity/quantity';
import StringComponent from '../components/formcomponents/string/string';
import Text from '../components/formcomponents/text/text';
import ExtensionConstants from '../constants/extensions';
import { RenderOptionCode } from '../constants/renderOptionCode';
import { HyperlinkTarget } from '../constants/hyperlinkTarget';
import CodingSystemConstants from '../constants/codingsystems';
import Constants from '../constants/index';
import ItemType from '../constants/itemType';
import { Resources } from '../util/resources';
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
import { getQuestionnaireItemCodeValue } from './codingsystem';
import itemcontrol from '../constants/itemcontrol';
import marked from 'marked';

function openNewIfAbsolute(url: string): string {
  const regex = new RegExp('^(([a-z][a-z0-9+.-]*):.*)');
  if (regex.test(url)) {
    return '_blank';
  }
  return '_self';
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getComponentForItem(type: string) {
  if (String(type) === ItemType.GROUP) {
    return Group;
  }
  if (String(type) === ItemType.DISPLAY) {
    return Display;
  }
  if (String(type) === ItemType.BOOLEAN) {
    return Boolean;
  }
  if (String(type) === ItemType.DECIMAL) {
    return Decimal;
  }
  if (String(type) === ItemType.INTEGER) {
    return Integer;
  }
  if (String(type) === ItemType.DATE) {
    return Date;
  }
  if (String(type) === ItemType.DATETIME) {
    return DateTime;
  }
  if (String(type) === ItemType.TIME) {
    return Time;
  }
  if (String(type) === ItemType.STRING) {
    return StringComponent;
  }
  if (String(type) === ItemType.TEXT) {
    return Text;
  }
  if (String(type) === ItemType.CHOICE) {
    return Choice;
  }
  if (String(type) === ItemType.OPENCHOICE) {
    return OpenChoice;
  }
  if (String(type) === ItemType.ATTATCHMENT) {
    return Attachment;
  }
  if (String(type) === ItemType.QUANTITY) {
    return Quantity;
  }
  return undefined;
}

export function isStringEmpty(string: string | undefined): boolean {
  return string === '' || string === null || string === undefined;
}

export function isReadOnly(item: QuestionnaireItem): boolean {
  if (item && item.readOnly) {
    return item.readOnly;
  }
  return false;
}

export function isRequired(item: QuestionnaireItem): boolean {
  if (item && item.required) {
    return item.required;
  }
  return false;
}

export function isRepeat(item: QuestionnaireItem): boolean {
  if (item && item.repeats) {
    return item.repeats;
  }
  return false;
}

export function isDataReceiver(item: QuestionnaireItem): boolean {
  return getCopyExtension(item) !== undefined;
}

export function isHiddenItem(item: QuestionnaireItem): boolean | undefined {
  return (
    getQuestionnaireHiddenExtensionValue(item) ||
    getQuestionnaireItemCodeValue(item, CodingSystemConstants.RenderingOptions) === RenderOptionCode.KunPdf
  );
}

export function getId(id?: string): string {
  if (id) {
    return id;
  }
  return uuid.v4();
}

export function renderPrefix(item: QuestionnaireItem): string {
  if (!item || !item.prefix) {
    return window.trustedTypes ? (window.trustedTypes.emptyHTML as unknown as string) : '';
  }
  return item.prefix;
}

export function getSublabelText(
  item: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  resources?: Resources
): string {
  if (item) {
    const markdown = getSublabelExtensionValue(item) || (window.trustedTypes ? (window.trustedTypes.emptyHTML as unknown as string) : '');
    return markdown
      ? getMarkdownValue(markdown, item, onRenderMarkdown, questionnaire, resources?.linkOpensInNewTab)
      : window.trustedTypes
      ? (window.trustedTypes.emptyHTML as unknown as string)
      : '';
  }
  return window.trustedTypes ? (window.trustedTypes.emptyHTML as unknown as string) : '';
}

export function getText(
  item: QuestionnaireItem,
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
  return window.trustedTypes ? (window.trustedTypes.emptyHTML as unknown as string) : '';
}

function getMarkdownValue(
  markdownText: string,
  item: QuestionnaireItem,
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string,
  questionnaire?: Questionnaire | null,
  srLinkText?: string
): string {
  const srLinkTextSpan = `<span style="position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px);">${
    srLinkText ? srLinkText : 'The link opens in a new tab'
  }</span>`;
  const itemValue = getHyperlinkExtensionValue(item);
  const questionnaireValue = questionnaire ? getHyperlinkExtensionValue(questionnaire) : undefined;

  const renderer = new marked.Renderer();
  renderer.link = (href: string, title: string, text: string): string => {
    const urlString = `<a href=${href} ${
      title ? `title=${title}` : ''
    } target="_blank" rel="noopener noreferrer" class="external">${text}${srLinkTextSpan}</a>`;
    return urlString;
  };
  const rendererSameWindow = new marked.Renderer();
  rendererSameWindow.link = (href: string, title: string, text: string): string => {
    const urlString = `<a href=${href} ${title ? `title=${title}` : ''} target="${openNewIfAbsolute(
      href
    )}" rel="noopener noreferrer">${text}${openNewIfAbsolute(href) === '_blank' ? srLinkTextSpan : ''}</a>`;
    return urlString;
  };

  if (onRenderMarkdown) {
    return onRenderMarkdown(item, markdownText.toString());
  }
  if (itemValue === HyperlinkTarget.SAME_WINDOW || (!itemValue && questionnaireValue === HyperlinkTarget.SAME_WINDOW)) {
    marked.setOptions({ renderer: rendererSameWindow });
    return marked(markdownText.toString());
  }

  marked.setOptions({ renderer: renderer });
  return marked(markdownText.toString());
}

export function getChildHeaderTag(item?: QuestionnaireItem, headerTag?: number): number {
  if (!headerTag || !item) {
    return Constants.DEFAULT_HEADER_TAG;
  }
  return hasHeader(item) ? headerTag + 1 : headerTag;
}

function hasHeader(item: QuestionnaireItem): boolean {
  if (!getText(item)) {
    return false;
  }
  if (!item || item.type !== Constants.ITEM_TYPE_GROUP) {
    return false;
  }
  return true;
}

export function getLinkId(item: QuestionnaireItem): string {
  if (item && item.linkId) {
    return item.linkId;
  }
  return uuid.v4();
}

export function getStringValue(answer: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>): string {
  if (answer && Array.isArray(answer)) {
    const stringAnswer = answer.filter(f => f.valueString);
    return stringAnswer.length > 0 ? stringAnswer.map(m => m.valueString).join(', ') : '';
  }
  return answer?.valueString ?? '';
}

export function getPDFStringValue(
  answer: QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer>,
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

export function getMaxLength(item: QuestionnaireItem): number | undefined {
  if (!item || !item.maxLength) {
    return undefined;
  }
  return Number(item.maxLength);
}

export function repeats(item: QuestionnaireItem): boolean {
  if (item && item.repeats) {
    return item.repeats;
  }
  return false;
}

export function shouldRenderRepeatButton(
  item: QuestionnaireItem,
  response: Array<QuestionnaireResponseItem> | undefined,
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

  if (item.readOnly) {
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
      return invalid.join(', ') + ' ' + (resources ? (resources as Resources).validationNotAllowed : 'er ikke tillatt');
    }
  }

  return getValidationTextExtension(item) || '';
}

export function getDecimalPattern(item: QuestionnaireItem): string | undefined {
  const step = getExtension(ExtensionConstants.STEP_URL, item);

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

export function isIE11(): boolean {
  // tslint:disable-next-line:no-string-literal
  return !!window['MSInputMethodContext'] && !!document['documentMode'];
}
