import type { AutoSuggestProps } from './autoSuggestProps';
import type { OrgenhetHierarki } from './orgenhetHierarki';
import type { IActionRequester } from '../util/actionRequester';
import type { IQuestionnaireInspector } from '../util/questionnaireInspector';
import type { Resources } from '../util/resources';
import type { ValidationSummaryPlacement } from './formTypes/validationSummaryPlacement';
import type { TextMessage } from './text-message';
import type { PresentationButtonsType } from '@/constants/presentationButtonsType';
import type { DefaultValues } from '@/validation/defaultFormValues';
import type {
  QuestionnaireResponse,
  Attachment,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  ValueSet,
} from 'fhir/r4';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import type { Store } from 'redux';

import type { MimeTypes, UploadFile } from '@helsenorge/file-upload/components/file-upload';

export type FormViewChange = (refElement: HTMLElement, stepIndex?: number) => void;

export interface RenderCustomButtonsArgs {
  /**
   * The full set of props passed into the Refero component instance.
   * Users can access all configuration details, including:
   * - `referoProps.authorized`: Whether the form is in an authorized state.
   * - `referoProps.resources`: Text resources for labels, messages, etc.
   * - `referoProps.onSubmit`, `referoProps.onCancel`, `referoProps.onSave`: Callback handlers for form actions.
   * - `referoProps.submitButtonDisabled`, `referoProps.saveButtonDisabled`: Flags to determine disabled states of buttons.
   * - ...and more.
   *
   * By having access to the entire props object, consumers can easily
   * tailor the UI and logic of their custom buttons to match the current
   * configuration of the Refero component without needing separate parameters.
   */
  referoProps: ReferoProps;

  /**
   * Indicates if the form is currently presented as a multi-step (wizard-like) form.
   * When `true`, you may want to render navigation buttons (e.g. next/previous steps).
   */
  isStepView: boolean;

  /**
   * When `true`, the UI indicates that a "Next" step button should be displayed.
   * This is typically relevant when `isStepView` is `true` and the user is not on the last step.
   */
  displayNextButton?: boolean;

  /**
   * When `true`, the UI indicates that a "Previous" step button should be displayed.
   * This is typically relevant when `isStepView` is `true` and the user is not on the first step.
   */
  displayPreviousButton?: boolean;

  /**
   * A callback that advances the form to the next step in a multi-step scenario.
   * Only provided if `isStepView` is `true` and there is a subsequent step.
   */
  nextStep?: () => void;

  /**
   * A callback that returns the form to the previous step in a multi-step scenario.
   * Only provided if `isStepView` is `true` and there is a previous step.
   */
  previousStep?: () => void;

  /**
   * The `react-hook-form` methods returned by the `useForm` hook.
   * This object includes helpful utilities for controlling form state, handling
   * submission, validation, and accessing the current values of form fields.
   *
   * Use `reactHookFormMethods.handleSubmit`, `reactHookFormMethods.setValue`,
   * `reactHookFormMethods.getValues`, etc., to implement custom button behaviors
   * that interact directly with the underlying form state.
   */
  reactHookFormMethods: UseFormReturn<DefaultValues, unknown, DefaultValues>;
  presentationButtonsType: PresentationButtonsType | null;
  /*
   * Sets the new step index when in step view.
   */
  setNewStepIndex?: (newIndex: number) => void;
}

export interface ReferoProps {
  /**
   * A Redux store instance, not used by this component anymore.
   * **@deprecated** This prop will be removed in a future version.
   */
  store?: Store;

  /**
   * Indicates if the user is authorized. When `true`, the form is fully interactive
   * (submit/save enabled). When `false`, the user is prompted to log in upon attempting to fill out fields.
   */
  authorized: boolean;

  /**
   * If `true`, this disables submitting the form. Useful for blocking submission until certain conditions are met.
   * Default: `false`
   */
  blockSubmit?: boolean;

  /**
   * Callback invoked when the user requests saving the form.
   * Receives the current `QuestionnaireResponse` state as argument.
   */
  onSave?: (questionnaireResponse: QuestionnaireResponse) => void;

  /**
   * Callback invoked when the user requests cancelling the form.
   */
  onCancel?: () => void;

  /**
   * Callback invoked when the user submits the form.
   * Receives the current `QuestionnaireResponse` state as argument.
   */
  onSubmit: (questionnaireResponse: QuestionnaireResponse) => void;

  /**
   * JSX element representing the login button displayed when `authorized` is `false`.
   */
  loginButton: JSX.Element;

  /**
   * Resource texts used in the form (labels, messages, placeholders, etc.).
   */
  resources?: Resources;

  /**
   * If `true`, renders the form in a PDF-friendly, read-only mode without interactive input controls.
   * Default: `false`
   */
  pdf?: boolean;

  /**
   * Callback invoked when the form needs to prompt the user to log in (e.g., when `authorized` is `false` and user attempts to interact).
   */
  promptLoginMessage?: () => void;

  /**
   * Custom error message to show when attachment validation fails.
   */
  attachmentErrorMessage?: string;

  /**
   * Maximum allowed file size (in bytes) for uploads. Defaults to 25MB if not specified.
   */
  attachmentMaxFileSize?: number;
  /**
   * Maximum allowed file size per file (in bytes) for uploads. Defaults to 20MB if not specified.
   */
  attachmentMaxFileSizePerFile?: number;
  /**
   * A list of allowed mime types for file uploads. Defaults to image/jpeg, image/png, application/pdf.
   */
  attachmentValidTypes?: MimeTypes[];

  /**
   * Callback for generating a URL used in `<a href>` links for attachments.
   * Receives the `fileId` and should return a string URL.
   */
  onRequestAttachmentLink?: (fileId: string) => string;

  /**
   * Callback invoked when the user requests to open an attachment.
   * Receives the `fileId` of the attachment.
   */
  onOpenAttachment?: (fileId: string) => void;

  /**
   * Callback invoked when the user requests deleting an attachment.
   * Receives the `fileId` and two callbacks: `onSuccess` to indicate success and `onError` to report errors.
   */
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errormessage: TextMessage | null) => void) => void;

  /**
   * Callback invoked when the user uploads attachments.
   * Receives an array of `UploadFile`s and `onSuccess`/`onError` callbacks to report the upload result.
   */
  uploadAttachment?: (
    files: UploadFile[],
    onSuccess: (attachment: Attachment) => void,
    onError: (errormessage: TextMessage | null) => void
  ) => void;

  /**
   * A FHIR `Questionnaire` object representing the form definition.
   * If omitted, the component may behave differently or may not render form items.
   */
  questionnaire?: Questionnaire;

  /**
   * A FHIR `QuestionnaireResponse` object representing the current state of user input.
   * If omitted, an empty response object is created and managed internally.
   */
  questionnaireResponse?: QuestionnaireResponse;

  /**
   * Which locale is used for date-related components (only 'en-gb' and 'nb-no' are supported).
   */
  language?: string;

  /**
   * If `true`, the action bar (with save/submit buttons) is fixed ("sticky") to the viewport.
   * Default: `false`
   */
  sticky?: boolean;

  /**
   * If `true`, performs script injection validation for string and text inputs to prevent malicious code injection.
   * Default: `false`
   */
  validateScriptInjection?: boolean;

  /**
   * Controls where in the form the validation summary is displayed.
   * Can be `ValidationSummaryPlacement.Top` or `ValidationSummaryPlacement.Bottom`.
   * Default: `Top`
   */
  validationSummaryPlacement?: ValidationSummaryPlacement;

  /**
   * Callback to render a help button.
   * Provides the `QuestionnaireItem`, corresponding help item, help type, help text, and whether it's opening or closing.
   * Should return a JSX element.
   */
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;

  /**
   * Callback to render a help element (e.g. tooltip or modal).
   * Provides the `QuestionnaireItem`, corresponding help item, help type, help text, and whether it's opening or closing.
   * Should return a JSX element.
   */
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;

  /**
   * Callback invoked when the user changes an answer.
   * Receives the `QuestionnaireItem`, the `QuestionnaireResponseItemAnswer`,
   * and utilities (`IActionRequester` and `IQuestionnaireInspector`) to programmatically update or inspect the response.
   */
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;

  /**
   * Callback for rendering markdown content.
   * Receives the `QuestionnaireItem` and the raw markdown string, should return a sanitized HTML string.
   */
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;

  /**
   * If `true`, attempts to synchronize the `QuestionnaireResponse` with the `Questionnaire` when discrepancies are found,
   * e.g., missing items in the response or outdated linkIds.
   * Default: `false`
   */
  syncQuestionnaireResponse?: boolean;

  /**
   * Callback for fetching data for an autosuggest field.
   * Called with the search string, the relevant `QuestionnaireItem`, and `successCallback`/`errorCallback` to return results or errors.
   */
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;

  /**
   * Configuration for autosuggest behavior.
   * `minSearchCharacters`: minimum number of characters typed before triggering a search. Default: 0
   * `typingSearchDelay`: delay in ms after user stops typing before search. Default: 500
   */
  autoSuggestProps?: AutoSuggestProps;

  /**
   * If `true`, disables the submit button. Useful for conditionally preventing submission.
   * Default: `false`
   */
  submitButtonDisabled?: boolean;

  /**
   * If `true`, disables the save button. Useful for conditionally preventing saves.
   * Default: `false`
   */
  saveButtonDisabled?: boolean;

  /**
   * Callback for fetching receivers (organizational units) data.
   * Call `successCallback` with the list of `OrgenhetHierarki` or `errorCallback` if data fails to load.
   */
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;

  /**
   * Callback invoked when required fields are not filled out or fields contain invalid data.
   * Can be used to alert users or track validation issues.
   */
  onFieldsNotCorrectlyFilledOut?: () => void;

  /**
   * Callback invoked when the current step in a step-based form changes.
   * Receives the new step index as `newIndex`.
   */
  onStepChange?: (newIndex: number) => void;

  /**
   * Additional options passed to `react-hook-form`'s `useForm` hook.
   * This can be used to configure validation modes or default values at initialization.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFormProps?: UseFormProps<{ [x: string]: any }, any>;

  /**
   * If `true`, hides the validation summary. Useful for custom validation handling.
   */
  hideValidationSummary?: boolean;

  /**
   * A callback function that allows consumers to render their own custom buttons, overriding the default FormButtons.
   * If this prop is defined, the returned JSX element will be displayed instead of the default buttons.
   */
  renderCustomActionButtons?: (args: RenderCustomButtonsArgs) => JSX.Element;

  /**
   * A callback function that is called when the form is initialized or if the form changes (example: step change).
   * It accepts a ref of the element that wraps the form, and the step index.
   */
  onFormViewChange?: FormViewChange;
}
