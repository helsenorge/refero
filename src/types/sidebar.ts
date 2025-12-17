import type { QuestionnaireItem } from 'fhir/r4';

export interface SidebarItem {
  item: QuestionnaireItem;
  markdownText: string;
}
