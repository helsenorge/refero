import { Coding, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { HeaderColumn, ITableH2Column, ITableH2Row } from './interface';
import CodingSystems, { TableColumnName, TableOrderingColum } from '../../../../../constants/codingsystems';
import codeSystems from '../../../../../constants/codingsystems';
import ItemType from '../../../../../constants/itemType';
import { QuestionnaireItemWithAnswers } from '../interface';
import {
  findCodeBySystem,
  findIndexByCode,
  getCodeFromCodingSystem,
  getEnabledQuestionnaireItemsWithAnswers,
  sortByItemType,
  transformAnswersToListOfStrings,
} from '../utils';

export const groupItemsByColumn = (items: QuestionnaireItem[]): Map<number, QuestionnaireItem[]> =>
  items.reduce((acc, item) => {
    const columnIndex = findIndexByCode(item, codeSystems.TableColumn);
    const itemsInColumn = acc.get(columnIndex) || [];
    return acc.set(columnIndex, [...itemsInColumn, item]);
  }, new Map<number, QuestionnaireItem[]>());

export const createTableStructure = (items: QuestionnaireItem[], itemsToShow: QuestionnaireItemWithAnswers[]): ITableH2Row[] => {
  const itemsByColumnIndex = groupItemsByColumn(items);

  const calculateNumberOfRows = (itemsMap: Map<number, QuestionnaireItem[]>): number =>
    Math.max(...Array.from(itemsMap.values(), columnItems => columnItems.length));

  const numberOfRows = calculateNumberOfRows(itemsByColumnIndex);
  const numberOfColumns = itemsByColumnIndex.size;

  return Array.from({ length: numberOfRows }, (_, rowIndex) => ({
    id: `row-${rowIndex + 1}`,
    columns: createColumnsForRow(rowIndex, numberOfColumns, itemsByColumnIndex, itemsToShow),
  }));
};

export const createColumnsForRow = (
  rowIndex: number,
  numberOfColumns: number,
  itemsByColumnIndex: Map<number, QuestionnaireItem[]>,
  itemsToShow: QuestionnaireItemWithAnswers[]
): ITableH2Column[] =>
  Array.from({ length: numberOfColumns }, (_, colIndex) => {
    const itemsInColumn = itemsByColumnIndex.get(colIndex + 1) || [];
    const item = itemsInColumn[rowIndex];
    if (!item) {
      return {
        id: `empty-${rowIndex}-${colIndex}`,
        index: colIndex + 1,
        text: '',
      };
    }
    return {
      id: item.linkId,
      index: findIndexByCode(item, codeSystems.TableColumn),
      type: item.type,
      text: getValueFromItemsToShow(item, itemsToShow),
    };
  });

export const getValueFromItemsToShow = (item: QuestionnaireItem | undefined, itemsToShow: QuestionnaireItemWithAnswers[]): string => {
  const itemToShow = itemsToShow.find(itemToShow => itemToShow.linkId === item?.linkId);
  if (!itemToShow) {
    return '';
  }
  const columnText =
    itemToShow.type === ItemType.DISPLAY || itemToShow.type === ItemType.GROUP
      ? itemToShow.text || ''
      : transformAnswersToListOfStrings(itemToShow.type, itemToShow.answer).join(', ');
  return columnText;
};

export const getTableHN2bodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null,
  sortColumnIndex?: number,
  sortOrder?: SortDirection
): ITableH2Row[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const itemsToShow = getEnabledQuestionnaireItemsWithAnswers(items, questionnaireResponse);
  const structure = createTableStructure(items, itemsToShow);
  const tableWithRemovedEmptyRows = structure.filter(row => row.columns.some(column => column.text !== ''));

  if (!!sortColumnIndex && !!sortOrder) {
    return sortTableRows(tableWithRemovedEmptyRows, sortColumnIndex, sortOrder);
  }
  return tableWithRemovedEmptyRows;
};

/* SORTING  */
export const getIndexToSortBy = (coding: Coding[]): number | undefined => {
  const sortCode = getCodeFromCodingSystem(coding, codeSystems.TableOrderingColum);
  return sortCode ? Number(sortCode) - 1 : undefined;
};

export const sortTableRows = (table: ITableH2Row[], columnIndex: number, sortOrder: SortDirection): ITableH2Row[] => {
  return table.sort((a, b) => {
    const aValue = a?.columns.length > columnIndex ? a?.columns[columnIndex]?.text || '' : '';
    const bValue = b?.columns.length > columnIndex ? b?.columns[columnIndex]?.text || '' : '';
    const aColumn = a.columns[columnIndex];
    const type = aColumn?.type;
    return sortByItemType(aValue, bValue, sortOrder, type);
  });
};
export const findCodeForColumnToSortBy = (coding: Coding[]): Coding | undefined => {
  const code = findCodeBySystem(coding, TableOrderingColum);
  const columnsToDisplay = coding?.filter(codeElement => codeElement.system === CodingSystems.TableColumnName);
  const codeForSortedColumn = code[0]?.code;
  const columnToSortBy = columnsToDisplay?.find(coding => coding?.code === codeForSortedColumn);
  return columnToSortBy;
};

export const getHeaderColumns = (coding: Coding[]): HeaderColumn[] => {
  return findCodeBySystem(coding, TableColumnName).map(code => ({
    display: code.display || '',
    code: code.code,
  }));
};
