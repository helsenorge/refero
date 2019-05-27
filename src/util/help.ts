import { getItemControlExtensionValue } from './extension';
import itemType from '../constants/itemType';
import { QuestionnaireItem, Coding } from '../types/fhir';
import itemControlConstants from '../constants/itemcontrol';

export function findHelpItem(parent: QuestionnaireItem): QuestionnaireItem | undefined {
  if (parent.item === undefined) return;

  for (let childItem of parent.item) {
    if (isHelpItem(childItem)) return childItem;
  }

  return;
}

export function isHelpItem(item: QuestionnaireItem): boolean {
  var itemControl = getHelpItemControl(item);
  return itemControl ? true : false;
}

export function getHelpItemType(item: QuestionnaireItem): string | undefined {
  var itemControl = getHelpItemControl(item);
  if (!itemControl) return;

  return itemControl.code;
}

function getHelpItemControl(item: QuestionnaireItem): Coding | undefined {
  if (item.type !== itemType.TEXT) return;

  let itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return;

  for (let i = 0; i < itemControl.length; i++) {
    if (itemControl[i] && itemControl[i].code) {
      if (itemControl[i].code === itemControlConstants.HELP || itemControl[i].code == itemControlConstants.HELPLINK) {
        return itemControl[i];
      }
    }
  }

  return;
}
