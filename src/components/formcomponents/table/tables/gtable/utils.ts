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

export const columnsForRowIndex = (answerItems: QuestionnaireItemWithAnswers[], rowIdx: number): IGTableColumn[] => {
  return Array.from({ length: answerItems.length }, (_, colIdx) => {
    const item = answerItems[colIdx];
    if (!item) {
      return {
        id: `empty-${rowIdx}-${colIdx}`,
        index: colIdx,
        value: '',
      };
    }
    return {
      id: item.linkId,
      index: colIdx,
      value: getValueFromAnswer(rowIdx, item),
    };
  });
};

export const createTableRows = (answerItem: QuestionnaireItemWithAnswers[]): IGTableRow[] => {
  const numberOfRows = getNumberOfRowsGTable(answerItem);

  return Array.from({ length: numberOfRows }, (_, rowIdx) => ({
    id: `empty-${rowIdx}`,
    index: rowIdx,
    columns: columnsForRowIndex(answerItem, rowIdx),
  }));
};

export const createTableHeader = (items: QuestionnaireItem[]): IGTableHeaderItem[] =>
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
