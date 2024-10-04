import { Questionnaire, QuestionnaireResponse, QuestionnaireItem, Coding, Quantity } from 'fhir/r4';

import { getItemControlValue } from './choice';
import { getResponseItemAndPathWithLinkId, getQuestionnaireDefinitionItem, Path } from './refero-core';
import {
  newIntegerValue,
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
  NewValuePayload,
} from '@/actions/newValue';
import itemControlConstants from '@/constants/itemcontrol';
import { PayloadAction } from '@reduxjs/toolkit';

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
  private actions: PayloadAction<NewValuePayload, string>[] = [];
  private questionnaire: Questionnaire;
  private questionnaireResponse: QuestionnaireResponse;

  constructor(questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse) {
    this.questionnaire = questionnaire;
    this.questionnaireResponse = questionnaireResponse;
  }

  public addIntegerAnswer(linkId: string, value: number, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newIntegerValue({ itemPath: itemAndPath.path, valueInteger: value, item: itemAndPath.item }));
    }
  }

  public clearIntegerAnswer(linkId: string, index: number = 0): void {
    this.addIntegerAnswer(linkId, Number.NaN, index);
  }

  public addDecimalAnswer(linkId: string, value: number, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDecimalValue({ itemPath: itemAndPath.path, valueDecimal: value, item: itemAndPath.item }));
    }
  }

  public clearDecimalAnswer(linkId: string, index: number = 0): void {
    this.addDecimalAnswer(linkId, Number.NaN, index);
  }

  public addChoiceAnswer(linkId: string, value: Coding, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(
        newCodingValue({
          itemPath: itemAndPath.path,
          valueCoding: value,
          item: itemAndPath.item,
          multipleAnswers: this.isCheckbox(itemAndPath.item),
        })
      );
    }
  }

  public removeChoiceAnswer(linkId: string, value: Coding, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath && this.isCheckbox(itemAndPath.item)) {
      this.actions.push(removeCodingValue({ itemPath: itemAndPath.path, valueCoding: value, item: itemAndPath.item }));
    }
  }

  public addOpenChoiceAnswer(linkId: string, value: Coding | string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      if (typeof value === 'string') {
        this.actions.push(newCodingStringValue({ itemPath: itemAndPath.path, valueString: value, item: itemAndPath.item }));
      } else {
        this.actions.push(
          newCodingValue({
            itemPath: itemAndPath.path,
            valueCoding: value,
            item: itemAndPath.item,
            multipleAnswers: this.isCheckbox(itemAndPath.item),
          })
        );
      }
    }
  }

  public removeOpenChoiceAnswer(linkId: string, value: Coding | string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      if (typeof value === 'string') {
        this.actions.push(removeCodingStringValue({ itemPath: itemAndPath.path, item: itemAndPath.item }));
      } else if (this.isCheckbox(itemAndPath.item)) {
        this.actions.push(removeCodingValue({ itemPath: itemAndPath.path, valueCoding: value, item: itemAndPath.item }));
      }
    }
  }

  public addBooleanAnswer(linkId: string, value: boolean, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newBooleanValue({ itemPath: itemAndPath.path, valueBoolean: value, item: itemAndPath.item }));
    }
  }

  public clearBooleanAnswer(linkId: string, index: number = 0): void {
    this.addBooleanAnswer(linkId, false, index);
  }

  public addDateAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDateValue({ itemPath: itemAndPath.path, valueDate: value, item: itemAndPath.item }));
    }
  }

  public clearDateAnswer(linkId: string, index: number = 0): void {
    this.addDateAnswer(linkId, '', index);
  }

  public addTimeAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newTimeValue({ itemPath: itemAndPath.path, valueTime: value, item: itemAndPath.item }));
    }
  }

  public clearTimeAnswer(linkId: string, index: number = 0): void {
    this.addTimeAnswer(linkId, '', index);
  }

  public addDateTimeAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newDateTimeValue({ itemPath: itemAndPath.path, valueDateTime: value, item: itemAndPath.item }));
    }
  }

  public clearDateTimeAnswer(linkId: string, index: number = 0): void {
    this.addDateTimeAnswer(linkId, '', index);
  }

  public addQuantityAnswer(linkId: string, value: Quantity, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newQuantityValue({ itemPath: itemAndPath.path, valueQuantity: value, item: itemAndPath.item }));
    }
  }

  public clearQuantityAnswer(linkId: string, index: number = 0): void {
    this.addQuantityAnswer(linkId, {} as Quantity, index);
  }

  public addStringAnswer(linkId: string, value: string, index: number = 0): void {
    const itemAndPath = this.getItemAndPath(linkId, index);
    if (itemAndPath) {
      this.actions.push(newStringValue({ itemPath: itemAndPath.path, valueString: value, item: itemAndPath.item }));
    }
  }

  public clearStringAnswer(linkId: string, index: number = 0): void {
    this.addStringAnswer(linkId, '', index);
  }

  public getActions(): PayloadAction<NewValuePayload, string>[] {
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
