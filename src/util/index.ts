import { QuestionnaireItemTypeList, QuestionnaireResponseItem } from '../types/fhir';
import Group from '../components/formcomponents/group/group';
import Choice from '../components/formcomponents/choice/choice';
import Boolean from '../components/formcomponents/boolean/boolean';
import Decimal from '../components/formcomponents/decimal/decimal';
import Integer from '../components/formcomponents/integer/integer';
import Date from '../components/formcomponents/date/date';
import Time from '../components/formcomponents/date/time';
import DateTime from '../components/formcomponents/date/date-time';
import Display from '../components/formcomponents/display/display';
import StringComponent from '../components/formcomponents/string/string';
import Text from '../components/formcomponents/text/text';
import OpenChoice from '../components/formcomponents/open-choice/open-choice';
import Attachment from '../components/formcomponents/attachment/attachment';
import Quantity from '../components/formcomponents/quantity/quantity';
import * as uuid from 'uuid';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../types/fhir';
import Constants from '../constants/index';
import ExtensionConstants from '../constants/extensions';
import { Resources } from '../util/resources';
import {
  getMaxOccursExtensionValue,
  getMarkdownExtensionValue,
  getValidationTextExtension,
  getQuestionnaireHiddenExtensionValue,
  getExtension,
} from './extension';
import marked from 'marked';
import DOMPurify from 'dompurify';

const renderer = new marked.Renderer();
renderer.link = (href: string, title: string, text: string): string => {
  return `<a href=${href} title=${title} target="_blank" class="external">${text}</a>`;
};
marked.setOptions({ renderer: renderer });
import { isValid, invalidNodes } from '@helsenorge/core-utils/validation';

export function getComponentForItem(type: QuestionnaireItemTypeList) {
  if (String(type) === 'group') {
    return Group;
  }
  if (String(type) === 'display') {
    return Display;
  }
  if (String(type) === 'boolean') {
    return Boolean;
  }
  if (String(type) === 'decimal') {
    return Decimal;
  }
  if (String(type) === 'integer') {
    return Integer;
  }
  if (String(type) === 'date') {
    return Date;
  }
  if (String(type) === 'dateTime') {
    return DateTime;
  }
  if (String(type) === 'time') {
    return Time;
  }
  if (String(type) === 'string') {
    return StringComponent;
  }
  if (String(type) === 'text') {
    return Text;
  }
  if (String(type) === 'choice') {
    return Choice;
  }
  if (String(type) === 'open-choice') {
    return OpenChoice;
  }
  if (String(type) === 'attachment') {
    return Attachment;
  }
  if (String(type) === 'quantity') {
    return Quantity;
  }
  return undefined;
}

export function isStringEmpty(string: string | undefined): boolean {
  return string === '' || string === null || string === undefined;
}

export function isReadOnly(item: QuestionnaireItem) {
  if (item && item.readOnly) {
    return item.readOnly;
  }
  return false;
}

export function isRequired(item: QuestionnaireItem) {
  if (item && item.required) {
    return item.required;
  }
  return false;
}

export function isRepeat(item: QuestionnaireItem) {
  if (item && item.repeats) {
    return item.repeats;
  }
  return false;
}

export function isHiddenItem(item: QuestionnaireItem) {
  return getQuestionnaireHiddenExtensionValue(item);
}

export function getId(id?: string) {
  if (id) {
    return id;
  }
  return uuid.v4();
}

export function renderPrefix(item: QuestionnaireItem) {
  if (!item || !item.prefix) {
    return '';
  }
  return item.prefix;
}

export function getText(item: QuestionnaireItem) {
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;

    if (markdown) {
      return markdownToHtml(markdown.toString());
    } else if (item.text) {
      return item.text;
    }
  }
  return '';
}

export function markdownToHtml(markdown: string) {
  const generatedHtml = marked(markdown);
  return DOMPurify.sanitize(generatedHtml);
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

export function getLinkId(item: QuestionnaireItem) {
  if (item && item.linkId) {
    return item.linkId;
  }
  return uuid.v4();
}

export function getStringValue(answer: QuestionnaireResponseAnswer) {
  if (answer && answer.valueString) {
    return answer.valueString;
  }
  return '';
}

export function getPDFStringValue(answer: QuestionnaireResponseAnswer, resources?: Resources) {
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
  if (item.deactivated) {
    return false;
  }

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

export function getDecimalPattern(item: QuestionnaireItem) {
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

export function profile(tag: string, func: () => void) {
  let start = performance.now();
  console.log('START: ', tag, start, 'ms');
  func();
  let end = performance.now();
  console.log('END: ', tag, end, 'ms');
  console.log('TOTAL: ', tag, end - start, 'ms');
}
