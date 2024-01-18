import * as uuid from 'uuid';

import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from '../../../../../types/fhir';

import { IGTable, IGTableColumn, IGTableHeaderItem, IGTableRow } from './interface';
import { QuestionnaireItemWithAnswers } from '../interface';
import { getEnabledQuestionnaireItemsWithAnswers, getPrimitiveValueFromItemType } from '../utils';

export const getNumberOfRowsGTable = (items: QuestionnaireResponseItem[]): number => {
  if (items.length === 0) {
    return 0;
  }
  const numbers = items.map(item => item.answer?.length || 0);
  return Math.max(...numbers);
};
export const getValueFromAnswer = (rowIdx: number, item?: QuestionnaireItemWithAnswers): string => {
  const answerItem = item?.answer?.[rowIdx];
  if (!answerItem) {
    return '';
  }
  if (!!answerItem?.item?.length && answerItem.item.length > 0) {
    return '';
  }
  return getPrimitiveValueFromItemType(item.type, answerItem).toString() || '';
};

export const columnsForRowIndex = (answerItems: QuestionnaireItemWithAnswers[], rowIdx: number): IGTableColumn[] =>
  answerItems.map((item, colIdx) => ({
    id: `empty-${rowIdx}-${colIdx}`,
    index: colIdx,
    value: getValueFromAnswer(rowIdx, item),
  }));

export const createTableRows = (items: QuestionnaireItemWithAnswers[]): IGTableRow[] => {
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
