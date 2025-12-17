import type { Coding } from 'fhir/r4';
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

export enum ProcedureStatusCodes {
  PREPARATION = 'preparation',
  IN_PROGRESS = 'in-progress',
  NOT_DONE = 'not-done',
  ON_HOLD = 'on-hold',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}

export enum ProvenanceEntityRoleCodes {
  DERIVATION = 'derivation',
  REVISION = 'revision',
  QUOTATION = 'quotation',
  SOURCE = 'source',
  REMOVAL = 'removal',
}
export enum QuestionnaireItemEnableWhenOperatorCodes {
  EXISTS = 'exists',
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUALS = '>=',
  LESS_THAN_OR_EQUALS = '<=',
}
export enum QuestionnaireStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}

export enum QuestionnaireResponseStatusCodes {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  AMENDED = 'amended',
  ENTERED_IN_ERROR = 'entered-in-error',
  STOPPED = 'stopped',
}
export enum RelatedPersonGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
export enum RequestGroupActionConditionKindCodes {
  APPLICABILITY = 'applicability',
  START = 'start',
  STOP = 'stop',
}

export enum RequestGroupActionRelatedActionRelationshipCodes {
  BEFORE_START = 'before-start',
  BEFORE = 'before',
  BEFORE_END = 'before-end',
  CONCURRENT_WITH_START = 'concurrent-with-start',
  CONCURRENT = 'concurrent',
  CONCURRENT_WITH_END = 'concurrent-with-end',
  AFTER_START = 'after-start',
  AFTER = 'after',
  AFTER_END = 'after-end',
}
export enum RequestGroupActionCardinalityBehaviorCodes {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}
/**
 * Code Values for the RequestGroup.action.groupingBehavior field
 */
export enum RequestGroupActionGroupingBehaviorCodes {
  VISUAL_GROUP = 'visual-group',
  LOGICAL_GROUP = 'logical-group',
  SENTENCE_GROUP = 'sentence-group',
}
/**
 * Code Values for the RequestGroup.action.precheckBehavior field
 */
export enum RequestGroupActionPrecheckBehaviorCodes {
  YES = 'yes',
  NO = 'no',
}
/**
 * Code Values for the RequestGroup.action.priority field
 */
export enum RequestGroupActionPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the RequestGroup.action.requiredBehavior field
 */
export enum RequestGroupActionRequiredBehaviorCodes {
  MUST = 'must',
  COULD = 'could',
  MUST_UNLESS_DOCUMENTED = 'must-unless-documented',
}
/**
 * Code Values for the RequestGroup.action.selectionBehavior field
 */
export enum RequestGroupActionSelectionBehaviorCodes {
  ANY = 'any',
  ALL = 'all',
  ALL_OR_NONE = 'all-or-none',
  EXACTLY_ONE = 'exactly-one',
  AT_MOST_ONE = 'at-most-one',
  ONE_OR_MORE = 'one-or-more',
}
export enum RequestGroupIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the RequestGroup.priority field
 */
export enum RequestGroupPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the RequestGroup.status field
 */
export enum RequestGroupStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
export enum ResearchDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum ResearchElementDefinitionCharacteristicParticipantEffectiveGroupMeasureCodes {
  MEAN = 'mean',
  MEDIAN = 'median',
  MEAN_OF_MEAN = 'mean-of-mean',
  MEAN_OF_MEDIAN = 'mean-of-median',
  MEDIAN_OF_MEAN = 'median-of-mean',
  MEDIAN_OF_MEDIAN = 'median-of-median',
}
/**
 * Code Values for the ResearchElementDefinition.characteristic.studyEffectiveGroupMeasure field
 */
export enum ResearchElementDefinitionCharacteristicStudyEffectiveGroupMeasureCodes {
  MEAN = 'mean',
  MEDIAN = 'median',
  MEAN_OF_MEAN = 'mean-of-mean',
  MEAN_OF_MEDIAN = 'mean-of-median',
  MEDIAN_OF_MEAN = 'median-of-mean',
  MEDIAN_OF_MEDIAN = 'median-of-median',
}
export enum ResearchElementDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ResearchElementDefinition.type field
 */
export enum ResearchElementDefinitionTypeCodes {
  POPULATION = 'population',
  EXPOSURE = 'exposure',
  OUTCOME = 'outcome',
}
/**
 * Code Values for the ResearchElementDefinition.variableType field
 */
export enum ResearchElementDefinitionVariableTypeCodes {
  DICHOTOMOUS = 'dichotomous',
  CONTINUOUS = 'continuous',
  DESCRIPTIVE = 'descriptive',
}
export enum ResearchStudyStatusCodes {
  ACTIVE = 'active',
  ADMINISTRATIVELY_COMPLETED = 'administratively-completed',
  APPROVED = 'approved',
  CLOSED_TO_ACCRUAL = 'closed-to-accrual',
  CLOSED_TO_ACCRUAL_AND_INTERVENTION = 'closed-to-accrual-and-intervention',
  COMPLETED = 'completed',
  DISAPPROVED = 'disapproved',
  IN_REVIEW = 'in-review',
  TEMPORARILY_CLOSED_TO_ACCRUAL = 'temporarily-closed-to-accrual',
  TEMPORARILY_CLOSED_TO_ACCRUAL_AND_INTERVENTION = 'temporarily-closed-to-accrual-and-intervention',
  WITHDRAWN = 'withdrawn',
}
export enum ResearchSubjectStatusCodes {
  CANDIDATE = 'candidate',
  ELIGIBLE = 'eligible',
  FOLLOW_UP = 'follow-up',
  INELIGIBLE = 'ineligible',
  NOT_REGISTERED = 'not-registered',
  OFF_STUDY = 'off-study',
  ON_STUDY = 'on-study',
  ON_STUDY_INTERVENTION = 'on-study-intervention',
  ON_STUDY_OBSERVATION = 'on-study-observation',
  PENDING_ON_STUDY = 'pending-on-study',
  POTENTIAL_CANDIDATE = 'potential-candidate',
  SCREENING = 'screening',
  WITHDRAWN = 'withdrawn',
}
export enum RiskAssessmentStatusCodes {
  REGISTERED = 'registered',
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
}
export enum RiskEvidenceSynthesisStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum SearchParameterComparatorCodes {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  LT = 'lt',
  GE = 'ge',
  LE = 'le',
  SA = 'sa',
  EB = 'eb',
  AP = 'ap',
}
/**
 * Code Values for the SearchParameter.modifier field
 */
export enum SearchParameterModifierCodes {
  MISSING = 'missing',
  EXACT = 'exact',
  CONTAINS = 'contains',
  NOT = 'not',
  TEXT = 'text',
  IN = 'in',
  NOT_IN = 'not-in',
  BELOW = 'below',
  ABOVE = 'above',
  TYPE = 'type',
  IDENTIFIER = 'identifier',
  OFTYPE = 'ofType',
}
/**
 * Code Values for the SearchParameter.status field
 */
export enum SearchParameterStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the SearchParameter.type field
 */
export enum SearchParameterTypeCodes {
  NUMBER = 'number',
  DATE = 'date',
  STRING = 'string',
  TOKEN = 'token',
  REFERENCE = 'reference',
  COMPOSITE = 'composite',
  QUANTITY = 'quantity',
  URI = 'uri',
  SPECIAL = 'special',
}
/**
 * Code Values for the SearchParameter.xpathUsage field
 */
export enum SearchParameterXpathUsageCodes {
  NORMAL = 'normal',
  PHONETIC = 'phonetic',
  NEARBY = 'nearby',
  DISTANCE = 'distance',
  OTHER = 'other',
}
export enum ServiceRequestIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the ServiceRequest.priority field
 */
export enum ServiceRequestPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the ServiceRequest.status field
 */
export enum ServiceRequestStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
export enum SlotStatusCodes {
  BUSY = 'busy',
  FREE = 'free',
  BUSY_UNAVAILABLE = 'busy-unavailable',
  BUSY_TENTATIVE = 'busy-tentative',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum SpecimenStatusCodes {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  UNSATISFACTORY = 'unsatisfactory',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum SpecimenDefinitionTypeTestedPreferenceCodes {
  PREFERRED = 'preferred',
  ALTERNATE = 'alternate',
}
export enum StructureDefinitionContextTypeCodes {
  FHIRPATH = 'fhirpath',
  ELEMENT = 'element',
  EXTENSION = 'extension',
}
export enum StructureDefinitionDerivationCodes {
  SPECIALIZATION = 'specialization',
  CONSTRAINT = 'constraint',
}
/**
 * Code Values for the StructureDefinition.kind field
 */
export enum StructureDefinitionKindCodes {
  PRIMITIVE_TYPE = 'primitive-type',
  COMPLEX_TYPE = 'complex-type',
  RESOURCE = 'resource',
  LOGICAL = 'logical',
}
/**
 * Code Values for the StructureDefinition.status field
 */
export enum StructureDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum StructureMapStructureModeCodes {
  SOURCE = 'source',
  QUERIED = 'queried',
  TARGET = 'target',
  PRODUCED = 'produced',
}
export enum StructureMapGroupInputModeCodes {
  SOURCE = 'source',
  TARGET = 'target',
}
export enum StructureMapGroupRuleSourceListModeCodes {
  FIRST = 'first',
  NOT_FIRST = 'not_first',
  LAST = 'last',
  NOT_LAST = 'not_last',
  ONLY_ONE = 'only_one',
}
export enum StructureMapGroupRuleTargetContextTypeCodes {
  TYPE = 'type',
  VARIABLE = 'variable',
}
/**
 * Code Values for the StructureMap.group.rule.target.listMode field
 */
export enum StructureMapGroupRuleTargetListModeCodes {
  FIRST = 'first',
  SHARE = 'share',
  LAST = 'last',
  COLLATE = 'collate',
}
/**
 * Code Values for the StructureMap.group.rule.target.transform field
 */
export enum StructureMapGroupRuleTargetTransformCodes {
  CREATE = 'create',
  COPY = 'copy',
}
export enum StructureMapGroupTypeModeCodes {
  NONE = 'none',
  TYPES = 'types',
  TYPE_AND_TYPES = 'type-and-types',
}
export enum StructureMapStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum SubscriptionChannelTypeCodes {
  REST_HOOK = 'rest-hook',
  WEBSOCKET = 'websocket',
  EMAIL = 'email',
  SMS = 'sms',
  MESSAGE = 'message',
}
export enum SubscriptionStatusCodes {
  REQUESTED = 'requested',
  ACTIVE = 'active',
  ERROR = 'error',
  OFF = 'off',
}
export enum SubstanceStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum SupplyDeliveryStatusCodes {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum SupplyRequestPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the SupplyRequest.status field
 */
export enum SupplyRequestStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}
export enum TaskIntentCodes {
  UNKNOWN = 'unknown',
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the Task.priority field
 */
export enum TaskPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the Task.status field
 */
export enum TaskStatusCodes {
  DRAFT = 'draft',
  REQUESTED = 'requested',
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  PLUS = '+',
}
/**
 * Code Values for the TerminologyCapabilities.codeSearch field
 */
export enum TerminologyCapabilitiesCodeSearchCodes {
  EXPLICIT = 'explicit',
  ALL = 'all',
}
/**
 * Code Values for the TerminologyCapabilities.kind field
 */
export enum TerminologyCapabilitiesKindCodes {
  INSTANCE = 'instance',
  CAPABILITY = 'capability',
  REQUIREMENTS = 'requirements',
}
/**
 * Code Values for the TerminologyCapabilities.status field
 */
export enum TerminologyCapabilitiesStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the TestReport.setup.action.operation.result field
 */
export enum TestReportSetupActionOperationResultCodes {
  PASS = 'pass',
  SKIP = 'skip',
  FAIL = 'fail',
  WARNING = 'warning',
  ERROR = 'error',
}
/**
 * Code Values for the TestReport.participant.type field
 */
export enum TestReportParticipantTypeCodes {
  TEST_ENGINE = 'test-engine',
  CLIENT = 'client',
  SERVER = 'server',
}
/**
 * Code Values for the TestReport.setup.action.assert.result field
 */
export enum TestReportSetupActionAssertResultCodes {
  PASS = 'pass',
  SKIP = 'skip',
  FAIL = 'fail',
  WARNING = 'warning',
  ERROR = 'error',
}
/**
 * Code Values for the TestReport.result field
 */
export enum TestReportResultCodes {
  PASS = 'pass',
  FAIL = 'fail',
  PENDING = 'pending',
}
/**
 * Code Values for the TestReport.status field
 */
export enum TestReportStatusCodes {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in-progress',
  WAITING = 'waiting',
  STOPPED = 'stopped',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the TestScript.setup.action.operation.method field
 */
export enum TestScriptSetupActionOperationMethodCodes {
  DELETE = 'delete',
  GET = 'get',
  OPTIONS = 'options',
  PATCH = 'patch',
  POST = 'post',
  PUT = 'put',
  HEAD = 'head',
}
/**
 * Code Values for the TestScript.setup.action.assert.direction field
 */
export enum TestScriptSetupActionAssertDirectionCodes {
  RESPONSE = 'response',
  REQUEST = 'request',
}
/**
 * Code Values for the TestScript.setup.action.assert.operator field
 */
export enum TestScriptSetupActionAssertOperatorCodes {
  EQUALS = 'equals',
  NOTEQUALS = 'notEquals',
  IN = 'in',
  NOTIN = 'notIn',
  GREATERTHAN = 'greaterThan',
  LESSTHAN = 'lessThan',
  EMPTY = 'empty',
  NOTEMPTY = 'notEmpty',
  CONTAINS = 'contains',
  NOTCONTAINS = 'notContains',
  EVAL = 'eval',
}
/**
 * Code Values for the TestScript.setup.action.assert.requestMethod field
 */
export enum TestScriptSetupActionAssertRequestMethodCodes {
  DELETE = 'delete',
  GET = 'get',
  OPTIONS = 'options',
  PATCH = 'patch',
  POST = 'post',
  PUT = 'put',
  HEAD = 'head',
}
/**
 * Code Values for the TestScript.setup.action.assert.response field
 */
export enum TestScriptSetupActionAssertResponseCodes {
  OKAY = 'okay',
  CREATED = 'created',
  NOCONTENT = 'noContent',
  NOTMODIFIED = 'notModified',
  BAD = 'bad',
  FORBIDDEN = 'forbidden',
  NOTFOUND = 'notFound',
  METHODNOTALLOWED = 'methodNotAllowed',
  CONFLICT = 'conflict',
  GONE = 'gone',
  PRECONDITIONFAILED = 'preconditionFailed',
  UNPROCESSABLE = 'unprocessable',
}
/**
 * Code Values for the TestScript.status field
 */
export enum TestScriptStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ValueSet.compose.include.filter.op field
 */
export enum ValueSetComposeIncludeFilterOpCodes {
  EQUALS = '=',
  IS_A = 'is-a',
  DESCENDENT_OF = 'descendent-of',
  IS_NOT_A = 'is-not-a',
  REGEX = 'regex',
  IN = 'in',
  NOT_IN = 'not-in',
  GENERALIZES = 'generalizes',
  EXISTS = 'exists',
}
/**
 * Code Values for the ValueSet.status field
 */
export enum ValueSetStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the VerificationResult.status field
 */
export enum VerificationResultStatusCodes {
  ATTESTED = 'attested',
  VALIDATED = 'validated',
  IN_PROCESS = 'in-process',
  REQ_REVALID = 'req-revalid',
  VAL_FAIL = 'val-fail',
  REVAL_FAIL = 'reval-fail',
}
/**
 * Code Values for the VisionPrescription.lensSpecification.prism.base field
 */
export enum VisionPrescriptionLensSpecificationPrismBaseCodes {
  UP = 'up',
  DOWN = 'down',
  IN = 'in',
  OUT = 'out',
}
/**
 * Code Values for the VisionPrescription.lensSpecification.eye field
 */
export enum VisionPrescriptionLensSpecificationEyeCodes {
  RIGHT = 'right',
  LEFT = 'left',
}
/**
 * Code Values for the VisionPrescription.status field
 */
export enum VisionPrescriptionStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum AddressTypeCodes {
  POSTAL = 'postal',
  PHYSICAL = 'physical',
  BOTH = 'both',
}
/**
 * Code Values for the Address.use field
 */
export enum AddressUseCodes {
  HOME = 'home',
  WORK = 'work',
  TEMP = 'temp',
  OLD = 'old',
  BILLING = 'billing',
}
/**
 * Code Values for the ContactPoint.system field
 */
export enum ContactPointSystemCodes {
  PHONE = 'phone',
  FAX = 'fax',
  EMAIL = 'email',
  PAGER = 'pager',
  URL = 'url',
  SMS = 'sms',
  OTHER = 'other',
}
/**
 * Code Values for the ContactPoint.use field
 */
export enum ContactPointUseCodes {
  HOME = 'home',
  WORK = 'work',
  TEMP = 'temp',
  OLD = 'old',
  MOBILE = 'mobile',
}
export enum DataRequirementSortDirectionCodes {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}
export enum ElementDefinitionSlicingDiscriminatorTypeCodes {
  VALUE = 'value',
  EXISTS = 'exists',
  PATTERN = 'pattern',
  TYPE = 'type',
  PROFILE = 'profile',
}
export enum ElementDefinitionSlicingRulesCodes {
  CLOSED = 'closed',
  OPEN = 'open',
  OPENATEND = 'openAtEnd',
}
/**
 * Code Values for the ElementDefinition.type.aggregation field
 */
export enum ElementDefinitionTypeAggregationCodes {
  CONTAINED = 'contained',
  REFERENCED = 'referenced',
  BUNDLED = 'bundled',
}
/**
 * Code Values for the ElementDefinition.type.versioning field
 */
export enum ElementDefinitionTypeVersioningCodes {
  EITHER = 'either',
  INDEPENDENT = 'independent',
  SPECIFIC = 'specific',
}
/**
 * Code Values for the ElementDefinition.constraint.severity field
 */
export enum ElementDefinitionConstraintSeverityCodes {
  ERROR = 'error',
  WARNING = 'warning',
}
/**
 * Code Values for the ElementDefinition.binding.strength field
 */
export enum ElementDefinitionBindingStrengthCodes {
  REQUIRED = 'required',
  EXTENSIBLE = 'extensible',
  PREFERRED = 'preferred',
  EXAMPLE = 'example',
}
/**
 * Code Values for the ElementDefinition.representation field
 */
export enum ElementDefinitionRepresentationCodes {
  XMLATTR = 'xmlAttr',
  XMLTEXT = 'xmlText',
  TYPEATTR = 'typeAttr',
  CDATEXT = 'cdaText',
  XHTML = 'xhtml',
}
/**
 * Code Values for the Expression.language field
 */
export enum ExpressionLanguageCodes {
  TEXT_CQL = 'text/cql',
  TEXT_FHIRPATH = 'text/fhirpath',
  APPLICATION_X_FHIR_QUERY = 'application/x-fhir-query',
  ETC = 'etc.',
}
/**
 * Code Values for the HumanName.use field
 */
export enum HumanNameUseCodes {
  USUAL = 'usual',
  OFFICIAL = 'official',
  TEMP = 'temp',
  NICKNAME = 'nickname',
  ANONYMOUS = 'anonymous',
  OLD = 'old',
  MAIDEN = 'maiden',
}
/**
 * Code Values for the Identifier.use field
 */
export enum IdentifierUseCodes {
  USUAL = 'usual',
  OFFICIAL = 'official',
  TEMP = 'temp',
  SECONDARY = 'secondary',
  OLD = 'old',
}
/**
 * Code Values for the Quantity.comparator field
 */
export enum QuantityComparatorCodes {
  LESS_THAN = '<',
  LESS_THAN_OR_EQUALS = '<=',
  GREATER_THAN_OR_EQUALS = '>=',
  GREATER_THAN = '>',
}
/**
 * Code Values for the Narrative.status field
 */
export enum NarrativeStatusCodes {
  GENERATED = 'generated',
  EXTENSIONS = 'extensions',
  ADDITIONAL = 'additional',
  EMPTY = 'empty',
}
/**
 * Code Values for the ParameterDefinition.use field
 */
export enum ParameterDefinitionUseCodes {
  IN = 'in',
  OUT = 'out',
}
/**
 * Code Values for the RelatedArtifact.type field
 */
export enum RelatedArtifactTypeCodes {
  DOCUMENTATION = 'documentation',
  JUSTIFICATION = 'justification',
  CITATION = 'citation',
  PREDECESSOR = 'predecessor',
  SUCCESSOR = 'successor',
  DERIVED_FROM = 'derived-from',
  DEPENDS_ON = 'depends-on',
  COMPOSED_OF = 'composed-of',
}
/**
 * Code Values for the Timing.repeat.dayOfWeek field
 */
export enum TimingRepeatDayOfWeekCodes {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}
/**
 * Code Values for the Timing.repeat.durationUnit field
 */
export enum TimingRepeatDurationUnitCodes {
  S = 's',
  MIN = 'min',
  H = 'h',
  D = 'd',
  WK = 'wk',
  MO = 'mo',
  A = 'a',
}
/**
 * Code Values for the Timing.repeat.periodUnit field
 */
export enum TimingRepeatPeriodUnitCodes {
  S = 's',
  MIN = 'min',
  H = 'h',
  D = 'd',
  WK = 'wk',
  MO = 'mo',
  A = 'a',
}
/**
 * Code Values for the TriggerDefinition.type field
 */
export enum TriggerDefinitionTypeCodes {
  NAMED_EVENT = 'named-event',
  PERIODIC = 'periodic',
  DATA_CHANGED = 'data-changed',
  DATA_ADDED = 'data-added',
  DATA_MODIFIED = 'data-modified',
  DATA_REMOVED = 'data-removed',
  DATA_ACCESSED = 'data-accessed',
  DATA_ACCESS_ENDED = 'data-access-ended',
}
/**
 * Code Values for the Account.status field
 */
export enum AccountStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
  ON_HOLD = 'on-hold',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ActivityDefinition.participant.type field
 */
export enum ActivityDefinitionParticipantTypeCodes {
  PATIENT = 'patient',
  PRACTITIONER = 'practitioner',
  RELATED_PERSON = 'related-person',
  DEVICE = 'device',
}
/**
 * Code Values for the ActivityDefinition.intent field
 */
export enum ActivityDefinitionIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the ActivityDefinition.priority field
 */
export enum ActivityDefinitionPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the ActivityDefinition.status field
 */
export enum ActivityDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum AdverseEventActualityCodes {
  ACTUAL = 'actual',
  POTENTIAL = 'potential',
}
/**
 * Code Values for the AllergyIntolerance.reaction.severity field
 */
export enum AllergyIntoleranceReactionSeverityCodes {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}
/**
 * Code Values for the AllergyIntolerance.category field
 */
export enum AllergyIntoleranceCategoryCodes {
  FOOD = 'food',
  MEDICATION = 'medication',
  ENVIRONMENT = 'environment',
  BIOLOGIC = 'biologic',
}
/**
 * Code Values for the AllergyIntolerance.criticality field
 */
export enum AllergyIntoleranceCriticalityCodes {
  LOW = 'low',
  HIGH = 'high',
  UNABLE_TO_ASSESS = 'unable-to-assess',
}
/**
 * Code Values for the AllergyIntolerance.type field
 */
export enum AllergyIntoleranceTypeCodes {
  ALLERGY = 'allergy',
  INTOLERANCE = 'intolerance',
}
/**
 * Code Values for the Appointment.participant.required field
 */
export enum AppointmentParticipantRequiredCodes {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  INFORMATION_ONLY = 'information-only',
}
/**
 * Code Values for the Appointment.participant.status field
 */
export enum AppointmentParticipantStatusCodes {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needs-action',
}
export enum AppointmentStatusCodes {
  PROPOSED = 'proposed',
  PENDING = 'pending',
  BOOKED = 'booked',
  ARRIVED = 'arrived',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  NOSHOW = 'noshow',
  ENTERED_IN_ERROR = 'entered-in-error',
  CHECKED_IN = 'checked-in',
  WAITLIST = 'waitlist',
}
export enum AppointmentResponseParticipantStatusCodes {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needs-action',
}
export enum BiologicallyDerivedProductStorageScaleCodes {
  FARENHEIT = 'farenheit',
  CELSIUS = 'celsius',
  KELVIN = 'kelvin',
}
export enum BiologicallyDerivedProductProductCategoryCodes {
  ORGAN = 'organ',
  TISSUE = 'tissue',
  FLUID = 'fluid',
  CELLS = 'cells',
  BIOLOGICALAGENT = 'biologicalAgent',
}
/**
 * Code Values for the BiologicallyDerivedProduct.status field
 */
export enum BiologicallyDerivedProductStatusCodes {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}
/**
 * Code Values for the Bundle.entry.search.mode field
 */
export enum BundleEntrySearchModeCodes {
  MATCH = 'match',
  INCLUDE = 'include',
  OUTCOME = 'outcome',
}
/**
 * Code Values for the Bundle.entry.request.method field
 */
export enum BundleEntryRequestMethodCodes {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
/**
 * Code Values for the Bundle.type field
 */
export enum BundleTypeCodes {
  DOCUMENT = 'document',
  MESSAGE = 'message',
  TRANSACTION = 'transaction',
  TRANSACTION_RESPONSE = 'transaction-response',
  BATCH = 'batch',
  BATCH_RESPONSE = 'batch-response',
  HISTORY = 'history',
  SEARCHSET = 'searchset',
  COLLECTION = 'collection',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.interaction.code field
 */
export enum CapabilityStatementRestResourceInteractionCodeCodes {
  READ = 'read',
  VREAD = 'vread',
  UPDATE = 'update',
  PATCH = 'patch',
  DELETE = 'delete',
  HISTORY_INSTANCE = 'history-instance',
  HISTORY_TYPE = 'history-type',
  CREATE = 'create',
  SEARCH_TYPE = 'search-type',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.searchParam.type field
 */
export enum CapabilityStatementRestResourceSearchParamTypeCodes {
  NUMBER = 'number',
  DATE = 'date',
  STRING = 'string',
  TOKEN = 'token',
  REFERENCE = 'reference',
  COMPOSITE = 'composite',
  QUANTITY = 'quantity',
  URI = 'uri',
  SPECIAL = 'special',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.conditionalDelete field
 */
export enum CapabilityStatementRestResourceConditionalDeleteCodes {
  NOT_SUPPORTED = 'not-supported',
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.conditionalRead field
 */
export enum CapabilityStatementRestResourceConditionalReadCodes {
  NOT_SUPPORTED = 'not-supported',
  MODIFIED_SINCE = 'modified-since',
  NOT_MATCH = 'not-match',
  FULL_SUPPORT = 'full-support',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.referencePolicy field
 */
export enum CapabilityStatementRestResourceReferencePolicyCodes {
  LITERAL = 'literal',
  LOGICAL = 'logical',
  RESOLVES = 'resolves',
  ENFORCED = 'enforced',
  LOCAL = 'local',
}
/**
 * Code Values for the CapabilityStatement.rest.resource.versioning field
 */
export enum CapabilityStatementRestResourceVersioningCodes {
  NO_VERSION = 'no-version',
  VERSIONED = 'versioned',
  VERSIONED_UPDATE = 'versioned-update',
}
/**
 * Code Values for the CapabilityStatement.rest.interaction.code field
 */
export enum CapabilityStatementRestInteractionCodeCodes {
  TRANSACTION = 'transaction',
  BATCH = 'batch',
  SEARCH_SYSTEM = 'search-system',
  HISTORY_SYSTEM = 'history-system',
}
/**
 * Code Values for the CapabilityStatement.rest.mode field
 */
export enum CapabilityStatementRestModeCodes {
  CLIENT = 'client',
  SERVER = 'server',
}
/**
 * Code Values for the CapabilityStatement.messaging.supportedMessage.mode field
 */
export enum CapabilityStatementMessagingSupportedMessageModeCodes {
  SENDER = 'sender',
  RECEIVER = 'receiver',
}
/**
 * Code Values for the CapabilityStatement.document.mode field
 */
export enum CapabilityStatementDocumentModeCodes {
  PRODUCER = 'producer',
  CONSUMER = 'consumer',
}
/**
 * Code Values for the CapabilityStatement.format field
 */
export enum CapabilityStatementFormatCodes {
  FORMATS = 'formats',
  JSON = 'json',
  TTL = 'ttl',
  MIME = 'mime',
}
/**
 * Code Values for the CapabilityStatement.kind field
 */
export enum CapabilityStatementKindCodes {
  INSTANCE = 'instance',
  CAPABILITY = 'capability',
  REQUIREMENTS = 'requirements',
}
/**
 * Code Values for the CapabilityStatement.status field
 */
export enum CapabilityStatementStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the CarePlan.activity.detail.kind field
 */
export enum CarePlanActivityDetailKindCodes {
  APPOINTMENT = 'Appointment',
  COMMUNICATIONREQUEST = 'CommunicationRequest',
  DEVICEREQUEST = 'DeviceRequest',
  MEDICATIONREQUEST = 'MedicationRequest',
  NUTRITIONORDER = 'NutritionOrder',
  TASK = 'Task',
  SERVICEREQUEST = 'ServiceRequest',
  VISIONPRESCRIPTION = 'VisionPrescription',
}
/**
 * Code Values for the CarePlan.activity.detail.status field
 */
export enum CarePlanActivityDetailStatusCodes {
  NOT_STARTED = 'not-started',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  STOPPED = 'stopped',
  UNKNOWN = 'unknown',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the CarePlan.intent field
 */
export enum CarePlanIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  ORDER = 'order',
  OPTION = 'option',
}
/**
 * Code Values for the CarePlan.status field
 */
export enum CarePlanStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the CareTeam.status field
 */
export enum CareTeamStatusCodes {
  PROPOSED = 'proposed',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the CatalogEntry.relatedEntry.relationtype field
 */
export enum CatalogEntryRelatedEntryRelationtypeCodes {
  TRIGGERS = 'triggers',
  IS_REPLACED_BY = 'is-replaced-by',
}
/**
 * Code Values for the CatalogEntry.status field
 */
export enum CatalogEntryStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ChargeItem.status field
 */
export enum ChargeItemStatusCodes {
  PLANNED = 'planned',
  BILLABLE = 'billable',
  NOT_BILLABLE = 'not-billable',
  ABORTED = 'aborted',
  BILLED = 'billed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ChargeItemDefinition.propertyGroup.priceComponent.type field
 */
export enum ChargeItemDefinitionPropertyGroupPriceComponentTypeCodes {
  BASE = 'base',
  SURCHARGE = 'surcharge',
  DEDUCTION = 'deduction',
  DISCOUNT = 'discount',
  TAX = 'tax',
  INFORMATIONAL = 'informational',
}
/**
 * Code Values for the ChargeItemDefinition.status field
 */
export enum ChargeItemDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Claim.status field
 */
export enum ClaimStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Claim.use field
 */
export enum ClaimUseCodes {
  CLAIM = 'claim',
  PREAUTHORIZATION = 'preauthorization',
  PREDETERMINATION = 'predetermination',
}
/**
 * Code Values for the ClaimResponse.processNote.type field
 */
export enum ClaimResponseProcessNoteTypeCodes {
  DISPLAY = 'display',
  PRINT = 'print',
  PRINTOPER = 'printoper',
}
/**
 * Code Values for the ClaimResponse.outcome field
 */
export enum ClaimResponseOutcomeCodes {
  QUEUED = 'queued',
  COMPLETE = 'complete',
  ERROR = 'error',
  PARTIAL = 'partial',
}
/**
 * Code Values for the ClaimResponse.status field
 */
export enum ClaimResponseStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the ClaimResponse.use field
 */
export enum ClaimResponseUseCodes {
  CLAIM = 'claim',
  PREAUTHORIZATION = 'preauthorization',
  PREDETERMINATION = 'predetermination',
}
/**
 * Code Values for the ClinicalImpression.status field
 */
export enum ClinicalImpressionStatusCodes {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the CodeSystem.filter.operator field
 */
export enum CodeSystemFilterOperatorCodes {
  EQUALS = '=',
  IS_A = 'is-a',
  DESCENDENT_OF = 'descendent-of',
  IS_NOT_A = 'is-not-a',
  REGEX = 'regex',
  IN = 'in',
  NOT_IN = 'not-in',
  GENERALIZES = 'generalizes',
  EXISTS = 'exists',
}
/**
 * Code Values for the CodeSystem.property.type field
 */
export enum CodeSystemPropertyTypeCodes {
  CODE = 'code',
  CODING = 'Coding',
  STRING = 'string',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATETIME = 'dateTime',
  DECIMAL = 'decimal',
}
/**
 * Code Values for the CodeSystem.content field
 */
export enum CodeSystemContentCodes {
  NOT_PRESENT = 'not-present',
  EXAMPLE = 'example',
  FRAGMENT = 'fragment',
  COMPLETE = 'complete',
  SUPPLEMENT = 'supplement',
}
/**
 * Code Values for the CodeSystem.hierarchyMeaning field
 */
export enum CodeSystemHierarchyMeaningCodes {
  GROUPED_BY = 'grouped-by',
  IS_A = 'is-a',
  PART_OF = 'part-of',
  CLASSIFIED_WITH = 'classified-with',
}
/**
 * Code Values for the CodeSystem.status field
 */
export enum CodeSystemStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Communication.priority field
 */
export enum CommunicationPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the Communication.status field
 */
export enum CommunicationStatusCodes {
  PREPARATION = 'preparation',
  IN_PROGRESS = 'in-progress',
  NOT_DONE = 'not-done',
  ON_HOLD = 'on-hold',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the CommunicationRequest.priority field
 */
export enum CommunicationRequestPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the CommunicationRequest.status field
 */
export enum CommunicationRequestStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the CompartmentDefinition.code field
 */
export enum CompartmentDefinitionCodeCodes {
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  RELATEDPERSON = 'RelatedPerson',
  PRACTITIONER = 'Practitioner',
  DEVICE = 'Device',
}
/**
 * Code Values for the CompartmentDefinition.status field
 */
export enum CompartmentDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Composition.attester.mode field
 */
export enum CompositionAttesterModeCodes {
  PERSONAL = 'personal',
  PROFESSIONAL = 'professional',
  LEGAL = 'legal',
  OFFICIAL = 'official',
}
/**
 * Code Values for the Composition.relatesTo.code field
 */
export enum CompositionRelatesToCodeCodes {
  REPLACES = 'replaces',
  TRANSFORMS = 'transforms',
  SIGNS = 'signs',
  APPENDS = 'appends',
}
/**
 * Code Values for the Composition.section.mode field
 */
export enum CompositionSectionModeCodes {
  WORKING = 'working',
  SNAPSHOT = 'snapshot',
  CHANGES = 'changes',
}
/**
 * Code Values for the Composition.status field
 */
export enum CompositionStatusCodes {
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
  ENTERED_IN_ERROR = 'entered-in-error',
}
export enum ConceptMapGroupElementTargetEquivalenceCodes {
  RELATEDTO = 'relatedto',
  EQUIVALENT = 'equivalent',
  EQUAL = 'equal',
  WIDER = 'wider',
  SUBSUMES = 'subsumes',
  NARROWER = 'narrower',
  SPECIALIZES = 'specializes',
  INEXACT = 'inexact',
  UNMATCHED = 'unmatched',
  DISJOINT = 'disjoint',
}
/**
 * Code Values for the ConceptMap.group.unmapped.mode field
 */
export enum ConceptMapGroupUnmappedModeCodes {
  PROVIDED = 'provided',
  FIXED = 'fixed',
  OTHER_MAP = 'other-map',
}
/**
 * Code Values for the ConceptMap.status field
 */
export enum ConceptMapStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Consent.provision.data.meaning field
 */
export enum ConsentProvisionDataMeaningCodes {
  INSTANCE = 'instance',
  RELATED = 'related',
  DEPENDENTS = 'dependents',
  AUTHOREDBY = 'authoredby',
}
/**
 * Code Values for the Consent.provision.type field
 */
export enum ConsentProvisionTypeCodes {
  DENY = 'deny',
  PERMIT = 'permit',
}
/**
 * Code Values for the Consent.status field
 */
export enum ConsentStatusCodes {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Contract.contentDefinition.publicationStatus field
 */
export enum ContractContentDefinitionPublicationStatusCodes {
  AMENDED = 'amended',
  APPENDED = 'appended',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  ENTERED_IN_ERROR = 'entered-in-error',
  EXECUTABLE = 'executable',
  EXECUTED = 'executed',
  NEGOTIABLE = 'negotiable',
  OFFERED = 'offered',
  POLICY = 'policy',
  REJECTED = 'rejected',
  RENEWED = 'renewed',
  REVOKED = 'revoked',
  RESOLVED = 'resolved',
  TERMINATED = 'terminated',
}
/**
 * Code Values for the Contract.status field
 */
export enum ContractStatusCodes {
  AMENDED = 'amended',
  APPENDED = 'appended',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  ENTERED_IN_ERROR = 'entered-in-error',
  EXECUTABLE = 'executable',
  EXECUTED = 'executed',
  NEGOTIABLE = 'negotiable',
  OFFERED = 'offered',
  POLICY = 'policy',
  REJECTED = 'rejected',
  RENEWED = 'renewed',
  REVOKED = 'revoked',
  RESOLVED = 'resolved',
  TERMINATED = 'terminated',
}
/**
 * Code Values for the Coverage.status field
 */
export enum CoverageStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the CoverageEligibilityRequest.purpose field
 */
export enum CoverageEligibilityRequestPurposeCodes {
  AUTH_REQUIREMENTS = 'auth-requirements',
  BENEFITS = 'benefits',
  DISCOVERY = 'discovery',
  VALIDATION = 'validation',
}
/**
 * Code Values for the CoverageEligibilityRequest.status field
 */
export enum CoverageEligibilityRequestStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the CoverageEligibilityResponse.outcome field
 */
export enum CoverageEligibilityResponseOutcomeCodes {
  QUEUED = 'queued',
  COMPLETE = 'complete',
  ERROR = 'error',
  PARTIAL = 'partial',
}
/**
 * Code Values for the CoverageEligibilityResponse.purpose field
 */
export enum CoverageEligibilityResponsePurposeCodes {
  AUTH_REQUIREMENTS = 'auth-requirements',
  BENEFITS = 'benefits',
  DISCOVERY = 'discovery',
  VALIDATION = 'validation',
}
/**
 * Code Values for the CoverageEligibilityResponse.status field
 */
export enum CoverageEligibilityResponseStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the DetectedIssue.severity field
 */
export enum DetectedIssueSeverityCodes {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}
/**
 * Code Values for the DetectedIssue.status field
 */
export enum DetectedIssueStatusCodes {
  REGISTERED = 'registered',
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
}
/**
 * Code Values for the Device.udiCarrier.entryType field
 */
export enum DeviceUdiCarrierEntryTypeCodes {
  BARCODE = 'barcode',
  RFID = 'rfid',
  MANUAL = 'manual',
}
/**
 * Code Values for the Device.deviceName.type field
 */
export enum DeviceDeviceNameTypeCodes {
  UDI_LABEL_NAME = 'udi-label-name',
  USER_FRIENDLY_NAME = 'user-friendly-name',
  PATIENT_REPORTED_NAME = 'patient-reported-name',
  MANUFACTURER_NAME = 'manufacturer-name',
  MODEL_NAME = 'model-name',
  OTHER = 'other',
}
/**
 * Code Values for the Device.status field
 */
export enum DeviceStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the DeviceDefinition.deviceName.type field
 */
export enum DeviceDefinitionDeviceNameTypeCodes {
  UDI_LABEL_NAME = 'udi-label-name',
  USER_FRIENDLY_NAME = 'user-friendly-name',
  PATIENT_REPORTED_NAME = 'patient-reported-name',
  MANUFACTURER_NAME = 'manufacturer-name',
  MODEL_NAME = 'model-name',
  OTHER = 'other',
}
/**
 * Code Values for the DeviceMetric.calibration.state field
 */
export enum DeviceMetricCalibrationStateCodes {
  NOT_CALIBRATED = 'not-calibrated',
  CALIBRATION_REQUIRED = 'calibration-required',
  CALIBRATED = 'calibrated',
  UNSPECIFIED = 'unspecified',
}
/**
 * Code Values for the DeviceMetric.calibration.type field
 */
export enum DeviceMetricCalibrationTypeCodes {
  UNSPECIFIED = 'unspecified',
  OFFSET = 'offset',
  GAIN = 'gain',
  TWO_POINT = 'two-point',
}
/**
 * Code Values for the DeviceMetric.category field
 */
export enum DeviceMetricCategoryCodes {
  MEASUREMENT = 'measurement',
  SETTING = 'setting',
  CALCULATION = 'calculation',
  UNSPECIFIED = 'unspecified',
}
/**
 * Code Values for the DeviceMetric.color field
 */
export enum DeviceMetricColorCodes {
  BLACK = 'black',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  BLUE = 'blue',
  MAGENTA = 'magenta',
  CYAN = 'cyan',
  WHITE = 'white',
}
/**
 * Code Values for the DeviceMetric.operationalStatus field
 */
export enum DeviceMetricOperationalStatusCodes {
  ON = 'on',
  OFF = 'off',
  STANDBY = 'standby',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the DeviceRequest.intent field
 */
export enum DeviceRequestIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the DeviceRequest.priority field
 */
export enum DeviceRequestPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the DeviceRequest.status field
 */
export enum DeviceRequestStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the DeviceUseStatement.status field
 */
export enum DeviceUseStatementStatusCodes {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the DiagnosticReport.status field
 */
export enum DiagnosticReportStatusCodes {
  REGISTERED = 'registered',
  PARTIAL = 'partial',
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
}
/**
 * Code Values for the DocumentManifest.status field
 */
export enum DocumentManifestStatusCodes {
  CURRENT = 'current',
  SUPERSEDED = 'superseded',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the DocumentReference.relatesTo.code field
 */
export enum DocumentReferenceRelatesToCodeCodes {
  REPLACES = 'replaces',
  TRANSFORMS = 'transforms',
  SIGNS = 'signs',
  APPENDS = 'appends',
}
/**
 * Code Values for the DocumentReference.docStatus field
 */
export enum DocumentReferenceDocStatusCodes {
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the DocumentReference.status field
 */
export enum DocumentReferenceStatusCodes {
  CURRENT = 'current',
  SUPERSEDED = 'superseded',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the EffectEvidenceSynthesis.resultsByExposure.exposureState field
 */
export enum EffectEvidenceSynthesisResultsByExposureExposureStateCodes {
  EXPOSURE = 'exposure',
  EXPOSURE_ALTERNATIVE = 'exposure-alternative',
}
/**
 * Code Values for the EffectEvidenceSynthesis.status field
 */
export enum EffectEvidenceSynthesisStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Encounter.statusHistory.status field
 */
export enum EncounterStatusHistoryStatusCodes {
  PLANNED = 'planned',
  ARRIVED = 'arrived',
  TRIAGED = 'triaged',
  IN_PROGRESS = 'in-progress',
  ONLEAVE = 'onleave',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
/**
 * Code Values for the Encounter.location.status field
 */
export enum EncounterLocationStatusCodes {
  PLANNED = 'planned',
  ACTIVE = 'active',
  RESERVED = 'reserved',
  COMPLETED = 'completed',
}
/**
 * Code Values for the Encounter.status field
 */
export enum EncounterStatusCodes {
  PLANNED = 'planned',
  ARRIVED = 'arrived',
  TRIAGED = 'triaged',
  IN_PROGRESS = 'in-progress',
  ONLEAVE = 'onleave',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}
/**
 * Code Values for the Endpoint.status field
 */
export enum EndpointStatusCodes {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ERROR = 'error',
  OFF = 'off',
  ENTERED_IN_ERROR = 'entered-in-error',
  TEST = 'test',
}
/**
 * Code Values for the EnrollmentRequest.status field
 */
export enum EnrollmentRequestStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the EnrollmentResponse.outcome field
 */
export enum EnrollmentResponseOutcomeCodes {
  QUEUED = 'queued',
  COMPLETE = 'complete',
  ERROR = 'error',
  PARTIAL = 'partial',
}
/**
 * Code Values for the EnrollmentResponse.status field
 */
export enum EnrollmentResponseStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the EpisodeOfCare.statusHistory.status field
 */
export enum EpisodeOfCareStatusHistoryStatusCodes {
  PLANNED = 'planned',
  WAITLIST = 'waitlist',
  ACTIVE = 'active',
  ONHOLD = 'onhold',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the EpisodeOfCare.status field
 */
export enum EpisodeOfCareStatusCodes {
  PLANNED = 'planned',
  WAITLIST = 'waitlist',
  ACTIVE = 'active',
  ONHOLD = 'onhold',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the EventDefinition.status field
 */
export enum EventDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Evidence.status field
 */
export enum EvidenceStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum EvidenceVariableCharacteristicGroupMeasureCodes {
  MEAN = 'mean',
  MEDIAN = 'median',
  MEAN_OF_MEAN = 'mean-of-mean',
  MEAN_OF_MEDIAN = 'mean-of-median',
  MEDIAN_OF_MEAN = 'median-of-mean',
  MEDIAN_OF_MEDIAN = 'median-of-median',
}
export enum EvidenceVariableStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the EvidenceVariable.type field
 */
export enum EvidenceVariableTypeCodes {
  DICHOTOMOUS = 'dichotomous',
  CONTINUOUS = 'continuous',
  DESCRIPTIVE = 'descriptive',
}
/**
 * Code Values for the ExampleScenario.actor.type field
 */
export enum ExampleScenarioActorTypeCodes {
  PERSON = 'person',
  ENTITY = 'entity',
}
/**
 * Code Values for the ExampleScenario.status field
 */
export enum ExampleScenarioStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum ExplanationOfBenefitProcessNoteTypeCodes {
  DISPLAY = 'display',
  PRINT = 'print',
  PRINTOPER = 'printoper',
}
/**
 * Code Values for the ExplanationOfBenefit.outcome field
 */
export enum ExplanationOfBenefitOutcomeCodes {
  QUEUED = 'queued',
  COMPLETE = 'complete',
  ERROR = 'error',
  PARTIAL = 'partial',
}
/**
 * Code Values for the ExplanationOfBenefit.status field
 */
export enum ExplanationOfBenefitStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the ExplanationOfBenefit.use field
 */
export enum ExplanationOfBenefitUseCodes {
  CLAIM = 'claim',
  PREAUTHORIZATION = 'preauthorization',
  PREDETERMINATION = 'predetermination',
}
export enum FamilyMemberHistoryStatusCodes {
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  HEALTH_UNKNOWN = 'health-unknown',
}
/**
 * Code Values for the Flag.status field
 */
export enum FlagStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Goal.lifecycleStatus field
 */
export enum GoalLifecycleStatusCodes {
  PROPOSED = 'proposed',
  PLANNED = 'planned',
  ACCEPTED = 'accepted',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
  REJECTED = 'rejected',
}
/**
 * Code Values for the GraphDefinition.link.target.compartment.code field
 */
export enum GraphDefinitionLinkTargetCompartmentCodeCodes {
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  RELATEDPERSON = 'RelatedPerson',
  PRACTITIONER = 'Practitioner',
  DEVICE = 'Device',
}
/**
 * Code Values for the GraphDefinition.link.target.compartment.rule field
 */
export enum GraphDefinitionLinkTargetCompartmentRuleCodes {
  IDENTICAL = 'identical',
  MATCHING = 'matching',
  DIFFERENT = 'different',
  CUSTOM = 'custom',
}
/**
 * Code Values for the GraphDefinition.link.target.compartment.use field
 */
export enum GraphDefinitionLinkTargetCompartmentUseCodes {
  CONDITION = 'condition',
  REQUIREMENT = 'requirement',
}
/**
 * Code Values for the GraphDefinition.status field
 */
export enum GraphDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Group.type field
 */
export enum GroupTypeCodes {
  PERSON = 'person',
  ANIMAL = 'animal',
  PRACTITIONER = 'practitioner',
  DEVICE = 'device',
  MEDICATION = 'medication',
  SUBSTANCE = 'substance',
}
/**
 * Code Values for the GuidanceResponse.status field
 */
export enum GuidanceResponseStatusCodes {
  SUCCESS = 'success',
  DATA_REQUESTED = 'data-requested',
  DATA_REQUIRED = 'data-required',
  IN_PROGRESS = 'in-progress',
  FAILURE = 'failure',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the HealthcareService.availableTime.daysOfWeek field
 */
export enum HealthcareServiceAvailableTimeDaysOfWeekCodes {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}
/**
 * Code Values for the ImagingStudy.status field
 */
export enum ImagingStudyStatusCodes {
  REGISTERED = 'registered',
  AVAILABLE = 'available',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Immunization.status field
 */
export enum ImmunizationStatusCodes {
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  NOT_DONE = 'not-done',
}
/**
 * Code Values for the ImmunizationEvaluation.status field
 */
export enum ImmunizationEvaluationStatusCodes {
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the ImplementationGuide.definition.page.generation field
 */
export enum ImplementationGuideDefinitionPageGenerationCodes {
  HTML = 'html',
  MARKDOWN = 'markdown',
  XML = 'xml',
  GENERATED = 'generated',
}
/**
 * Code Values for the ImplementationGuide.definition.parameter.code field
 */
export enum ImplementationGuideDefinitionParameterCodeCodes {
  APPLY = 'apply',
  PATH_RESOURCE = 'path-resource',
  PATH_PAGES = 'path-pages',
  PATH_TX_CACHE = 'path-tx-cache',
  EXPANSION_PARAMETER = 'expansion-parameter',
  RULE_BROKEN_LINKS = 'rule-broken-links',
  GENERATE_XML = 'generate-xml',
  GENERATE_JSON = 'generate-json',
  GENERATE_TURTLE = 'generate-turtle',
  HTML_TEMPLATE = 'html-template',
}
/**
 * Code Values for the ImplementationGuide.status field
 */
export enum ImplementationGuideStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the InsurancePlan.status field
 */
export enum InsurancePlanStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Invoice.lineItem.priceComponent.type field
 */
export enum InvoiceLineItemPriceComponentTypeCodes {
  BASE = 'base',
  SURCHARGE = 'surcharge',
  DEDUCTION = 'deduction',
  DISCOUNT = 'discount',
  TAX = 'tax',
  INFORMATIONAL = 'informational',
}
/**
 * Code Values for the Invoice.status field
 */
export enum InvoiceStatusCodes {
  DRAFT = 'draft',
  ISSUED = 'issued',
  BALANCED = 'balanced',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Library.status field
 */
export enum LibraryStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Linkage.item.type field
 */
export enum LinkageItemTypeCodes {
  SOURCE = 'source',
  ALTERNATE = 'alternate',
  HISTORICAL = 'historical',
}
/**
 * Code Values for the List.mode field
 */
export enum ListModeCodes {
  WORKING = 'working',
  SNAPSHOT = 'snapshot',
  CHANGES = 'changes',
}
/**
 * Code Values for the List.status field
 */
export enum ListStatusCodes {
  CURRENT = 'current',
  RETIRED = 'retired',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Location.hoursOfOperation.daysOfWeek field
 */
export enum LocationHoursOfOperationDaysOfWeekCodes {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}
/**
 * Code Values for the Location.mode field
 */
export enum LocationModeCodes {
  INSTANCE = 'instance',
  KIND = 'kind',
}
/**
 * Code Values for the Location.status field
 */
export enum LocationStatusCodes {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}
/**
 * Code Values for the Measure.status field
 */
export enum MeasureStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the MeasureReport.status field
 */
export enum MeasureReportStatusCodes {
  COMPLETE = 'complete',
  PENDING = 'pending',
  ERROR = 'error',
}
/**
 * Code Values for the MeasureReport.type field
 */
export enum MeasureReportTypeCodes {
  INDIVIDUAL = 'individual',
  SUBJECT_LIST = 'subject-list',
  SUMMARY = 'summary',
  DATA_COLLECTION = 'data-collection',
}
/**
 * Code Values for the Media.status field
 */
export enum MediaStatusCodes {
  PREPARATION = 'preparation',
  IN_PROGRESS = 'in-progress',
  NOT_DONE = 'not-done',
  ON_HOLD = 'on-hold',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Medication.status field
 */
export enum MedicationStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the MedicationAdministration.status field
 */
export enum MedicationAdministrationStatusCodes {
  IN_PROGRESS = 'in-progress',
  NOT_DONE = 'not-done',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  STOPPED = 'stopped',
  UNKNOWN = 'unknown',
}
export enum MedicationDispenseStatusCodes {
  PREPARATION = 'preparation',
  IN_PROGRESS = 'in-progress',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  STOPPED = 'stopped',
  DECLINED = 'declined',
  UNKNOWN = 'unknown',
}
export enum MedicationKnowledgeStatusCodes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the MedicationRequest.intent field
 */
export enum MedicationRequestIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the MedicationRequest.priority field
 */
export enum MedicationRequestPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the MedicationRequest.status field
 */
export enum MedicationRequestStatusCodes {
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  STOPPED = 'stopped',
  DRAFT = 'draft',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the MedicationStatement.status field
 */
export enum MedicationStatementStatusCodes {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  INTENDED = 'intended',
  STOPPED = 'stopped',
  ON_HOLD = 'on-hold',
  UNKNOWN = 'unknown',
  NOT_TAKEN = 'not-taken',
}
/**
 * Code Values for the MessageDefinition.category field
 */
export enum MessageDefinitionCategoryCodes {
  CONSEQUENCE = 'consequence',
  CURRENCY = 'currency',
  NOTIFICATION = 'notification',
}
/**
 * Code Values for the MessageDefinition.responseRequired field
 */
export enum MessageDefinitionResponseRequiredCodes {
  ALWAYS = 'always',
  ON_ERROR = 'on-error',
  NEVER = 'never',
  ON_SUCCESS = 'on-success',
}
/**
 * Code Values for the MessageDefinition.status field
 */
export enum MessageDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the MessageHeader.response.code field
 */
export enum MessageHeaderResponseCodeCodes {
  OK = 'ok',
  TRANSIENT_ERROR = 'transient-error',
  FATAL_ERROR = 'fatal-error',
}
/**
 * Code Values for the MolecularSequence.referenceSeq.orientation field
 */
export enum MolecularSequenceReferenceSeqOrientationCodes {
  SENSE = 'sense',
  ANTISENSE = 'antisense',
}
/**
 * Code Values for the MolecularSequence.referenceSeq.strand field
 */
export enum MolecularSequenceReferenceSeqStrandCodes {
  WATSON = 'watson',
  CRICK = 'crick',
}
/**
 * Code Values for the MolecularSequence.quality.type field
 */
export enum MolecularSequenceQualityTypeCodes {
  INDEL = 'indel',
  SNP = 'snp',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the MolecularSequence.repository.type field
 */
export enum MolecularSequenceRepositoryTypeCodes {
  DIRECTLINK = 'directlink',
  OPENAPI = 'openapi',
  LOGIN = 'login',
  OAUTH = 'oauth',
  OTHER = 'other',
}
/**
 * Code Values for the MolecularSequence.type field
 */
export enum MolecularSequenceTypeCodes {
  AA = 'aa',
  DNA = 'dna',
  RNA = 'rna',
}
/**
 * Code Values for the NamingSystem.uniqueId.type field
 */
export enum NamingSystemUniqueIdTypeCodes {
  OID = 'oid',
  UUID = 'uuid',
  URI = 'uri',
  OTHER = 'other',
}
/**
 * Code Values for the NamingSystem.kind field
 */
export enum NamingSystemKindCodes {
  CODESYSTEM = 'codesystem',
  IDENTIFIER = 'identifier',
  ROOT = 'root',
}
/**
 * Code Values for the NamingSystem.status field
 */
export enum NamingSystemStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the NutritionOrder.intent field
 */
export enum NutritionOrderIntentCodes {
  PROPOSAL = 'proposal',
  PLAN = 'plan',
  DIRECTIVE = 'directive',
  ORDER = 'order',
  ORIGINAL_ORDER = 'original-order',
  REFLEX_ORDER = 'reflex-order',
  FILLER_ORDER = 'filler-order',
  INSTANCE_ORDER = 'instance-order',
  OPTION = 'option',
}
/**
 * Code Values for the NutritionOrder.status field
 */
export enum NutritionOrderStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  REVOKED = 'revoked',
  COMPLETED = 'completed',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Observation.status field
 */
export enum ObservationStatusCodes {
  REGISTERED = 'registered',
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
}
/**
 * Code Values for the ObservationDefinition.qualifiedInterval.category field
 */
export enum ObservationDefinitionQualifiedIntervalCategoryCodes {
  REFERENCE = 'reference',
  CRITICAL = 'critical',
  ABSOLUTE = 'absolute',
}
/**
 * Code Values for the ObservationDefinition.qualifiedInterval.gender field
 */
export enum ObservationDefinitionQualifiedIntervalGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the ObservationDefinition.permittedDataType field
 */
export enum ObservationDefinitionPermittedDataTypeCodes {
  QUANTITY = 'Quantity',
  CODEABLECONCEPT = 'CodeableConcept',
  STRING = 'string',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  RANGE = 'Range',
  RATIO = 'Ratio',
  SAMPLEDDATA = 'SampledData',
  TIME = 'time',
  DATETIME = 'dateTime',
  PERIOD = 'Period',
}
/**
 * Code Values for the OperationDefinition.parameter.binding.strength field
 */
export enum OperationDefinitionParameterBindingStrengthCodes {
  REQUIRED = 'required',
  EXTENSIBLE = 'extensible',
  PREFERRED = 'preferred',
  EXAMPLE = 'example',
}
/**
 * Code Values for the OperationDefinition.parameter.searchType field
 */
export enum OperationDefinitionParameterSearchTypeCodes {
  NUMBER = 'number',
  DATE = 'date',
  STRING = 'string',
  TOKEN = 'token',
  REFERENCE = 'reference',
  COMPOSITE = 'composite',
  QUANTITY = 'quantity',
  URI = 'uri',
  SPECIAL = 'special',
}
/**
 * Code Values for the OperationDefinition.parameter.use field
 */
export enum OperationDefinitionParameterUseCodes {
  IN = 'in',
  OUT = 'out',
}
/**
 * Code Values for the OperationDefinition.kind field
 */
export enum OperationDefinitionKindCodes {
  OPERATION = 'operation',
  QUERY = 'query',
}
/**
 * Code Values for the OperationDefinition.status field
 */
export enum OperationDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the OperationOutcome.issue.severity field
 */
export enum OperationOutcomeIssueSeverityCodes {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFORMATION = 'information',
}
/**
 * Code Values for the Patient.contact.gender field
 */
export enum PatientContactGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the Patient.link.type field
 */
export enum PatientLinkTypeCodes {
  REPLACED_BY = 'replaced-by',
  REPLACES = 'replaces',
  REFER = 'refer',
  SEEALSO = 'seealso',
}
/**
 * Code Values for the Patient.gender field
 */
export enum PatientGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the PaymentNotice.status field
 */
export enum PaymentNoticeStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the PaymentReconciliation.processNote.type field
 */
export enum PaymentReconciliationProcessNoteTypeCodes {
  DISPLAY = 'display',
  PRINT = 'print',
  PRINTOPER = 'printoper',
}
/**
 * Code Values for the PaymentReconciliation.outcome field
 */
export enum PaymentReconciliationOutcomeCodes {
  QUEUED = 'queued',
  COMPLETE = 'complete',
  ERROR = 'error',
  PARTIAL = 'partial',
}
/**
 * Code Values for the PaymentReconciliation.status field
 */
export enum PaymentReconciliationStatusCodes {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  ENTERED_IN_ERROR = 'entered-in-error',
}
/**
 * Code Values for the Person.link.assurance field
 */
export enum PersonLinkAssuranceCodes {
  LEVEL1 = 'level1',
  LEVEL2 = 'level2',
  LEVEL3 = 'level3',
  LEVEL4 = 'level4',
}
/**
 * Code Values for the Person.gender field
 */
export enum PersonGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the PlanDefinition.action.condition.kind field
 */
export enum PlanDefinitionActionConditionKindCodes {
  APPLICABILITY = 'applicability',
  START = 'start',
  STOP = 'stop',
}
/**
 * Code Values for the PlanDefinition.action.relatedAction.relationship field
 */
export enum PlanDefinitionActionRelatedActionRelationshipCodes {
  BEFORE_START = 'before-start',
  BEFORE = 'before',
  BEFORE_END = 'before-end',
  CONCURRENT_WITH_START = 'concurrent-with-start',
  CONCURRENT = 'concurrent',
  CONCURRENT_WITH_END = 'concurrent-with-end',
  AFTER_START = 'after-start',
  AFTER = 'after',
  AFTER_END = 'after-end',
}
/**
 * Code Values for the PlanDefinition.action.participant.type field
 */
export enum PlanDefinitionActionParticipantTypeCodes {
  PATIENT = 'patient',
  PRACTITIONER = 'practitioner',
  RELATED_PERSON = 'related-person',
  DEVICE = 'device',
}
/**
 * Code Values for the PlanDefinition.action.cardinalityBehavior field
 */
export enum PlanDefinitionActionCardinalityBehaviorCodes {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}
/**
 * Code Values for the PlanDefinition.action.groupingBehavior field
 */
export enum PlanDefinitionActionGroupingBehaviorCodes {
  VISUAL_GROUP = 'visual-group',
  LOGICAL_GROUP = 'logical-group',
  SENTENCE_GROUP = 'sentence-group',
}
/**
 * Code Values for the PlanDefinition.action.precheckBehavior field
 */
export enum PlanDefinitionActionPrecheckBehaviorCodes {
  YES = 'yes',
  NO = 'no',
}
/**
 * Code Values for the PlanDefinition.action.priority field
 */
export enum PlanDefinitionActionPriorityCodes {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}
/**
 * Code Values for the PlanDefinition.action.requiredBehavior field
 */
export enum PlanDefinitionActionRequiredBehaviorCodes {
  MUST = 'must',
  COULD = 'could',
  MUST_UNLESS_DOCUMENTED = 'must-unless-documented',
}
/**
 * Code Values for the PlanDefinition.action.selectionBehavior field
 */
export enum PlanDefinitionActionSelectionBehaviorCodes {
  ANY = 'any',
  ALL = 'all',
  ALL_OR_NONE = 'all-or-none',
  EXACTLY_ONE = 'exactly-one',
  AT_MOST_ONE = 'at-most-one',
  ONE_OR_MORE = 'one-or-more',
}
/**
 * Code Values for the PlanDefinition.status field
 */
export enum PlanDefinitionStatusCodes {
  DRAFT = 'draft',
  ACTIVE = 'active',
  RETIRED = 'retired',
  UNKNOWN = 'unknown',
}
export enum PractitionerGenderCodes {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}
/**
 * Code Values for the PractitionerRole.availableTime.daysOfWeek field
 */
export enum PractitionerRoleAvailableTimeDaysOfWeekCodes {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}
