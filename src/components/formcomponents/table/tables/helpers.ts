import { Coding, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from '../../../../types/fhir';

import ItemType from '../../../../constants/itemType';
import { FormData } from '../../../../reducers/form';
import { getCalculatedExpressionExtension, getCopyExtension } from '../../../../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../../../../util/fhirpathHelper';
import CodingSystems, { CodeSystemValues, CodeSystems, TableColumnName, TableOrderingColum } from '../../../../constants/codingsystems';

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

export const getTableHN1bodyObject = (items: QuestionnaireItem[]) => {};
