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

import CodingSystems, { CodeSystemValues, TableColumnName, TableOrderingColum } from '../../../../constants/codingsystems';
import ItemType from '../../../../constants/itemType';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../../../util/fhirpathHelper';
import { Path, enableWhenMatchesAnswer, getQuestionnaireResponseItemWithLinkid, isInGroupContext } from '../../../../util/refero-core';

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
      result = result.map((m: { value: number }) => m.value);
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

interface ITableH2Row {
  id: string;
  text: string;
}

export interface ITableH2 {
  id: string;
  row: ITableH2Row[];
}

const sortTableRows = (table: ITableH2[], columnIndex: number, sortOrder: SortDirection): ITableH2[] => {
  return table.sort((a, b) => {
    const aValue = a.row.length > columnIndex ? a.row[columnIndex]?.text || '' : '';
    const bValue = b.row.length > columnIndex ? b.row[columnIndex]?.text || '' : '';

    return sortOrder === SortDirection.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });
};

const getStringFromItemType = (
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
      const primetiveAnswerValue = getStringFromItemType(type, answer);
      answerArray.push(primetiveAnswerValue);
    });
  } else {
    const primetiveAnswerValue = getStringFromItemType(type, questionnaireAnswer);
    answerArray.push(primetiveAnswerValue);
  }
  return answerArray;
};

const transformAnswersToString = (
  type: typeof ItemType[keyof typeof ItemType],
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
): string => {
  const value = getValueFromDataReciever(type, answer);
  if (value.length === 0) {
    return '';
  }
  return getValueFromDataReciever(type, answer)[0].toString();
};

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
          text: transformAnswersToString(item.type, res),
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
