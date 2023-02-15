import { FormDefinition } from "../reducers/form";
import { QuestionnaireItem } from "../types/fhir";

export const getTopLevelElements = (formDefinition: FormDefinition): QuestionnaireItem[] | undefined => {
  const topLevelElements = formDefinition.Content?.item?.filter(qItem => qItem);
  return topLevelElements;
}