import { Coding, Extension, Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { Extensions } from '../../constants/extensions';
import { queryHelpers, userEvent, screen, fireEvent, findByLabelText } from './test-utils/test-utils';
import valueSet from '../../constants/valuesets';

export function inputAnswer(linkId: string, answer: number | string, element: HTMLElement) {
  const input = findItem(linkId, element);
  userEvent.type(input, answer.toString());
  userEvent.tab();
}

export function inputTextAnswer(linkId: string, answer: string, element: HTMLElement) {
  const textarea = findItem(linkId, element);
  userEvent.type(textarea, answer);
  userEvent.tab();
}
export function selectBoolean(linkId: string, element: HTMLElement) {
  const item = findItem(linkId, element);
  fireEvent.change(item, { target: { checked: true } });
  // userEvent.selectOptions(item, 'true');
}

export function selectRadioButtonOption(linkId: string, index: number, element: HTMLElement) {
  const id = `${linkId}-hn-${index}`;
  const item = findItem(id, element);
  userEvent.click(item);
}

export async function changeCheckBoxOption(label: string, element: HTMLElement) {
  userEvent.click(await findByLabelText(element, label));
}

export function findItem(linkId: string, element: HTMLElement) {
  const id = `item_${linkId}`;
  return findItemById(id, element);
}
export function findItemById(id: string, element: HTMLElement) {
  const el = element.querySelector(`#${id}`);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${id}"]`, element);
  }
  return el;
}
export function queryItemById(id: string, element: HTMLElement) {
  const el = element.querySelectorAll(`#${id}`);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${id}"]`, element);
  }
  return el;
}

export async function findItemByDispayValue(value: string) {
  const el = await screen.findByDisplayValue(value);
  if (!el) {
    throw queryHelpers.getElementError(`Found no elements with the [id="${value}"]`, el);
  }
  return el;
}

export function findQuestionnaireItem(linkId: string, items?: QuestionnaireItem[]): QuestionnaireItem | undefined {
  if (items === undefined) return;
  for (let item of items) {
    if (item.linkId === linkId) return item;

    const found = findQuestionnaireItem(linkId, item.item);
    if (found !== undefined) return found;
  }
  return undefined;
}
export function findQuestionnaireItemInQuestionnair({
  linkId,
  questionnaire,
}: {
  linkId?: string;
  questionnaire?: Questionnaire;
}): QuestionnaireItem | undefined {
  if (!questionnaire || !linkId) return undefined;

  return findQuestionnaireItem(linkId, questionnaire?.item);
}

type CreateQuestionnaire = {
  questionnaire?: Partial<Questionnaire>;
  items?: QuestionnaireItem[];
};

export function createQuestionnaire({ questionnaire, items }: CreateQuestionnaire): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'draft',
    ...(items && { item: items }),
    ...(questionnaire && { ...questionnaire }),
  };
}

export const createQuestionnareResponseWithAnswers = (
  questionnaireResponse: QuestionnaireResponse,
  responseItem: QuestionnaireResponseItem[]
): QuestionnaireResponse => {
  return {
    ...questionnaireResponse,
    item: questionnaireResponse?.item?.map(x => {
      const answerItem = responseItem.find(y => y.linkId === x.linkId);
      if (!!answerItem) {
        return {
          ...x,
          answer: answerItem.answer,
        };
      }
      return x;
    }),
  };
};
const createExtension = ({ ...rest }: Extension): Extension => {
  return {
    ...rest,
  };
};

export const createQuestionnaireUnitExtension = ({ value, extension }: { extension?: Extension; value: Coding }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueCoding: value,
    url: Extensions.QUESTIONNAIRE_UNIT_URL,
  });
};
export const createMarkdownExtension = ({ value, extension }: { extension?: Extension; value: string }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueMarkdown: value,
    url: Extensions.MARKDOWN_URL,
  });
};
export const createSublabelExtension = ({ value, extension }: { extension?: Extension; value: string }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueMarkdown: value,
    url: Extensions.SUBLABEL_URL,
  });
};
export const createMinValueExtension = ({ value, extension }: { extension?: Extension; value: number }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueInteger: value,
    url: Extensions.MIN_VALUE_URL,
  });
};
export const createMaxValueExtension = ({ value, extension }: { extension?: Extension; value: number }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueInteger: value,
    url: Extensions.MAX_VALUE_URL,
  });
};
export const creatValidationTextExtension = ({ value, extension }: { extension?: Extension; value: string }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueString: value,
    url: Extensions.VALIDATIONTEXT_URL,
  });
};
export const createMaxDecimalPlacesExtension = ({ value, extension }: { extension?: Extension; value: number }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueInteger: value,
    url: Extensions.STEP_URL,
  });
};
export const createRepeatstextPlacesExtension = ({ value, extension }: { extension?: Extension; value: string }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueString: value,
    url: Extensions.REPEATSTEXT_URL,
  });
};

export const createMinOccursExtension = ({ value, extension }: { extension?: Extension; value: number }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueInteger: value,
    url: Extensions.MIN_OCCURS_URL,
  });
};
export const createMaxOccursExtension = ({ value, extension }: { extension?: Extension; value: number }): Extension => {
  return createExtension({
    ...(extension && { ...extension }),
    valueInteger: value,
    url: Extensions.MAX_OCCURS_URL,
  });
};

export function createIDataReceiverExpressionExtension(value: string): Extension {
  return createExtension({
    url: Extensions.COPY_EXPRESSION_URL,
    valueString: value,
  });
}
export function createItemControlExtension(code: string): Extension {
  return createExtension({
    url: Extensions.ITEMCONTROL_URL,
    valueCodeableConcept: {
      coding: [
        {
          code,
          system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
        },
      ],
    },
  });
}
