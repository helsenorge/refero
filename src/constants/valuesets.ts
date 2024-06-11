export const QUESTIONNAIRE_ITEM_CONTROL_SYSTEM = 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' as const;
export const USAGE_CONTEXT_TYPE_SYSTEM = 'http://hl7.org/fhir/ValueSet/usage-context-type' as const;
export const SIDEBAR_SYSTEM = 'http://helsenorge.no/fhir/ValueSet/sdf-sidebar' as const;
export const INFORAMATION_MESSAGE_SYSTEM = 'http://helsenorge.no/fhir/ValueSet/sdf-information-message' as const;
export const LEGEMIDDELOPPSLAG_SYSTEM = 'http://helsedirektoratet.no/ValueSet/legemiddeloppslag' as const;
export const TECHNICAL_ENDPOINT_FOR_RECEIVING_QUESTIONNAIRE_RESPONSE_SYSTEM = 'http://ehelse.no/fhir/ValueSet/TQQC' as const;
export const ADRESSER_SYSTEM = 'http://helsenorge.no/fhir/ValueSet/adresser' as const;
export const ACCESSIBILITY_TO_RESPONSE_SYSTEM = 'http://ehelse.no/fhir/ValueSet/AccessibilityToResponse' as const;
export const PRESENTATIONBUTTONS_SYSTEM = 'http://helsenorge.no/fhir/ValueSet/presentationbuttons' as const;
export const AUTHENTICATION_REQUIREMENT_SYSTEM = 'http://ehelse.no/fhir/ValueSet/AuthenticationRequirement' as const;
export const DISCRETION_SYSTEM = 'http://ehelse.no/fhir/ValueSet/Discretion' as const;
const valueSet = {
  DISCRETION_SYSTEM,
  QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
  USAGE_CONTEXT_TYPE_SYSTEM,
  SIDEBAR_SYSTEM,
  INFORAMATION_MESSAGE_SYSTEM,
  LEGEMIDDELOPPSLAG_SYSTEM,
  TECHNICAL_ENDPOINT_FOR_RECEIVING_QUESTIONNAIRE_RESPONSE_SYSTEM,
  ADRESSER_SYSTEM,
  ACCESSIBILITY_TO_RESPONSE_SYSTEM,
  PRESENTATIONBUTTONS_SYSTEM,
  AUTHENTICATION_REQUIREMENT_SYSTEM,
};

export type ReferoValueSet = typeof valueSet;

export default valueSet;
