import * as uuid from 'uuid';
import {
  Coding,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../types/fhir';

import CodingSystems, { CodeSystemValues, TableColumnName, TableOrderingColum } from '../../../../constants/codingsystems';
import ItemType from '../../../../constants/itemType';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../../../util/fhirpathHelper';
import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

export function getQuestionnaireResponseItemAnswer(
  type: string,
  result: any
): QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer> {
  const answerArray: Array<QuestionnaireResponseItemAnswer> = [];
  if (type === ItemType.BOOLEAN) {
    return { valueBoolean: result[0] };
  }

  result.forEach((answer: any) => {
    switch (String(type)) {
      case ItemType.TEXT:
      case ItemType.STRING:
        answerArray.push({ valueString: answer });
        break;
      case ItemType.INTEGER:
        answerArray.push({ valueInteger: answer });
        break;
      case ItemType.DECIMAL:
        answerArray.push({ valueDecimal: answer });
        break;
      case ItemType.QUANTITY:
        answerArray.push({ valueQuantity: answer });
        break;
      case ItemType.DATETIME:
        answerArray.push({ valueDateTime: answer });
        break;
      case ItemType.DATE:
        answerArray.push({ valueDate: answer });
        break;
      case ItemType.TIME:
        answerArray.push({ valueTime: answer });
        break;
      default: {
        if (typeof answer === 'string') {
          answerArray.push({ valueString: answer });
        } else {
          answerArray.push({ valueCoding: answer });
        }
      }
    }
  });
  return answerArray;
}
export const getValueIfDataReceiver = (
  item: QuestionnaireItem,
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const extension = getCopyExtension(item);
  if (extension) {
    let result = evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);

    if (!!getCalculatedExpressionExtension(item)) {
      result = result.map((m: any) => m.value as number);
    }
    3;

    return getQuestionnaireResponseItemAnswer(item.type, result);
  }
  return undefined;
};

export const findCodeBySystem = (coding: Coding[], system?: CodeSystemValues): Coding[] => {
  return coding?.filter(code => code?.system === system) ?? [];
};

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

type TableH2Row = {
  id: string;
  text: string;
};

export type TableH2 = {
  id: string;
  row: TableH2Row[];
};

const sortTableRows = (table: TableH2[], columnIndex: number, sortOrder: SortDirection): TableH2[] => {
  return table.sort((a, b) => {
    const aValue = a.row.length > columnIndex ? a.row[columnIndex]?.text || '' : '';
    const bValue = b.row.length > columnIndex ? b.row[columnIndex]?.text || '' : '';

    return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
};

export const getTableHN2bodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null,
  sortColumnIndex?: number,
  sortOrder: SortDirection = SortDirection.asc
): TableH2[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const table = items.reduce((acc: TableH2[], item) => {
    const isDisplayType = item.type === ItemType.DISPLAY;
    const newRow: TableH2Row = {
      id: item.linkId,
      text: isDisplayType ? item.text ?? '' : '',
    };

    if (isDisplayType) {
      if (acc.length && acc[acc.length - 1].row.length !== 0) {
        acc.push({ id: item.id ?? uuid.v4(), row: [newRow] });
      } else if (!acc.length || acc[acc.length - 1].row.length === 0) {
        if (!acc.length) {
          acc.push({ id: item.id ?? uuid.v4(), row: [] });
        }
        acc[acc.length - 1].row.push(newRow);
      }
    } else {
      const res = getValueIfDataReceiver(item, questionnaireResponse);
      if (res) {
        acc[acc.length - 1].row.push({
          id: item.linkId,
          text: Array.isArray(res) ? res[0]?.valueCoding?.code ?? '' : res?.valueCoding?.code ?? '',
        });
      }
    }

    return acc;
  }, []);
  return sortColumnIndex ? sortTableRows(table, sortColumnIndex, sortOrder) : table;
};
export const getTableHN1bodyObject = (
  items: QuestionnaireItem[],
  questionnaireResponse?: QuestionnaireResponse | null
): QuestionnaireResponseItem[] => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const returnItems: QuestionnaireResponseItem[] = items.map(item => {
    const res = getValueIfDataReceiver(item, questionnaireResponse);
    const responseItem: QuestionnaireResponseItem = structuredClone(item);
    if (!Array.isArray(res) && res !== undefined) {
      responseItem.answer = [res];
    } else {
      responseItem.answer = res;
    }
    return responseItem;
  });
  return returnItems;
};
