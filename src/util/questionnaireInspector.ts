import { QuestionnaireItem, Questionnaire, QuestionnaireResponse } from '../types/fhir';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId, ItemAndPath } from './skjemautfyller-core';

export interface QuestionnaireItemPair {
  QuestionnaireItem: QuestionnaireItem;
  QuestionnaireResponseItems: Array<ItemAndPath>;
}

export interface IQuestionnaireInspector {
  findItemWithLinkIds(...linkIds: string[]): Array<QuestionnaireItemPair>;
}

export class QuestionniareInspector implements IQuestionnaireInspector {
  private questionnaire: Questionnaire;
  private questionnaireResponse: QuestionnaireResponse;

  constructor(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse) {
    this.questionnaire = questionnaire;
    this.questionnaireResponse = questionnaireResponse;
  }

  public findItemWithLinkIds(...linkIds: string[]): Array<QuestionnaireItemPair> {
    let questionnaireItemPairs = [];
    for (let linkId of linkIds) {
      let pair = this.findItemWithLinkId(linkId);
      if (pair) {
        questionnaireItemPairs.push(pair);
      }
    }
    return questionnaireItemPairs;
  }

  private findItemWithLinkId(linkId: string): QuestionnaireItemPair | null {
    let qItem = getQuestionnaireDefinitionItem(linkId, this.questionnaire.item);
    if (!qItem) return null;

    let qrItems = getResponseItemAndPathWithLinkId(linkId, this.questionnaireResponse);

    return {
      QuestionnaireItem: qItem,
      QuestionnaireResponseItems: qrItems,
    };
  }
}
