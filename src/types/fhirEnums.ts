import { Coding } from 'fhir/r4';
const questionnaire_enable_operator_NotEquals: Coding = {
  code: '!=',
  display: 'Not Equals',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_LessThan: Coding = {
  code: '<',
  display: 'Less Than',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_LessOrEquals: Coding = {
  code: '<=',
  display: 'Less or Equals',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_Equals: Coding = {
  code: '=',
  display: 'Equals',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_GreaterThan: Coding = {
  code: '>',
  display: 'Greater Than',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_GreaterOrEquals: Coding = {
  code: '>=',
  display: 'Greater or Equals',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};
const questionnaire_enable_operator_Exists: Coding = {
  code: 'exists',
  display: 'Exists',
  system: 'http://hl7.org/fhir/questionnaire-enable-operator',
};

export const QuestionnaireEnableOperator = {
  /**
   * True if whether at least no answer has a value that is equal to the enableWhen answer.
   */
  NotEquals: questionnaire_enable_operator_NotEquals,
  /**
   * True if whether at least no answer has a value that is less than the enableWhen answer.
   */
  LessThan: questionnaire_enable_operator_LessThan,
  /**
   * True if whether at least no answer has a value that is less or equal to the enableWhen answer.
   */
  LessOrEquals: questionnaire_enable_operator_LessOrEquals,
  /**
   * True if whether at least one answer has a value that is equal to the enableWhen answer.
   */
  Equals: questionnaire_enable_operator_Equals,
  /**
   * True if whether at least no answer has a value that is greater than the enableWhen answer.
   */
  GreaterThan: questionnaire_enable_operator_GreaterThan,
  /**
   * True if whether at least no answer has a value that is greater or equal to the enableWhen answer.
   */
  GreaterOrEquals: questionnaire_enable_operator_GreaterOrEquals,
  /**
   * True if whether an answer exists is equal to the enableWhen answer (which must be a boolean).
   */
  Exists: questionnaire_enable_operator_Exists,
};
export enum QuestionnaireItemEnableBehaviorCodes {
  ALL = 'all',
  ANY = 'any',
}

export enum QuestionnaireItemTypeCodes {
  GROUP = 'group',
  DISPLAY = 'display',
  BOOLEAN = 'boolean',
  DECIMAL = 'decimal',
  INTEGER = 'integer',
  DATE = 'date',
  DATETIME = 'dateTime',
}
