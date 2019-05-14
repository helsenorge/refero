import { getItemControlExtensionValue } from './extension';
import itemType from '../constants/itemType';
import { QuestionnaireItem } from '../types/fhir';
import itemControlConstants from '../constants/itemcontrol';

export function findHelpItem(parent: QuestionnaireItem): QuestionnaireItem | undefined {
  if (parent.item === undefined) return;

  for (let childItem of parent.item) {
    if (isHelpItem(childItem)) return childItem;
  }

  return;
}

export function isHelpItem(item: QuestionnaireItem) {
  if (item.type !== itemType.TEXT) return false;

  let itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return false;

  for (let i = 0; i < itemControl.length; i++) {
    if (itemControl[i] && itemControl[i].code) {
      if (itemControl[i].code === itemControlConstants.HELP) {
        return true;
      }
    }
  }

  return false;
}
