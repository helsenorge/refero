export const ENTRY_FORMAT_URL = 'http://hl7.org/fhir/StructureDefinition/entryFormat' as const;
export const STEP_URL = 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces' as const;
export const MAX_DECIMAL_PLACES = 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces' as const;
export const MAX_VALUE_URL = 'http://hl7.org/fhir/StructureDefinition/maxValue' as const;
export const MIN_VALUE_URL = 'http://hl7.org/fhir/StructureDefinition/minValue' as const;
export const MIN_LENGTH_URL = 'http://hl7.org/fhir/StructureDefinition/minLength' as const;
export const MAX_OCCURS_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs' as const;
export const MIN_OCCURS_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs' as const;
export const REGEX_URL = 'http://hl7.org/fhir/StructureDefinition/regex' as const;
export const ITEMCONTROL_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' as const;
export const QUESTIONNAIRE_UNIT_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit' as const;
export const MARKDOWN_URL = 'http://hl7.org/fhir/StructureDefinition/rendering-markdown' as const;
export const QUESTIONNAIRE_HIDDEN_URL = 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden' as const;
export const ORDINAL_VALUE_URL = 'http://hl7.org/fhir/StructureDefinition/ordinalValue' as const;
export const VALIDATIONTEXT_URL = 'http://ehelse.no/fhir/StructureDefinition/validationtext' as const;
export const REPEATSTEXT_URL = 'http://ehelse.no/fhir/StructureDefinition/repeatstext' as const;
export const OPTION_REFERENCE_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference' as const;
export const CALCULATED_EXPRESSION_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression' as const;
export const COPY_EXPRESSION_URL = 'http://hl7.org/fhir/StructureDefinition/cqf-expression' as const;
export const DATE_MAX_VALUE_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-maxvalue' as const;
export const DATE_MIN_VALUE_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-minvalue' as const;
export const GUIDANCE_PARAMETER_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-guidanceparameter' as const;
export const GUIDANCE_ACTION_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-guidanceaction' as const;
export const PRESENTATION_BUTTONS_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-presentationbuttons' as const;
export const NAVIGATOR_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-questionnaire-navgiator-state' as const;
export const SUBLABEL_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel' as const;
export const HYPERLINK_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-hyperlink-target' as const;
export const VALUESET_LABEL_URL = 'http://hl7.org/fhir/StructureDefinition/valueset-label' as const;
export const MAX_SIZE_URL = 'http://hl7.org/fhir/StructureDefinition/maxSize' as const;
export const ACCESSIBILITY_TO_RESPONSE_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-accessibilitytoresponse' as const;
export const AUTHENTICATION_REQUIREMENT_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-authenticationrequirement' as const;
export const PRESENTATIONBUTTONS_URL = 'http://helsenorge.no/fhir/StructureDefinition/sdf-presentationbuttons' as const;
export const SDF_GENERATENARRATIVE_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-generatenarrative' as const;
export const SDF_GENERATE_PDF_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-generatepdf' as const;
export const DISCRETION_URL = 'http://ehelse.no/fhir/StructureDefinition/sdf-discretion' as const;
export const VALIDATE_READONLY_URL = 'http://helsenorge.no/fhir/StructureDefinition/validate-readonly' as const;
export const QUESTIONNAIRE_ACTION_BUTTON = 'http://helsenorge.no/fhir/StructureDefinition/sdf-guidanceaction/ButtonType' as const;
export const QUESTIONNAIRE_ACTION_BUTTON_ITEM_CONTROL = 'http://hl7.org/fhir/ValueSet/questionnaire-item-control' as const;

const extensionUrls = {
  DISCRETION_URL,
  SDF_GENERATE_PDF_URL,
  SDF_GENERATENARRATIVE_URL,
  AUTHENTICATION_REQUIREMENT_URL,
  ENTRY_FORMAT_URL,
  STEP_URL,
  MAX_DECIMAL_PLACES,
  MAX_VALUE_URL,
  MIN_VALUE_URL,
  MIN_LENGTH_URL,
  MAX_OCCURS_URL,
  MIN_OCCURS_URL,
  REGEX_URL,
  ITEMCONTROL_URL,
  QUESTIONNAIRE_UNIT_URL,
  MARKDOWN_URL,
  QUESTIONNAIRE_HIDDEN_URL,
  ORDINAL_VALUE_URL,
  VALIDATIONTEXT_URL,
  REPEATSTEXT_URL,
  OPTION_REFERENCE_URL,
  CALCULATED_EXPRESSION_URL,
  COPY_EXPRESSION_URL,
  DATE_MAX_VALUE_URL,
  DATE_MIN_VALUE_URL,
  GUIDANCE_PARAMETER_URL,
  GUIDANCE_ACTION_URL,
  PRESENTATION_BUTTONS_URL,
  NAVIGATOR_URL,
  SUBLABEL_URL,
  HYPERLINK_URL,
  VALUESET_LABEL_URL,
  MAX_SIZE_URL,
  ACCESSIBILITY_TO_RESPONSE_URL,
  PRESENTATIONBUTTONS_URL,
  VALIDATE_READONLY_URL,
  QUESTIONNAIRE_ACTION_BUTTON,
  QUESTIONNAIRE_ACTION_BUTTON_ITEM_CONTROL,
};
export type ReferoExtensionUrls = typeof extensionUrls;
export { extensionUrls as Extensions };
