import { FormDefinition } from "../reducers/form";
import { QuestionnaireItem } from "../types/fhir";

export const getGroupsWithCodeStep = (formDefinition: FormDefinition): QuestionnaireItem[] | undefined => {
  const groupArray = formDefinition.Content?.item?.filter(qItem =>
    qItem.extension?.filter(extension => extension.valueCodeableConcept?.coding?.filter(coding => coding.code === 'step'))
  );
  return groupArray;
}