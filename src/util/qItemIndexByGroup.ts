import { FormDefinition } from '../reducers/form';
import { getGroupsWithCodeStep } from './getGroupsWithCodeStep';

export const qItemIndexByGroup = (formDefinition: FormDefinition, qItemLinkId: string): number => {
  let indexToReturn: number = 50;
  const groupsWithCodeStep = getGroupsWithCodeStep(formDefinition);
  groupsWithCodeStep?.find(group => {
    if (group.linkId === qItemLinkId) {
      indexToReturn = groupsWithCodeStep.indexOf(group);
    }
  });
  return indexToReturn;
};
