import { getItemControlExtensionValue } from './extension';
import { QuestionnaireItem, Coding } from '../types/fhir';
import itemType from '../constants/itemType';
import itemControlConstants from '../constants/itemcontrol';

export function getGroupItemControl(item: QuestionnaireItem): Coding[] {
  if (item.type !== itemType.GROUP) return [];

  let itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return [];

  let groups = itemControlConstants.Group;
  let valid = Object.keys(groups).map(k => groups[k]);
  return itemControl.filter(i => valid.indexOf(i.code) != -1);
}
