import { FormDefinition } from "../reducers/form";
import { getGroupsWithCodeStep } from "./getGroupsWithCodeStep";

export const qItemIndexByGroup = (formDefinition: FormDefinition, qItemLinkId: string): number => {
  const groupsWithCodeStep = getGroupsWithCodeStep(formDefinition);
  groupsWithCodeStep?.find((group) => {
    if (group.linkId === qItemLinkId) {
      return groupsWithCodeStep.indexOf(group)
    }
  });
  return 0;
}