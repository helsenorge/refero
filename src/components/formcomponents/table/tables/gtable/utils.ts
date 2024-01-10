import * as uuid from 'uuid';

import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../../types/fhir';

import { IGTable, IGTableColumn, IGTableHeaderItem, IGTableRow } from './interface';
import { findFirstDefinedProperty, getEnabledQuestionnaireItemsWithAnswers } from '../utils';

const getNumberOfRowsGTable = (items: QuestionnaireResponseItem[]): number => {
  if (items.length === 0) {
    return 0;
  }
  const numbers = items.map(item => item.answer?.length || 0);
  return Math.max(...numbers);
};
const getValueFromAnswer = (rowIdx: number, answer?: QuestionnaireResponseItemAnswer[]): string => {
  const answerItem = answer?.[rowIdx];

  if (!answerItem) {
    return '';
  }
  if (!!answerItem?.item?.length && answerItem.item.length > 0) {
    return '';
  }

  return findFirstDefinedProperty<QuestionnaireResponseItemAnswer>(answerItem)?.toString() || '';
};

const columnsForRowIndex = (answerItems: QuestionnaireResponseItem[], rowIdx: number): IGTableColumn[] =>
  answerItems.map((item, colIdx) => ({
    id: `empty-${rowIdx}-${colIdx}`,
    index: colIdx,
    value: getValueFromAnswer(rowIdx, item.answer),
  }));

export const getGtablebodyObject = (items: QuestionnaireItem[], questionnaireResponse?: QuestionnaireResponse | null): IGTable => {
  if (!questionnaireResponse || items.length === 0) {
    return {
      id: uuid.v4(),
      rows: [],
    };
  }

  const answerItems = getEnabledQuestionnaireItemsWithAnswers(items, questionnaireResponse);
  const numberOfRows = getNumberOfRowsGTable(answerItems);

  const tableHeader: IGTableHeaderItem[] = answerItems.map(item => ({
    id: item.linkId,
    value: item.text || '',
  }));
  const tableRows: IGTableRow[] = Array.from({ length: numberOfRows }, (_, rowIdx) => ({
    id: `empty-${rowIdx}`,
    index: rowIdx,
    columns: columnsForRowIndex(answerItems, rowIdx),
  }));

  const table: IGTable = {
    id: uuid.v4(),
    headerRow: tableHeader,
    rows: tableRows,
  };

  return table;
};
