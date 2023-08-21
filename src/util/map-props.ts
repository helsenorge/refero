import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireResponseItem,
  QuestionnaireItemEnableWhen,
  QuestionnaireItemEnableBehaviorCodes,
  QuestionnaireResponseItemAnswer,
  Quantity,
} from '../types/fhir';

import { NewValueAction } from '../actions/newValue';
import { Props } from '../components/with-common-functions';
import { getFormData } from '../reducers/form';
import { GlobalState } from '../reducers/index';
import {
  enableWhenMatchesAnswer,
  getQuestionnaireResponseItemWithLinkid,
  getResponseItems,
  Path,
  isInGroupContext,
} from './refero-core';
import { getCopyExtension, getCalculatedExpressionExtension, getQuestionnaireUnitExtensionValue } from '../util/extension';
import { evaluateFhirpathExpressionToGetString } from '../util/fhirpathHelper';
import ItemType from '../constants/itemType';
import { ScoringCalculator } from '../util/scoringCalculator';
import { scoringItemType } from '../util/scoring';
import { getDecimalValue } from '.';
import { ScoringItemType } from '../constants/scoringItemType';

export function mapStateToProps(state: GlobalState, originalProps: Props): Props {
  getValueIfDataReceiver(state, originalProps);
  getScoringValue(state, originalProps);
  if (!originalProps.item || !originalProps.item.enableWhen) {
    return { ...originalProps, enable: true } as Props;
  }
  const enable = isEnableWhenEnabled(originalProps.item.enableWhen, originalProps.item.enableBehavior, originalProps.path || [], state);
  return { ...originalProps, enable } as Props;
}

function isEnableWhenEnabled(
  enableWhen: QuestionnaireItemEnableWhen[],
  enableBehavior: string | undefined,
  path: Path[],
  state: GlobalState
): boolean {
  const enableMatches: Array<boolean> = [];
  enableWhen.forEach((enableWhen: QuestionnaireItemEnableWhen) => {
    const responseItems = getResponseItems(getFormData(state));
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

function getValueIfDataReceiver(state: GlobalState, originalProps: Props): void {
  if (originalProps.item) {
    const extension = getCopyExtension(originalProps.item);
    if (extension) {
      const formData = getFormData(state);
      let result = evaluateFhirpathExpressionToGetString(formData?.Content, extension);

      if (!!getCalculatedExpressionExtension(originalProps.item)) {
        result = result.map((m: any) => m.value as number);
      }

      originalProps.answer = getQuestionnaireResponseItemAnswer(originalProps.item.type, result);
    }
  }
}

function getQuestionnaireResponseItemAnswer(
  type: string,
  result: any
): QuestionnaireResponseItemAnswer | Array<QuestionnaireResponseItemAnswer> {
  let answerArray: Array<QuestionnaireResponseItemAnswer> = [];
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
        answerArray.push(integerAnswer(answer));
        break;
      case ItemType.DECIMAL:
        answerArray.push(decimalAnswer(answer));
        break;
      case ItemType.QUANTITY:
        answerArray.push(quantityAnswer(answer));
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
        if ((typeof answer) === 'string') {
          answerArray.push({ valueString: answer });
        } else {
          answerArray.push({ valueCoding: answer });
        }
      }
    }
  });
  return answerArray;  
}

function getScoringValue(state: GlobalState, originalProps: Props): void {
  if (originalProps && originalProps.item) {
    const scoringType = scoringItemType(originalProps.item);

    if (scoringType === ScoringItemType.QUESTION_FHIRPATH_SCORE ||
        scoringType === ScoringItemType.SECTION_SCORE ||
        scoringType === ScoringItemType.TOTAL_SCORE) {
      const questionnaire = state.refero?.form?.FormDefinition?.Content;
      const questionnaireResponse = state.refero?.form?.FormData?.Content;

      if (!questionnaire || !questionnaireResponse) return;
      const scoringCalculator = new ScoringCalculator(questionnaire);
      if (!scoringCalculator) return;

      const scores = scoringCalculator.calculate(questionnaireResponse);
      const value = scores[originalProps.item.linkId];
      if (!value) return;
  
      switch (String(originalProps.item.type)) {
        case ItemType.INTEGER:  
          originalProps.answer = integerAnswer(Math.floor(value));
          break;
        case ItemType.DECIMAL:
          originalProps.answer = decimalAnswer(getDecimalValue(originalProps.item, value));
          break;
        case ItemType.QUANTITY:
          const extension = getQuestionnaireUnitExtensionValue(originalProps.item);
          const quantity = {
            unit: extension?.display,
            system: extension?.system,
            code: extension?.code,
            value: getDecimalValue(originalProps.item, value),
          } as Quantity;
          originalProps.answer = quantityAnswer(quantity);
          break;
      }
    }
  }
}

function integerAnswer(value: number): QuestionnaireResponseItemAnswer {
  return { valueInteger: value };
}

function decimalAnswer(value: number): QuestionnaireResponseItemAnswer {
  return { valueDecimal: value };
}

function quantityAnswer(value: Quantity): QuestionnaireResponseItemAnswer {
  return { valueQuantity: value };
}

export function mergeProps(stateProps: Props, dispatchProps: Props, ownProps: Props): Props {
  return Object.assign({}, ownProps, stateProps, dispatchProps);
}

export function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: Props): Props {
  return {
    dispatch,
    path: props.path,
    renderContext: props.renderContext,
  };
}
