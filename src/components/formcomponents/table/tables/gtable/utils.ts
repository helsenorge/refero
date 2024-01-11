import * as uuid from 'uuid';

import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../../types/fhir';

import { IGTable, IGTableColumn, IGTableHeaderItem, IGTableRow } from './interface';
import { findFirstDefinedProperty, getEnabledQuestionnaireItemsWithAnswers } from '../utils';

export const getNumberOfRowsGTable = (items: QuestionnaireResponseItem[]): number => {
  if (items.length === 0) {
    return 0;
  }
  const numbers = items.map(item => item.answer?.length || 0);
  return Math.max(...numbers);
};
export const getValueFromAnswer = (rowIdx: number, answer?: QuestionnaireResponseItemAnswer[]): string => {
  const answerItem = answer?.[rowIdx];

  if (!answerItem) {
    return '';
  }
  if (!!answerItem?.item?.length && answerItem.item.length > 0) {
    return '';
  }
  // return transformAnswersToListOfStrings((answerItem as QuestionnaireItem).type, answerItem).toString() || '';
  // TODO: use existing functionality to get value from answer, also see if we can add the original item to the answer
  return findFirstDefinedProperty<QuestionnaireResponseItemAnswer>(answerItem)?.toString() || '';
};

export const columnsForRowIndex = (answerItems: QuestionnaireResponseItem[], rowIdx: number): IGTableColumn[] =>
  answerItems.map((item, colIdx) => ({
    id: `empty-${rowIdx}-${colIdx}`,
    index: colIdx,
    value: getValueFromAnswer(rowIdx, item.answer),
  }));

export const createTableRows = (items: QuestionnaireResponseItem[]): IGTableRow[] => {
  const numberOfRows = getNumberOfRowsGTable(items);

  return Array.from({ length: numberOfRows }, (_, rowIdx) => ({
    id: `empty-${rowIdx}`,
    index: rowIdx,
    columns: columnsForRowIndex(items, rowIdx),
  }));
};

export const createTableHeader = (items: QuestionnaireResponseItem[]): IGTableHeaderItem[] =>
  items.map(item => ({
    id: item.linkId,
    value: item.text || '',
  }));

export const getGtablebodyObject = (items: QuestionnaireItem[], questionnaireResponse?: QuestionnaireResponse | null): IGTable => {
  if (!questionnaireResponse || items.length === 0) {
    return {
      id: uuid.v4(),
      headerRow: [],
      rows: [],
    };
  }
  const answerItems = getEnabledQuestionnaireItemsWithAnswers(items, questionnaireResponse);

  const table: IGTable = {
    id: uuid.v4(),
    headerRow: createTableHeader(answerItems),
    rows: createTableRows(answerItems),
  };

  return table;
};
