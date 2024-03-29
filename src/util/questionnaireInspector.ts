import { QuestionnaireItem, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId, ItemAndPath } from './refero-core';

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
    const questionnaireItemPairs = [];
    for (const linkId of linkIds) {
      const pair = this.findItemWithLinkId(linkId);
      if (pair) {
        questionnaireItemPairs.push(pair);
      }
    }
    return questionnaireItemPairs;
  }

  private findItemWithLinkId(linkId: string): QuestionnaireItemPair | null {
    const qItem = getQuestionnaireDefinitionItem(linkId, this.questionnaire.item);
    if (!qItem) return null;

    const qrItems = getResponseItemAndPathWithLinkId(linkId, this.questionnaireResponse);

    return {
      QuestionnaireItem: qItem,
      QuestionnaireResponseItems: qrItems,
    };
  }
}
