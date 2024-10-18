/* eslint-disable @typescript-eslint/no-explicit-any */
import ItemType from '@/constants/itemType';
import { GlobalState } from '@/reducers';
import { findQuestionnaireItem, getResponseItemWithPathSelector, questionnaireResponseSelector } from '@/reducers/selectors';
import { getCalculatedExpressionExtension, getCopyExtension } from '@/util/extension';
import { evaluateFhirpathExpressionToGetString } from '@/util/fhirpathHelper';
import { getAnswerFromResponseItem, Path } from '@/util/refero-core';
import { Extension, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { useSelector } from 'react-redux';

function getAnswerIfDataReceiver(
  questionnaireResponse: QuestionnaireResponse | null | undefined,
  item: QuestionnaireItem,
  extension: Extension
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined {
  let result = evaluateFhirpathExpressionToGetString(extension, questionnaireResponse);

  if (getCalculatedExpressionExtension(item)) {
    result = result.map((m: any) => m.value as number);
  }

  return getQuestionnaireResponseItemAnswer(item.type, result);
}

function getQuestionnaireResponseItemAnswer(
  type: string,
  result: any[]
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] {
  if (type === ItemType.BOOLEAN) {
    return { valueBoolean: result[0] };
  }
  return result.map((answer: any) => {
    switch (String(type)) {
      case ItemType.TEXT:
      case ItemType.STRING:
        return { valueString: answer };
      case ItemType.INTEGER:
        return { valueInteger: answer };
      case ItemType.DECIMAL:
        return { valueDecimal: answer };

      case ItemType.QUANTITY:
        return { valueQuantity: answer };
      case ItemType.DATETIME:
        return { valueDateTime: answer };
      case ItemType.DATE:
        return { valueDate: answer };
      case ItemType.TIME:
        return { valueTime: answer };
      default: {
        if (typeof answer === 'string') {
          return { valueString: answer };
        } else {
          return { valueCoding: answer };
        }
      }
    }
  });
}

export const useGetAnswer = (
  linkId?: string,
  path?: Path[]
): QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined => {
  const questionnaireResponse = useSelector<GlobalState, QuestionnaireResponse | null | undefined>(questionnaireResponseSelector);
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const dataRecieverExtension = item && getCopyExtension(item);

  return dataRecieverExtension
    ? getAnswerIfDataReceiver(questionnaireResponse, item, dataRecieverExtension)
    : getAnswerFromResponseItem(responseItem);
};
