import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { HeaderColumn, ITableH2Column, ITableH2Row } from './interface';
import CodingSystems, { TableColumnName, TableOrderingColum } from '../../../../../constants/codingsystems';
import codeSystems from '../../../../../constants/codingsystems';
import ItemType from '../../../../../constants/itemType';
import { QuestionnaireItemWithAnswers } from '../interface';
import { findIndexByCode, getEnabledQuestionnaireItemsWithAnswers, transformAnswersToListOfStrings } from '../utils';

export const createTableStructure = (items: QuestionnaireItem[], itemsToShow: QuestionnaireItemWithAnswers[]): ITableH2Row[] => {
  const groupItemsByColumn = (items: QuestionnaireItem[]): Map<number, QuestionnaireItem[]> =>
    items.reduce((acc, item) => {
      const columnIndex = findIndexByCode(item, codeSystems.TableColumn);
      const itemsInColumn = acc.get(columnIndex) || [];
      return acc.set(columnIndex, [...itemsInColumn, item]);
    }, new Map<number, QuestionnaireItem[]>());

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

const createColumnsForRow = (
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
      text: getValueFromItemsToShow(item, itemsToShow),
    };
  });

const getValueFromItemsToShow = (item: QuestionnaireItem | undefined, itemsToShow: QuestionnaireItemWithAnswers[]): string => {
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

export const sortTableRows = (table: ITableH2Row[], columnIndex: number, sortOrder: SortDirection): ITableH2Row[] => {
  return table.sort((a, b) => {
    const aValue = a?.columns.length > columnIndex ? a?.columns[columnIndex]?.text || '' : '';
    const bValue = b?.columns.length > columnIndex ? b?.columns[columnIndex]?.text || '' : '';

    return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
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
export const getCodeFromCodingSystem = (coding: Coding[], codingSystem: string): string | undefined => {
  const code = findCodeBySystem(coding, codingSystem);
  return code[0]?.code;
};
//TODO: Dette finnes fra før, kan bruke eksisterende funksjonalitet
export function findCodeBySystem<T extends { system?: string }>(coding: T[], system?: string): T[] {
  return coding.filter(code => code.system === system);
}

/* TABLE HEADER */
export const transformCodingToSortDirection = (coding: Coding[]): SortDirection | undefined => {
  const code = getCodeFromCodingSystem(coding, codeSystems.TableOrderingFunctions);
  return !!code ? (code === 'ASC' ? SortDirection.asc : SortDirection.desc) : undefined;
};

export const getIndexToSortBy = (coding: Coding[]): number | undefined => {
  const sortCode = getCodeFromCodingSystem(coding, codeSystems.TableOrderingColum);
  return sortCode ? Number(sortCode) - 1 : undefined;
};
