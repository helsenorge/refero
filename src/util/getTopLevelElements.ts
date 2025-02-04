import { QuestionnaireItem } from 'fhir/r4';

import { isItemSidebar } from './extension';
import { isHelpItem } from './help';
import { FormDefinition } from '../reducers/form';

import { isHiddenItem } from '.';

export const getTopLevelElements = (formDefinition?: FormDefinition | null): QuestionnaireItem[] | undefined => {
  const topLevelElements = formDefinition?.Content?.item?.filter(
    qItem => !isItemSidebar(qItem) && !isHiddenItem(qItem) && !isHelpItem(qItem)
  );
  return topLevelElements;
};
