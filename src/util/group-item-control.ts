import { QuestionnaireItem, Coding } from 'fhir/r4';

import { getItemControlExtensionValue } from './extension';
import itemControlConstants from '../constants/itemcontrol';
import itemType from '../constants/itemType';

type GroupKeys = keyof typeof itemControlConstants.Group;
type GroupValues = (typeof itemControlConstants.Group)[GroupKeys];

export function getGroupItemControl(item?: QuestionnaireItem): Coding[] {
  if (item?.type !== itemType.GROUP) return [];

  const itemControl = getItemControlExtensionValue(item);
  if (!itemControl) return [];

  const groups: { [key in GroupKeys]: GroupValues } = itemControlConstants.Group;
  const valid = new Set<GroupValues>(Object.values(groups));

  return itemControl.filter((i: Coding) => {
    if (i.code === undefined) return false;
    return valid.has(i.code as GroupValues);
  });
}
