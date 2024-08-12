import { IActionRequester } from '../util/actionRequester';
import { IQuestionnaireInspector } from '../util/questionnaireInspector';
import { Resources } from '../util/resources';
import { AutoSuggestProps } from './autoSuggestProps';
import { QuestionnaireResponse, Attachment, Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';
import { OrgenhetHierarki } from './orgenhetHierarki';
import { ValidationSummaryPlacement } from './formTypes/validationSummaryPlacement';
import { Store } from 'redux';
import { GlobalState } from '@/reducers';
import { NewValueAction } from '@/actions/newValue';

export interface ReferoProps {
  store?: Store<GlobalState, NewValueAction>; //TODO: remove?
  authorized: boolean; //TODO: add to correct place
  blockSubmit?: boolean;
  onSave?: (questionnaireResponse: QuestionnaireResponse) => void;
  onCancel?: () => void;
  onSubmit: (questionnaireResponse: QuestionnaireResponse) => void;
  loginButton: JSX.Element; //TODO: add to correct place or remove
  resources?: Resources;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  attachmentErrorMessage?: string; //TODO: add to context
  attachmentMaxFileSize?: number; //TODO: add to context
  attachmentValidTypes?: string[]; //TODO: add to context
  onRequestAttachmentLink?: (fileId: string) => string; //TODO: add to context
  onOpenAttachment?: (fileId: string) => void; //TODO: add to context
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void; //TODO: add to context
  uploadAttachment?: (files: File[], onSuccess: (attachment: Attachment) => void) => void; //TODO: add to context
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
