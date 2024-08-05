/* eslint-disable @typescript-eslint/no-explicit-any */
import ItemType from '@/constants/itemType';
import { GlobalState } from '@/reducers';
import { FormData, getFormData } from '@/reducers/form';
import { getCalculatedExpressionExtension, getCopyExtension } from '@/util/extension';
import { evaluateFhirpathExpressionToGetString } from '@/util/fhirpathHelper';
import { getAnswerFromResponseItem } from '@/util/refero-core';
import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useSelector } from 'react-redux';

export function getAnswerIfDataReceiver(
  formData: FormData | null,
  item?: QuestionnaireItem
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined {
  if (item) {
    const extension = getCopyExtension(item);
    if (extension) {
      let result = evaluateFhirpathExpressionToGetString(extension, formData?.Content);

      if (getCalculatedExpressionExtension(item)) {
        result = result.map((m: any) => m.value as number);
      }

      return getQuestionnaireResponseItemAnswer(item.type, result);
    }
    return undefined;
  }
  return undefined;
}

function getQuestionnaireResponseItemAnswer(
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

export const useGetAnswer = (
  responseItem?: QuestionnaireResponseItem,
  item?: QuestionnaireItem
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const formData = useSelector<GlobalState, FormData | null>(state => getFormData(state));
  const answer = getAnswerFromResponseItem(responseItem);
  const newAnswer = getAnswerIfDataReceiver(formData, item);
  return newAnswer ?? answer;
};
