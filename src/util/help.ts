import { QuestionnaireItem, Coding } from '../types/fhir';

import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';
import { getItemControlExtensionValue } from './extension';

export function findHelpItem(parent: QuestionnaireItem): QuestionnaireItem | undefined {
  if (parent.item === undefined) return;

  for (const childItem of parent.item) {
    if (isHelpItem(childItem)) return childItem;
  }

  return;
}

export function isHelpItem(item: QuestionnaireItem): boolean {
  const itemControl = getHelpItemControl(item);
  return itemControl ? true : false;
}

export function getHelpItemType(item: QuestionnaireItem): string | undefined {
  const itemControl = getHelpItemControl(item);
  if (!itemControl) return;

  return itemControl.code;
}

function getHelpItemControl(item: QuestionnaireItem): Coding | undefined {
  if (item.type !== itemType.TEXT) return;

  const itemControl = getItemControlExtensionValue(item);
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
