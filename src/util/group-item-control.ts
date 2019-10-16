import { getItemControlExtensionValue } from './extension';
import { QuestionnaireItem, Coding } from '../types/fhir';
import itemType from '../constants/itemType';
import itemControlConstants from '../constants/itemcontrol';

export function getGroupItemControl(item: QuestionnaireItem): Coding[] {
  if (item.type !== itemType.GROUP) return [];

  const itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return [];

  const groups = itemControlConstants.Group;
  const valid = Object.keys(groups).map(k => groups[k]);
  return itemControl.filter(i => valid.indexOf(i.code) != -1);
}
