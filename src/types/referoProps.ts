import { IActionRequester } from '../util/actionRequester';
import { IQuestionnaireInspector } from '../util/questionnaireInspector';
import { Resources } from '../util/resources';
import { AutoSuggestProps } from './autoSuggestProps';
import { QuestionnaireResponse, Attachment, Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';
import { OrgenhetHierarki } from './orgenhetHierarki';
import { ValidationSummaryPlacement } from './formTypes/validationSummaryPlacement';
import { Store } from 'redux';
import {} from '@/actions/newValue';
import { TextMessage } from './text-message';

export interface ReferoProps {
  /**
   * The store prop is not used and is @deprecated.
   * It will be removed in a future version.
   */
  store?: Store;
  authorized: boolean;
  blockSubmit?: boolean;
  onSave?: (questionnaireResponse: QuestionnaireResponse) => void;
  onCancel?: () => void;
  onSubmit: (questionnaireResponse: QuestionnaireResponse) => void;
  loginButton: JSX.Element;
  resources?: Resources;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: string[];
  onRequestAttachmentLink?: (fileId: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errormessage: TextMessage | null) => void) => void; //TODO: add to context
  uploadAttachment?: (
    files: File[],
    onSuccess: (attachment: Attachment) => void,
    onError: (errormessage: TextMessage | null) => void
  ) => void;
  questionnaire?: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  sticky?: boolean;
  validateScriptInjection?: boolean;
  validationSummaryPlacement?: ValidationSummaryPlacement;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  syncQuestionnaireResponse?: boolean;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  submitButtonDisabled?: boolean;
  saveButtonDisabled?: boolean;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  onFieldsNotCorrectlyFilledOut?: () => void;
  onStepChange?: (newIndex: number) => void;
}
