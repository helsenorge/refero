import { Coding, QuestionnaireItem, QuestionnaireResponse, Resource } from 'fhir/r4';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { IStandardTable, IStandardTableColumn, IStandardTableRow } from './interface';
import { QuestionnaireItemWithAnswers } from '../interface';
import {
  getDisplayFromCodingSystem,
  getEnabledQuestionnaireItemsWithAnswers,
  sortByItemType,
  transformAnswersToListOfStrings,
} from '../utils';

import codeSystems from '@/constants/codingsystems';
import ItemType, { IItemType } from '@/constants/itemType';
import { Options } from '@/types/formTypes/radioGroupOptions';
import { getContainedOptions, getSystemForItem } from '@/util/choice';

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

export const createTableColumn = (value: string, index: number, id: string, type: IItemType | undefined): IStandardTableColumn => {
  return {
    value,
    type,
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
      id: `${value.type}-${index + 1}`,
      index: index + 1,
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
  choiceValues?: Options[],
  system?: string,
  resource?: Resource[]
): IStandardTableRow[] => {
  const columns = createColumnsFromAnswers(item, choiceValues, system, resource);
  const processedColumns = needsExtraColumn ? columns : columns.slice(0, -1);

  const row: IStandardTableRow = {
    id: item.linkId,
    index,
    columns: processedColumns,
  };

  const childRows = item.item
    ? item.item.flatMap((child, childIndex) => processItem(child, childIndex, needsExtraColumn, choiceValues, system, resource))
    : [];

  return [row, ...childRows];
};

export const createBodyRows = async (
  items: QuestionnaireItem[],
  responseItems: QuestionnaireResponse,
  needsExtraColumn: boolean,
  choiceValues?: Options[],
  system?: string,
  resource?: Resource[]
): Promise<IStandardTableRow[]> => {
  const answers = await getEnabledQuestionnaireItemsWithAnswers(items, responseItems);

  return answers.flatMap((item, index) => processItem(item, index, needsExtraColumn, choiceValues, system, resource));
};

export const createRowsFromAnswersCodes = (
  item: QuestionnaireItemWithAnswers,
  choiceValues?: Options[],
  system?: string,
  resource?: Resource[]
): IStandardTableColumn[] => {
  const itemSystem = getSystemForItem(item, resource);
  return (
    choiceValues?.map(value => ({
      id: `${value.type}-${value.type}`,
      index: Number(value.type ?? 0),
      type: item.type,
      value:
        item.answer?.some(x => {
          return x.valueCoding?.code === value.type;
        }) && itemSystem === system
          ? 'X'
          : '',
    })) || []
  );
};

export const createColumnsFromAnswers = (
  item: QuestionnaireItemWithAnswers,
  choiceValues?: Options[],
  system?: string,
  resource?: Resource[]
): IStandardTableColumn[] => {
  const type = item?.type;
  const answer = item?.answer;
  const choiceColumns = createRowsFromAnswersCodes(item, choiceValues, system, resource);

  const textAnswer = type && answer && choiceColumns.every(x => x.value === '') ? transformAnswersToListOfStrings(type, answer) : [];
  const columns: IStandardTableColumn[] = [
    createTableColumn(item.text || '', 0, `${item.linkId}-question`, type),
    ...choiceColumns,
    createTableColumn(textAnswer.join(', '), choiceColumns.length + 1, `${item.linkId}-answer`, type),
  ];
  return columns;
};

export const getStandardTableObject = async (
  items: QuestionnaireItem[],
  responseItems?: QuestionnaireResponse | null,
  resource?: Resource[],
  SortDirection?: SortDirection,
  displayToSortBy?: string
): Promise<IStandardTable> => {
  if (!responseItems || items.length === 0) {
    return emptyTable();
  }

  const firstChoiceItem = findFirstChoiceItem(items);
  if (!firstChoiceItem) {
    return emptyTableWithId(responseItems.id || '');
  }
  const system = getSystemForItem(firstChoiceItem, resource);
  const choiceValues = getContainedOptions(firstChoiceItem, resource) || [];
  const extraColumnNeeded = await needsExtraColumn(items, responseItems);

  const rows = await createBodyRows(items, responseItems, extraColumnNeeded, choiceValues, system, resource);
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
  const findChoice = (item: QuestionnaireItem): QuestionnaireItem | undefined => {
    if (item.type === ItemType.CHOICE || item.type === ItemType.OPENCHOICE) {
      return item;
    }
    return item.item?.reduce<QuestionnaireItem | undefined>((acc: QuestionnaireItem | undefined, currentItem: QuestionnaireItem) => {
      return acc || findChoice(currentItem);
    }, undefined);
  };
  for (const item of items) {
    const result = findChoice(item);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
};

export const needsExtraColumn = async (items: QuestionnaireItem[], responseItems: QuestionnaireResponse): Promise<boolean> => {
  const answers = await getEnabledQuestionnaireItemsWithAnswers(items, responseItems);
  return (answers || []).some(item => {
    return (
      (item?.item?.length && item.item.length > 0) ||
      (item?.type === ItemType.OPENCHOICE && item?.answer?.some(answer => answer.valueCoding?.code === 'other'))
    );
  });
};

export const sortTableRows = (table: IStandardTable, columnIndex: number, sortOrder: SortDirection): IStandardTable => {
  const sortedTable = {
    headerRow: table.headerRow,
    id: table.id,
    rows: table.rows.sort((a, b) => {
      const aValue = a?.columns.length > columnIndex ? a?.columns[columnIndex]?.value || '' : '';
      const bValue = b?.columns.length > columnIndex ? b?.columns[columnIndex]?.value || '' : '';

      const aColumn = a.columns[columnIndex];
      const type = aColumn?.type;
      return sortByItemType(aValue, bValue, sortOrder, type);
    }),
  };
  return sortedTable;
};

export const getDisplayToSortBy = (coding: Coding[]): string | undefined => {
  const sortDisplay = getDisplayFromCodingSystem(coding, codeSystems.TableOrderingColum);
  return sortDisplay ? sortDisplay : undefined;
};
