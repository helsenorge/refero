import * as uuid from 'uuid';

import {
  Coding,
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemEnableBehaviorCodes,
  QuestionnaireItemEnableWhen,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../types/fhir';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import CodingSystems, { TableColumnName, TableOrderingColum } from '../../../../constants/codingsystems';
import ItemType from '../../../../constants/itemType';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../../../util/fhirpathHelper';
import { Path, enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, isInGroupContext } from '../../../../util/refero-core';

const answerKeyMap = {
  [ItemType.TEXT]: 'valueString',
  [ItemType.STRING]: 'valueString',
  [ItemType.INTEGER]: 'valueInteger',
  [ItemType.DECIMAL]: 'valueDecimal',
  [ItemType.QUANTITY]: 'valueQuantity',
  [ItemType.DATETIME]: 'valueDateTime',
  [ItemType.DATE]: 'valueDate',
  [ItemType.TIME]: 'valueTime',
};

export function getQuestionnaireResponseItemAnswer(
  type: string,
  result: any
): QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer> {
  if (type === ItemType.BOOLEAN) {
    return { valueBoolean: result[0] };
  } else if (type === ItemType.CHOICE) {
    return {
      //TODO: map Coding
      valueCoding: result[0].display ?? '',
    };
  }

  return result.map((answer: any) => ({
    [answerKeyMap[type] || 'defaultKey']: answer,
  }));
}
export const getValueIfDataReceiver = (
  item: QuestionnaireItem,
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const extension = getCopyExtension(item);
  if (extension) {
    let result = evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);
    if (!!getCalculatedExpressionExtension(item)) {
      result = result.map((m: { value: number }) => m.value);
    }
    return getQuestionnaireResponseItemAnswer(item.type, result);
  }
  return undefined;
};

export function findCodeBySystem<T extends { system?: string }>(coding: T[], system?: string): T[] {
  return coding.filter(code => code.system === system);
}
export const findCodeForColumnToSortBy = (coding: Coding[]): Coding | undefined => {
  const code = findCodeBySystem(coding, TableOrderingColum);
  const columnsToDisplay = coding?.filter(codeElement => codeElement.system === CodingSystems.TableColumnName);
  const codeForSortedColumn = code[0]?.code;
  const columnToSortBy = columnsToDisplay?.find(coding => coding?.code === codeForSortedColumn);
  return columnToSortBy;
};

export const getColumnNames = (coding: Coding[]): string[] => {
  return findCodeBySystem(coding, TableColumnName).map(code => code.display ?? '');
};

const getPrimetiveValueFromItemType = (
  type: typeof ItemType[keyof typeof ItemType],
  res: QuestionnaireResponseItemAnswer
): string | number | Quantity => {
  switch (type) {
    case ItemType.TEXT:
    case ItemType.STRING:
      return res.valueString ?? '';
    case ItemType.INTEGER:
      return res.valueInteger ?? 0;
    case ItemType.DECIMAL:
      return res.valueDecimal ?? 0;
    case ItemType.QUANTITY:
      return res.valueQuantity ?? '';
    case ItemType.DATETIME:
      return res.valueDateTime ?? '';
    case ItemType.DATE:
      return res.valueDate ?? '';
    case ItemType.TIME:
      return res.valueTime ?? '';
    case ItemType.CHOICE:
      return res.valueCoding?.display ?? '';
    default: {
      return '';
    }
  }
};
const convertePrimitiveValueToStrings = (value: Array<string | number | Quantity>): string[] => value.map(answer => answer.toString());

const getValueFromDataReciever = (
  type: typeof ItemType[keyof typeof ItemType],
  questionnaireAnswer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): Array<string | number | Quantity> => {
  if (questionnaireAnswer === undefined) {
    return [];
  }
  const answerArray: Array<string | number | Quantity> = [];
  if (Array.isArray(questionnaireAnswer)) {
    questionnaireAnswer.forEach(answer => {
      const primetiveAnswerValue = getPrimetiveValueFromItemType(type, answer);
      answerArray.push(primetiveAnswerValue);
    });
  } else {
    const primetiveAnswerValue = getPrimetiveValueFromItemType(type, questionnaireAnswer);
    answerArray.push(primetiveAnswerValue);
  }
  return answerArray;
};

const transformAnswersToString = (
  type: typeof ItemType[keyof typeof ItemType],
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): string[] => {
  const value = getValueFromDataReciever(type, answer);
  if (value.length === 0) {
    return [];
  }
  return convertePrimitiveValueToStrings(value);
};

function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  responseItems: QuestionnaireResponseItem[]
): boolean {
  const enableMatches: Array<boolean> = [];
  enableWhen.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
    const enableWhenQuestion = enableWhen.question;
    for (let i = 0; responseItems && i < responseItems.length; i++) {
      let responseItem: QuestionnaireResponseItem | undefined = responseItems[i];
      if (!isInGroupContext(path, responseItem, responseItems)) {
        continue;
      }
      if (responseItem.linkId !== enableWhen.question) {
        responseItem = getQuestionnaireResponseItemWithLinkid(enableWhenQuestion, responseItems[i], path);
      }
      if (!responseItem) {
        continue;
      }

      const matchesAnswer = enableWhenMatchesAnswer(enableWhen, responseItem.answer);
      enableMatches.push(matchesAnswer);
    }
  });
  return enableBehavior === QuestionnaireItemEnableBehaviorCodes.ALL
    ? enableMatches.every(x => x === true)
    : enableMatches.some(x => x === true);
}

/* SORTING  */
const sortTableRows = (table: ITableH2[], columnIndex: number, sortOrder: SortDirection): ITableH2[] => {
  return table.sort((a, b) => {
    const aValue = a?.row.length > columnIndex ? a?.row[columnIndex]?.text || '' : '';
    const bValue = b?.row.length > columnIndex ? b?.row[columnIndex]?.text || '' : '';

    return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
};

/* TABLE - HN2 */
interface ITableH2Row {
  id: string;
  text: string;
}

export interface ITableH2 {
  id: string;
  row: ITableH2Row[];
}

export const getTableHN2bodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null,
  sortColumnIndex?: number,
  sortOrder: SortDirection = SortDirection.asc
): ITableH2[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const table = items.reduce((acc: ITableH2[], item) => {
    const isDisplayType = item.type === ItemType.DISPLAY;
    const newRow: ITableH2Row = {
      id: item.linkId,
      text: isDisplayType ? item.text ?? '' : '',
    };

    if (isDisplayType) {
      if (acc.length && acc[acc.length - 1]?.row.length !== 0) {
        acc.push({ id: item.id ?? uuid.v4(), row: [newRow] });
      } else if (!acc.length || acc[acc.length - 1]?.row.length === 0) {
        if (!acc.length) {
          acc.push({ id: item.id ?? uuid.v4(), row: [] });
        }
        acc[acc.length - 1]?.row.push(newRow);
      }
    } else {
      const res = getValueIfDataReceiver(item, questionnaireResponse);
      if (res) {
        acc[acc.length - 1]?.row.push({
          id: item.linkId,
          text: transformAnswersToString(item.type, res).toString(),
        });
      }
    }

    return acc;
  }, []);
  return sortColumnIndex ? sortTableRows(table, sortColumnIndex, sortOrder) : table;
};

/* TABLE - HN1 */
export const TABLE_HN1_TABLE_TYPES = { HEADER: 'HEADER', VALUE: 'VALUE' };
type TableHn1ColumnTypesKey = keyof typeof TABLE_HN1_TABLE_TYPES;
type TableHn1ColumnTypesValue = typeof TABLE_HN1_TABLE_TYPES[TableHn1ColumnTypesKey];
export interface ITableH1Column {
  value?: string;
  type: TableHn1ColumnTypesValue;
  id: string;
}
export interface ITableH1Row {
  id: string;
  columns: ITableH1Column[];
}
export type ITableH1 = ITableH1Row[];

const createColumnsFromAnswers = (item: QuestionnaireResponseItem, maxColumns: number): ITableH1Column[] => {
  const answerColumns =
    item.answer?.map(ans => ({
      value: getPrimetiveValueFromItemType((item as QuestionnaireItem).type, ans).toString(),
      type: TABLE_HN1_TABLE_TYPES.VALUE,
      id: item.linkId,
    })) ?? [];

  const emptyColumnsCount = maxColumns - (answerColumns.length + 1);

  const emptyColumns = Array.from({ length: emptyColumnsCount }, (_, index) => ({
    id: `empty-${item.linkId}-${index + answerColumns.length + 1}`,
    type: TABLE_HN1_TABLE_TYPES.VALUE,
    value: '',
  }));

  return [
    {
      id: `${item.linkId}-question`,
      type: (item as QuestionnaireItem).type === ItemType.GROUP ? TABLE_HN1_TABLE_TYPES.HEADER : TABLE_HN1_TABLE_TYPES.VALUE,
      value: item.text || '',
    },
    ...answerColumns,
    ...emptyColumns,
  ];
};

const transformItemToHN1Row = (item: QuestionnaireResponseItem, maxColumns: number): ITableH1Row => {
  const columns = createColumnsFromAnswers(item, maxColumns);

  return {
    id: item.linkId,
    columns: columns,
  };
};

export const getTableHN1bodyObject = (items: QuestionnaireItem[], questionnaireResponse?: QuestionnaireResponse | null): ITableH1 => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }

  const answerItems = addAnswerToItems(items, questionnaireResponse);
  const maxColumns = findMaxColumns(answerItems);

  const processItems = (items: QuestionnaireResponseItem[], maxColumns: number): ITableH1Row[] => {
    return items.reduce((acc: ITableH1Row[], item) => {
      const row = transformItemToHN1Row(item, maxColumns);
      const newAcc = acc.concat(row);

      const nestedRows = item.item ? processItems(item.item, maxColumns) : [];
      return newAcc.concat(nestedRows);
    }, []);
  };

  return processItems(answerItems, maxColumns);
};

const addAnswerToItems = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItem[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }

  const processItem = (item: QuestionnaireItem): QuestionnaireResponseItem => {
    const res = getValueIfDataReceiver(item, questionnaireResponse);
    const responseItem: QuestionnaireResponseItem = structuredClone(item);

    if (!Array.isArray(res) && res !== undefined) {
      responseItem.answer = [res];
    } else {
      responseItem.answer = res;
    }

    if (item.item && item.item.length > 0) {
      responseItem.item = addAnswerToItems(item.item, questionnaireResponse);
    }

    return responseItem;
  };

  return items.map(processItem);
};

const findMaxColumns = (items: QuestionnaireResponseItem[]): number => {
  const countColumns = (item: QuestionnaireResponseItem): number => {
    const columns = 1 + (item.answer?.length || 0);
    const maxNestedColumns = item.item?.reduce((max, subItem) => Math.max(max, countColumns(subItem)), 0) || 0;
    return Math.max(columns, maxNestedColumns);
  };

  return items.reduce((max, item) => Math.max(max, countColumns(item)), 0);
};
