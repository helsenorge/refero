import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, Resource } from '../../../../../types/fhir';

import { Options } from '@helsenorge/form/components/radio-group';

import { StandardTable, StandardTableColumn, StandardTableRow } from './interface';
import ItemType from '../../../../../constants/itemType';
import { getContainedOptions } from '../../../../../util/choice';
import { getEnabledQuestionnaireItemsWithAnswers, transformAnswersToListOfStrings } from '../utils';

export const emptyTable = (): StandardTable => {
  return {
    headerRow: [],
    rows: [],
    id: '',
  };
};

export const emptyTableWithId = (id: string): StandardTable => {
  return {
    id: id || '',
    headerRow: [],
    rows: [],
  };
};

export const createTableColumn = (value: string, index: number, id: string): StandardTableColumn => {
  return {
    value,
    index,
    id,
  };
};

export const createHeaderRow = (choiceValues: Options[], hasExtraColumn: boolean): StandardTableColumn[] => {
  return [
    {
      id: `quest-${0}`,
      index: 0,
      value: '',
    },
    ...choiceValues.map((value, index) => ({
      id: `${value.type}-${index}`,
      index,
      value: value.label,
    })),
    ...(hasExtraColumn
      ? [
          {
            id: `comment-${choiceValues.length + 2}`,
            index: choiceValues.length + 2,
            value: '',
          },
        ]
      : []),
  ];
};

export const createBodyRows = (
  items: QuestionnaireItem[],
  responseItems: QuestionnaireResponse,
  needsExtraColumn: boolean,
  choiceValues?: Options[]
): StandardTableRow[] => {
  const answers = getEnabledQuestionnaireItemsWithAnswers(items, responseItems);

  return answers.map((item: QuestionnaireResponseItem, index: number) => {
    let columns = createColumnsFromAnswers(item, choiceValues);

    if (!needsExtraColumn) {
      columns = columns.slice(0, -1);
    }

    return {
      id: item.linkId,
      index,
      columns,
    };
  });
};

export const createRowsFromAnswersCodes = (item: QuestionnaireResponseItem, choiceValues?: Options[]): StandardTableColumn[] => {
  const answerValue = item.answer?.[0]?.valueCoding?.code;
  return (
    choiceValues?.map(value => ({
      id: `${value.type}-${value.type}`,
      index: Number(value.type ?? 0),
      value: answerValue === value.type ? 'X' : '',
    })) || []
  );
};

export const createColumnsFromAnswers = (item: QuestionnaireResponseItem, choiceValues?: Options[]): StandardTableColumn[] => {
  const firstItem = item?.item?.[0];

  const type = (firstItem as QuestionnaireItem)?.type;
  const answer = firstItem?.answer;
  const textAnswer = type && answer ? transformAnswersToListOfStrings(type, answer) : [];
  const choiceColumns = createRowsFromAnswersCodes(item, choiceValues);

  const columns: StandardTableColumn[] = [
    createTableColumn(item.text || '', 0, `${item.linkId}-question`),
    ...choiceColumns,
    createTableColumn(textAnswer.join(', '), choiceColumns.length + 1, `${item.linkId}-answer`),
  ];
  return columns;
};

export const getStandardTableObject = (
  items: QuestionnaireItem[],
  responseItems?: QuestionnaireResponse | null,
  resource?: Resource[]
): StandardTable => {
  if (!responseItems || items.length === 0) {
    return emptyTable();
  }

  const firstItem = findFirstChoiceItem(items);
  if (!firstItem) {
    return emptyTableWithId(responseItems.id || '');
  }

  const choiceValues = getContainedOptions(firstItem, resource) || [];
  const extraColumnNeeded = needsExtraColumn(items, responseItems, choiceValues);

  const rows = createBodyRows(items, responseItems, extraColumnNeeded, choiceValues);
  const header = createHeaderRow(choiceValues, extraColumnNeeded);

  return {
    id: responseItems.id || '',
    headerRow: header,
    rows,
  };
};

export const findFirstChoiceItem = (items: QuestionnaireItem[]): QuestionnaireItem | undefined => {
  return items.find((item: QuestionnaireItem) => item.type === ItemType.CHOICE);
};

export const needsExtraColumn = (items: QuestionnaireItem[], responseItems: QuestionnaireResponse, choiceValues?: Options[]): boolean => {
  const answers = getEnabledQuestionnaireItemsWithAnswers(items, responseItems) || [];

  return answers.some(item => {
    const lastColumnValue = createColumnsFromAnswers(item, choiceValues).slice(-1)[0]?.value;
    return lastColumnValue !== '';
  });
};
