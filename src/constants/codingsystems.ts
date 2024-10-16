export const TableColumnName = 'http://helsenorge.no/fhir/CodeSystem/TableColumnName' as const;
export const TableOrderingColum = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingColumn' as const;
export const TableOrderingFunctions = 'http://helsenorge.no/fhir/CodeSystem/TableOrderingFunctions' as const;
export const TableColumn = 'http://helsenorge.no/fhir/CodeSystem/TableColumn' as const;
export const SliderLabels = 'http://helsenorge.no/fhir/CodeSystem/SliderLabels' as const;
export const SliderDisplayType = 'http://helsenorge.no/fhir/CodeSystem/SliderDisplayType' as const;
export const RenderingOptions = 'http://helsenorge.no/fhir/CodeSystem/RenderOptions' as const;
export const OpenChoice_system = 'http://helsenorge.no/fhir/CodeSystem/open-choice' as const;
export const ValidationOptions = 'http://helsenorge.no/fhir/CodeSystem/ValidationOptions' as const;

const codeSystems = {
  RenderingOptions,
  TableColumnName,
  TableOrderingColum,
  TableOrderingFunctions,
  TableColumn,
  SliderLabels,
  SliderDisplayType,
  OpenChoice_system,
  ValidationOptions,
};

export type CodeSystems = typeof codeSystems;

export default codeSystems;
