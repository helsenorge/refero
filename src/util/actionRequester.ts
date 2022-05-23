import { Questionnaire, QuestionnaireResponse, QuestionnaireItem, Coding, Quantity } from '../types/fhir';

import {
  newIntegerValue,
  NewValueAction,
  newDecimalValue,
  newCodingValue,
  newCodingStringValue,
  newBooleanValue,
  newDateValue,
  newTimeValue,
  newDateTimeValue,
  newQuantityValue,
  newStringValue,
  removeCodingValue,
  removeCodingStringValue,
} from '../actions/newValue';
import itemControlConstants from '../constants/itemcontrol';
import { getItemControlValue } from './choice';
import { getResponseItemAndPathWithLinkId, getQuestionnaireDefinitionItem, Path } from './refero-core';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IActionRequester {
  addIntegerAnswer(linkId: string, value: number, index?: number): void;
  addDecimalAnswer(linkId: string, value: number, index?: number): void;
  addChoiceAnswer(linkId: string, value: Coding, index?: number): void;
  addOpenChoiceAnswer(linkId: string, value: Coding | string, index?: number): void;
  addBooleanAnswer(linkId: string, value: boolean, index?: number): void;
  addDateAnswer(linkId: string, value: string, index?: number): void;
  addTimeAnswer(linkId: string, value: string, index?: number): void;
  addDateTimeAnswer(linkId: string, value: string, index?: number): void;
  addQuantityAnswer(linkId: string, value: Quantity, index?: number): void;
  addStringAnswer(linkId: string, value: string, index?: number): void;

  clearIntegerAnswer(linkId: string, index?: number): void;
  clearDecimalAnswer(linkId: string, index?: number): void;
  clearBooleanAnswer(linkId: string, index?: number): void;
  clearDateAnswer(linkId: string, index?: number): void;
  clearTimeAnswer(linkId: string, index?: number): void;
  clearDateTimeAnswer(linkId: string, index?: number): void;
  clearQuantityAnswer(linkId: string, index?: number): void;
  clearStringAnswer(linkId: string, index?: number): void;

  removeChoiceAnswer(linkId: string, value: Coding, index?: number): void;
  removeOpenChoiceAnswer(linkId: string, value: Coding | string, index?: number): void;
}

class ItemAndPath {
  public item: QuestionnaireItem;
  public path: Path[];

  constructor(item: QuestionnaireItem, path: Path[]) {
    this.item = item;
    this.path = path;
  }
}

export class ActionRequester implements IActionRequester {
  private actions: Array<NewValueAction> = [];
  private questionnaire: Questionnaire;
  private questionnaireResponse: QuestionnaireResponse;

  constructor(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse) {
    this.questionnaire = questionnaire;
    this.questionnaireResponse = questionnaireResponse;
  }

  public addIntegerAnswer(linkId: string, value: number, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newIntegerValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearIntegerAnswer(linkId: string, index: number = 0): void {
    this.addIntegerAnswer(linkId, Number.NaN, index);
  }

  public addDecimalAnswer(linkId: string, value: number, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDecimalValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearDecimalAnswer(linkId: string, index: number = 0): void {
    this.addDecimalAnswer(linkId, Number.NaN, index);
  }

  public addChoiceAnswer(linkId: string, value: Coding, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newCodingValue(itemAndPath.path, value, itemAndPath.item, this.isCheckbox(itemAndPath.item)));
    }
  }

  public removeChoiceAnswer(linkId: string, value: Coding, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath && this.isCheckbox(itemAndPath.item)) {
      this.actions.push(removeCodingValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public addOpenChoiceAnswer(linkId: string, value: Coding | string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      if (typeof value === 'string') {
        this.actions.push(newCodingStringValue(itemAndPath.path, value, itemAndPath.item));
      } else {
        this.actions.push(newCodingValue(itemAndPath.path, value, itemAndPath.item, this.isCheckbox(itemAndPath.item)));
      }
    }
  }

  public removeOpenChoiceAnswer(linkId: string, value: Coding | string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      if (typeof value === 'string') {
        this.actions.push(removeCodingStringValue(itemAndPath.path, itemAndPath.item));
      } else if (this.isCheckbox(itemAndPath.item)) {
        this.actions.push(removeCodingValue(itemAndPath.path, value, itemAndPath.item));
      }
    }
  }

  public addBooleanAnswer(linkId: string, value: boolean, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newBooleanValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearBooleanAnswer(linkId: string, index: number = 0): void {
    this.addBooleanAnswer(linkId, false, index);
  }

  public addDateAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDateValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearDateAnswer(linkId: string, index: number = 0): void {
    this.addDateAnswer(linkId, '', index);
  }

  public addTimeAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newTimeValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearTimeAnswer(linkId: string, index: number = 0): void {
    this.addTimeAnswer(linkId, '', index);
  }

  public addDateTimeAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDateTimeValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearDateTimeAnswer(linkId: string, index: number = 0): void {
    this.addDateTimeAnswer(linkId, '', index);
  }

  public addQuantityAnswer(linkId: string, value: Quantity, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newQuantityValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearQuantityAnswer(linkId: string, index: number = 0): void {
    this.addQuantityAnswer(linkId, {} as Quantity, index);
  }

  public addStringAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newStringValue(itemAndPath.path, value, itemAndPath.item));
    }
  }

  public clearStringAnswer(linkId: string, index: number = 0): void {
    this.addStringAnswer(linkId, '', index);
  }

  public getActions(): Array<NewValueAction> {
    return this.actions;
  }

  private getItemAndPath(linkId: string, index: number): ItemAndPath | undefined {
    const item = getQuestionnaireDefinitionItem(linkId, this.questionnaire.item);
    const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, this.questionnaireResponse);

    if (!item || itemsAndPaths.length - 1 < index || !itemsAndPaths[index].path) {
      return;
    }

    return new ItemAndPath(item, itemsAndPaths[index].path);
  }

  private isCheckbox(item: QuestionnaireItem): boolean {
    return getItemControlValue(item) === itemControlConstants.CHECKBOX;
  }
}
