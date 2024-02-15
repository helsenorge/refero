import { QuestionnaireItem } from 'fhir/r4';

import { isItemSidebar } from './extension';
import { FormDefinition } from '../reducers/form';

export const getTopLevelElements = (formDefinition: FormDefinition): QuestionnaireItem[] | undefined => {
  const topLevelElements = formDefinition.Content?.item?.filter(qItem => !isItemSidebar(qItem));
  return topLevelElements;
};
