import { QuestionnaireItem, Coding } from 'fhir/r4';

import { getItemControlExtensionValue } from './extension';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';

export function getGroupItemControl(item: QuestionnaireItem): Coding[] {
  if (item.type !== itemType.GROUP) return [];

  const itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return [];

  const groups = itemControlConstants.Group;
  const valid = Object.keys(groups).map(k => groups[k]);
  return itemControl.filter(i => valid.indexOf(i.code) != -1);
}
