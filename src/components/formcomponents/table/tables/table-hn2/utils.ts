import * as uuid from 'uuid';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { ITableH2Row } from './interface';
import CodingSystems, { TableColumnName, TableOrderingColum } from '../../../../../constants/codingsystems';
import codeSystems from '../../../../../constants/codingsystems';
import ItemType from '../../../../../constants/itemType';
import { filterEnabledQuestionnaireItems, findIndexByCode, getValueIfDataReceiver, transformAnswersToListOfStrings } from '../utils';

const getNumberOfColums = (items: QuestionnaireItem[]): number =>
  Math.max(...items.map(item => findIndexByCode(item, codeSystems.TableColumn)));

export const getTableHN2bodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null,
  sortColumnIndex?: number,
  sortOrder?: SortDirection
): ITableH2Row[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }

  const maxColumns = getNumberOfColums(items);

  const itemsToShow = filterEnabledQuestionnaireItems(items, questionnaireResponse);

  const tableRows: ITableH2Row[] = itemsToShow.reduce<ITableH2Row[]>((acc, item) => {
    const columnIndex = findIndexByCode(item, codeSystems.TableColumn) - 1;
    const answer = getValueIfDataReceiver(item, questionnaireResponse) || [];
    const columnText = item.type === ItemType.DISPLAY ? item.text || '' : transformAnswersToListOfStrings(item.type, answer).join(', ');

    let row = acc.find(r => r.columns[columnIndex]?.text === '');
    if (!row) {
      row = {
        id: uuid.v4(),
        columns: Array.from({ length: maxColumns }, (_, colIdx) => ({
          id: `empty-${colIdx}`,
          text: '',
          index: colIdx + 1,
        })),
      };
      acc.push(row);
    }

    row.columns[columnIndex] = {
      id: item.linkId,
      text: columnText,
      index: columnIndex + 1,
    };

    return acc;
  }, []);
  if (!!sortColumnIndex && !!sortOrder) {
    return sortTableRows(tableRows, sortColumnIndex, sortOrder);
  }

  return tableRows;
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

type HeaderColumn = { display: string; code?: string };

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
