import { FormDefinition } from "../reducers/form";
import { QuestionnaireItem } from "../types/fhir";

export const getGroupsWithCodeStep = (formDefinition: FormDefinition): QuestionnaireItem[] | undefined => {
  const groupArray = formDefinition.Content?.item?.filter(qItem =>
    qItem.extension?.find(extension => extension.valueCodeableConcept?.coding?.find(coding => coding.code === 'step'))
  );
  return groupArray;
}