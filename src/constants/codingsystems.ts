export const TableColumnName = 'http://helsenorge.no/fhir/CodeSystem/TableColumnName';
export const TableOrderingColum = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingColumn';
export const TableOrderingFunctions = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingFunctions';

const codeSystems = {
  RenderingOptions: 'http://helsenorge.no/fhir/CodeSystem/RenderOptions',
  TableColumnName: 'http://helsenorge.no/fhir/CodeSystem/TableColumnName',
  TableOrderingColum: 'http://helsenorge.no/fhir/CodeSystem/TableOrderingColumn',
  TableOrderingFunctions: 'http://helsenorge.no/fhir/CodeSystem/TableOrderingFunctions',
};
export type CodeSystems = keyof typeof codeSystems;
export type CodeSystemValues = typeof codeSystems[keyof typeof codeSystems];
export default codeSystems;
