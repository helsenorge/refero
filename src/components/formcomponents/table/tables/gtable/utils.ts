import { Coding, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import * as uuid from 'uuid';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { IGTable, IGTableColumn, IGTableHeaderItem, IGTableRow } from './interface';
import codeSystems from '../../../../../constants/codingsystems';
import { QuestionnaireItemWithAnswers } from '../interface';
import { getCodeFromCodingSystem, getEnabledQuestionnaireItemsWithAnswers, getPrimitiveValueFromItemType } from '../utils';

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

export const getGtablebodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null,
  sortDir?: SortDirection,
  linkIdToSortBy?: string
): IGTable => {
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
  if (sortDir && linkIdToSortBy) {
    return sortTableRows(
      table,
      table.headerRow.findIndex(header => header.id === linkIdToSortBy),
      sortDir
    );
  }
  return table;
};

export const sortTableRows = (table: IGTable, columnIndex: number, sortOrder: SortDirection): IGTable => {
  const sortedTable = {
    headerRow: table.headerRow,
    id: table.id,
    rows: table.rows.sort((a, b) => {
      const aValue = a?.columns.length > columnIndex ? a?.columns[columnIndex]?.value || '' : '';
      const bValue = b?.columns.length > columnIndex ? b?.columns[columnIndex]?.value || '' : '';

      return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }),
  };
  return sortedTable;
};

export const getLinkIdToSortBy = (coding: Coding[]): string | undefined => {
  const sortDisplay = getCodeFromCodingSystem(coding, codeSystems.TableOrderingColum);
  return sortDisplay ? sortDisplay : undefined;
};
