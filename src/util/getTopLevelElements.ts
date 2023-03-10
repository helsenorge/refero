import { FormDefinition } from "../reducers/form";
import { QuestionnaireItem } from "../types/fhir";
import { isItemSidebar } from "./extension";

export const getTopLevelElements = (formDefinition: FormDefinition): QuestionnaireItem[] | undefined => {
  const topLevelElements = formDefinition.Content?.item?.filter(qItem => !isItemSidebar(qItem));
  return topLevelElements;
}
