export const TableColumnName = 'http://helsenorge.no/fhir/CodeSystem/TableColumnName';
export const TableOrderingColum = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingColumn';
export const TableOrderingFunctions = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingFunctions';
export const TableColumn = 'http://helsenorge.no/fhir/CodeSystem/TableColumn';
export const OPEN_CHOICE_SYSTEM: string = 'http://helsenorge.no/fhir/CodeSystem/open-choice';

const codeSystems = {
  RenderingOptions: 'http://helsenorge.no/fhir/CodeSystem/RenderOptions',
  TableColumnName: 'http://helsenorge.no/fhir/CodeSystem/TableColumnName',
  TableOrderingColum: 'http://helsenorge.no/fhir/CodeSystem/TableOrderingColumn',
  TableOrderingFunctions: 'http://helsenorge.no/fhir/CodeSystem/TableOrderingFunctions',
  TableColumn: 'http://helsenorge.no/fhir/CodeSystem/TableColumn',
  OPEN_CHOICE_SYSTEM: 'http://helsenorge.no/fhir/CodeSystem/open-choice',
} as const;

export type CodeSystems = typeof codeSystems;

export default codeSystems;
