import { Coding, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, Resource } from '../../../../../types/fhir';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { Options } from '@helsenorge/form/components/radio-group';

import { IStandardTable, IStandardTableColumn, IStandardTableRow } from './interface';
import codeSystems from '../../../../../constants/codingsystems';
import ItemType from '../../../../../constants/itemType';
import { getContainedOptions } from '../../../../../util/choice';
import { QuestionnaireItemWithAnswers } from '../interface';
import { getDisplayFromCodingSystem, getEnabledQuestionnaireItemsWithAnswers, transformAnswersToListOfStrings } from '../utils';

export const emptyTable = (): IStandardTable => {
  return {
    headerRow: [],
    rows: [],
    id: '',
  };
};

export const emptyTableWithId = (id: string): IStandardTable => {
  return {
    id: id || '',
    headerRow: [],
    rows: [],
  };
};

export const createTableColumn = (value: string, index: number, id: string): IStandardTableColumn => {
  return {
    value,
    index,
    id,
  };
};

export const createHeaderRow = (choiceValues: Options[], hasExtraColumn: boolean): IStandardTableColumn[] => {
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
const processItem = (
  item: QuestionnaireItemWithAnswers,
  index: number,
  needsExtraColumn: boolean,
  choiceValues?: Options[]
): IStandardTableRow[] => {
  const columns = createColumnsFromAnswers(item, choiceValues);
  const processedColumns = needsExtraColumn ? columns : columns.slice(0, -1);

  const row: IStandardTableRow = {
    id: item.linkId,
    index,
    columns: processedColumns,
  };

  const childRows = item.item
    ? item.item.flatMap((child, childIndex) => processItem(child, childIndex, needsExtraColumn, choiceValues))
    : [];

  return [row, ...childRows];
};

export const createBodyRows = (
  items: QuestionnaireItem[],
  responseItems: QuestionnaireResponse,
  needsExtraColumn: boolean,
  choiceValues?: Options[]
): IStandardTableRow[] => {
  const answers = getEnabledQuestionnaireItemsWithAnswers(items, responseItems);

  return answers.flatMap((item, index) => processItem(item, index, needsExtraColumn, choiceValues));
};

export const createRowsFromAnswersCodes = (item: QuestionnaireResponseItem, choiceValues?: Options[]): IStandardTableColumn[] => {
  return (
    choiceValues?.map(value => ({
      id: `${value.type}-${value.type}`,
      index: Number(value.type ?? 0),
      value: item.answer?.some(x => {
        return x.valueCoding?.code === value.type;
      })
        ? 'X'
        : '',
    })) || []
  );
};

export const createColumnsFromAnswers = (item: QuestionnaireItemWithAnswers, choiceValues?: Options[]): IStandardTableColumn[] => {
  const type = item?.type;
  const answer = item?.answer;
  const choiceColumns = createRowsFromAnswersCodes(item, choiceValues);

  const textAnswer = type && answer && choiceColumns.every(x => x.value === '') ? transformAnswersToListOfStrings(type, answer) : [];
  const columns: IStandardTableColumn[] = [
    createTableColumn(item.text || '', 0, `${item.linkId}-question`),
    ...choiceColumns,
    createTableColumn(textAnswer.join(', '), choiceColumns.length + 1, `${item.linkId}-answer`),
  ];
  return columns;
};

export const getStandardTableObject = (
  items: QuestionnaireItem[],
  responseItems?: QuestionnaireResponse | null,
  resource?: Resource[],
  SortDirection?: SortDirection,
  displayToSortBy?: string
): IStandardTable => {
  if (!responseItems || items.length === 0) {
    return emptyTable();
  }

  const firstItem = findFirstChoiceItem(items);
  if (!firstItem) {
    return emptyTableWithId(responseItems.id || '');
  }

  const choiceValues = getContainedOptions(firstItem, resource) || [];
  const extraColumnNeeded = needsExtraColumn(items, responseItems);

  const rows = createBodyRows(items, responseItems, extraColumnNeeded, choiceValues);
  const header = createHeaderRow(choiceValues, extraColumnNeeded);

  if (displayToSortBy !== undefined && SortDirection) {
    const sortIndex = header.findIndex(header => header.value === displayToSortBy);
    return sortTableRows({ id: responseItems.id || '', headerRow: header, rows: rows }, sortIndex, SortDirection);
  }
  return {
    id: responseItems.id || '',
    headerRow: header,
    rows,
  };
};

export const findFirstChoiceItem = (items: QuestionnaireItem[]): QuestionnaireItem | undefined => {
  return items.find((item: QuestionnaireItem) => item.type === ItemType.CHOICE);
};

export const needsExtraColumn = (items: QuestionnaireItem[], responseItems: QuestionnaireResponse): boolean => {
  const answers = getEnabledQuestionnaireItemsWithAnswers(items, responseItems) || [];
  return answers.some(item => {
    return item?.item?.length && item.item.length > 0;
  });
};

export const sortTableRows = (table: IStandardTable, columnIndex: number, sortOrder: SortDirection): IStandardTable => {
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

export const getDisplayToSortBy = (coding: Coding[]): string | undefined => {
  const sortDisplay = getDisplayFromCodingSystem(coding, codeSystems.TableOrderingColum);
  return sortDisplay ? sortDisplay : undefined;
};
