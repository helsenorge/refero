# @helsenorge/refero

React component that consumes a [FHIR Questionnaire](https://www.hl7.org/fhir/questionnaire.html) object and renders it as a form.

## Dependencies

- [@helsenorge/core-utils](https://www.npmjs.com/package/@helsenorge/core-utils)
- [@helsenorge/file-upload](https://www.npmjs.com/package/@helsenorge/file-upload)
- [@helsenorge/form](https://www.npmjs.com/package/@helsenorge/form)
- [@helsenorge/date-time](https://www.npmjs.com/package/@helsenorge/date-time)
- [@helsenorge/autosuggest](https://www.npmjs.com/package/@helsenorge/autosuggest)
- [@helsenorge/designsystem-react](https://www.npmjs.com/package/@helsenorge/designsystem-react)
- [marked](https://www.npmjs.com/package/marked)
- [moment](https://www.npmjs.com/package/moment)
- [uuid](https://www.npmjs.com/package/uuid)
- [dompurify](https://www.npmjs.com/package/dompurify)
- [immer](https://www.npmjs.com/package/immer)

## Example usage

```tsx
import React from 'react';
import { Store, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from '@helsenorge/refero/reducers';
import { ReferoContainer } from '@helsenorge/refero/components';

let store: Store<{}> = createStore(rootReducer, applyMiddleware(thunk));

class App extends Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <ReferoContainer
          store={store}
          questionnaire={...}
          questionnaireResponse={...}
          resources={...}
          onCancel={...}
          onSave={...}
          onSubmit={...}
          promptLoginMessage={...}
          onRequestAttachmentLink={...}
          onOpenAttachment={...}
          onDeleteAttachment={...}
          uploadAttachment={...}
          loginButton={...}
          authorized
          sticky
          pdf
          onRequestHelpButton={...}
          onRequestHelpElement={...}
          attachmentMaxFileSize={...}
          attachmentValidTypes={...}
          attachmentErrorMessage={...}
          validationSummaryPlacement={...}
          onChange={...}
          onRenderMarkdown={...}
          syncQuestionnaireResponse
          blockSubmit={...}
          language={...}
          validateScriptInjection={...}
          autoSuggestProps={...}
          submitButtonDisabled={...}
          saveButtonDisabled={...}
          fetchValueSet={...}
          fetchReceivers={...}
          onFieldsNotCorrectlyFilledOut={...}
          onStepChange={...}
        />
      </Provider>
    );
```

## Props

| Name                          | Required | Type                       | Default | Description                                                                                                   |
| ----------------------------- | -------- | -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| store                         |          | Store<{}>                  | null    | Redux store                                                                                                   |
| questionnaire                 |          | Questionnaire              | null    | FHIR Questionnaire object                                                                                     |
| questionnaireResponse         |          | QuestionnaireResponse      | null    | FHIR QuestionnaireResponse object                                                                             |
| resources                     |          | Resources                  | null    | Resources object                                                                                              |
| onSubmit                      | true     | callback                   |         | Callback when user submits the form                                                                           |
| onSave                        | true     | callback                   |         | Callback when user saves the form                                                                             |
| onCancel                      | true     | callback                   |         | Callback when user cancels the form                                                                           |
| uploadAttachment              |          | callback                   | null    | Callback when user uploads attachment                                                                         |
| onDeleteAttachment            |          | callback                   | null    | Callback when user deletes attachment                                                                         |
| onOpenAttachment              |          | callback                   | null    | Callback when user opens attachment                                                                           |
| onRequestAttachmentLink       |          | callback                   | null    | Callback when the form needs to render a link to an attachment                                                |
| attachmentMaxFileSize         |          | number                     | 25M     | Max allowed file size for attachments in bytes. Default is 25M                                                |
| attachmentValidTypes          |          | Array<string>              | ...     | List of allowed mime types for attachments. Default allowed types are: image/jpeg, image/png, application/pdf |
| attachmentErrorMessage        |          | string                     | null    | Text shown when file-upload fails to validate                                                                 |
| promptLoginMessage            |          | callback                   | null    | Callback when the form needs to notify the user about authentication                                          |
| loginButton                   | true     | JSX.Element                |         | JSX for when the form needs to render a login button                                                          |
| authorized                    | true     | boolean                    |         | Whether or not the user is authorized/authenticated                                                           |
| pdf                           |          | boolean                    | false   | Renders the form without interactive elements                                                                 |
| sticky                        |          | boolean                    | false   | Whether the actionbar (bar with buttons send/save) should be sticky                                           |
| onRequestHelpButton           |          | callback                   | null    | Callback when the form needs to render a help button                                                          |
| onRequestHelpElement          |          | callback                   | null    | Callback when the form needs to render a help element (help text)                                             |
| validationSummaryPlacement    |          | ValidationSummaryPlacement | null    | Controls the placement of the form validation summary                                                         |
| onChange                      |          | callback                   | null    | Callback when user enters an answer                                                                           |
| onRenderMarkdown              |          | callback                   | null    | Callback when the form needs to render markdown                                                               |
| syncQuestionnaireResponse     |          | boolean                    | false   | Will try to synchronize a Questionnaire and QuestionnaireResponse object                                      |
| fetchValueSet                 |          | callback                   | null    | Callback when an autosuggest field will fetch data                                                            |
| autoSuggestProps              |          | AutoSuggestProps           | null    | Config for when and autosuggest field will call fetchValueSet                                                 |
| blockSubmit                   |          | boolean                    | false   | Whether the form is disabled or not                                                                           |
| language                      |          | string                     | null    | Which locale is used for date related components (only en-gb and nb-no are supported)                         |
| validateScriptInjection       |          | boolean                    | false   | Whether script injection validation should be performed for string and text inputs                            |
| submitButtonDisabled          |          | boolean                    | false   | Whenther the submit button should be disabled or not                                                          |
| saveButtonDisabled            |          | boolean                    | false   | Whenther the save button should be disabled or not                                                            |
| fetchValueSet                 |          | callback                   |         | Callback when user triggers autosuggest fields                                                                |
| fetchReceivers                |          | callback                   |         | Callback when the receiver component is mounted                                                               |
| onFieldsNotCorrectlyFilledOut |          | callback                   |         | Callback when a field is incorrectly filled out                                                               |
| onStepChange                  |          | callback                   |         | Callback when the current step in step-views changes                                                          |


### `questionnaire: Questionnaire`

This is the questionnaire to be rendered. It must be a [`Questionnaire`](https://www.hl7.org/fhir/questionnaire.html) object.

### `questionnaireResponse: QuestionnaireResponse`

This is the object that reflects the users answers. If the property is not specified, an empty
[`QuestionnaireResponse`](https://www.hl7.org/fhir/questionnaireresponse.html) will be generated.

### `resources: Resources`

This object, of type [`Resources`](#Resources), specifies all the different texts the component makes use of.

### `authorized: boolean`

When this property is `true`, the form is rendered as normal, with submit and save buttons. When it is `false` the form is rendered without
submit and save buttons, and while the user is allowed to fill out the form, at the first attempt to do so, a callback to
`promptLoginMessage` is fired.

### `pdf: boolean`

When this property is `true`, the form is rendered in a read-only manner suitable for printing, when `false`, the form is rendered as usual.

### `sticky: boolean`

When this property is `true`, the form renders the actionbar as sticky.

### `attachmentMaxFileSize: number`

Max file size in bytes allowed for attachments. Default is 25M.

### `attachmentValidTypes: Array<string>`

List of allowed mime types for attachments. Default allowed types are image/jpeg, image/png, application/pdf

### `validationSummaryPlacement: ValidationSummaryPlacement`

Controls the placement of the form validation summary. See ['ValidationSummaryPlacement'](#ValidationSummaryPlacement) for possible values.
If not specified, it defaults to ValidationSummaryPlacement.Top

### `syncQuestionnaireResponse: boolean`

Provides limited assistance with synchronizing a Questionnaire and QuestionnaireResponse object. If an item is declared in the
Questionnaire, but is missing from the QuestionnaireResponse, it will try to synthesize an item with any potential children. Likewise, if an
item has been removed from the Questionnaire, it will be removed from the QuestionnaireResponse. It also supports limited help when an item
has changed its type, but only in the case where an answer element is provided in the QuestionnaireResponse item. It does not take any
extension into consideration when creating new items.

In addition it will convert old linkIds for repeated items containing a caret (^) into new linkIds without. Eg. it will transform linkIds of
the form X^Y into just X, by stripping everything from the caret to the end of the linkId.

### `autoSuggestProps: AutoSuggestProps`

Configuration for when autosuggest fields should call `fetchValueSet`. `minSearchCharacters` is the minumum number of letters which must be
typed before `fetchValueSet` will be called. Default value is 0. `typingSearchDelay` is the amount of milliseconds to wait after the user
stop typing before calling `fetchValueSet`. Default value is 500.

## Callback API

### `onSubmit: () => void`

This callback is called when the user requests the current form to be submitted.

### `onSave: () => void`

This callback is called when the user requests the current form to be saved.

### `onCancel: () => void`

This callback is called when the user requests the current form to be cancled.

### `uploadAttachment: (files: File[], onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void, onError: (errorMessage: TextMessage|null)) => void`

This callback is called when the user requests uploading an attachment. The callback is called with the following arguments:

- `files: File[]` An array of [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects to be be uploaded.

- `onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void` Call this callback to indicate success
- `onError: (errormessage: TextMessage|null) => void` Call this callback to indicate error.

### `onDeleteAttachment: (fileId: string, onSuccess: () => void, onError: (errorMessage: TextMessage|null)) => void`

This callback is called when the user requests deleting an attachment. The callback is called with the following arguments:

- `fileId: string` This indicates which file the user is requesting to delete
- `onSuccess: () => void` Call this callback to indicate success.
- `onError: (errormessage: TextMessage|null) => void` Call this callback to indicate error.

### `onOpenAttachment: (fileId: string) => void`

This callback is called when the user requests to open an attachment. The callback is called with the following arguments:

- `fileId: string` This identifies the attachment, as described under `onDeleteAttachment`.

### `onRequestAttachmentLink: (fileId: string) => string`

This callback is called when the form needs to render an `<a href>`-type link. The callback should return a link to the the attachment. The
callback is called with the following arguments:

- `fileId: string` This identifies the attachment, as described under `onDeleteAttachment`.

### `promptLoginMessage: () => void`

This callback is called when the form needs to notify the user about authentication. The callback could f.ex. show an alertbox to that
effect.

### `onRequestHelpButton: (item: QuestionniareItem, itemHelp: QuestionnaireItem, helpType: string, helpText: string, opening: boolean) => JSX.Element`

This callback is called when the form encounters an element with help. The callback should return a JSX.Element which is placed after the
items label. If this is not specified, a default implementation is provided. The callback is called with the following arguments:

- `item: QuestionnaireItem` This is the item for which the help button is about to be rendered.
- `helpItem: QuestionnaireItem` This is the item containing the raw help text.
- `helpType: string` Type of help, either "help" or "help-link".
- `helpText: string` The help text, either as plain text or html (in the case the help item had markdown)
- `opening: boolean` This boolean indicates whether the help text is visible or not (open or closed)

### `onRequestHelpElement: (item: QuestionnaireItem, itemHelp: QuestionniareItem, helpType: string, helpText: string, opening: boolean => JSX.Element`

This callback is called when the form encounters an element with help. The callback could return a JSX.Element which would be placed after
the items label. If this is not specified, a default implementation is provided. The callback is called with the following arguments:

- `item: QuestionnaireItem` This is the item for which the help element is about to be rendered.
- `helpItem: QuestionnaireItem` This is the item containing the raw help text.
- `helpType: string` Type of help, either "help" or "help-link".
- `helpText: string` The help text, either as plain text or html (in the case the help item had markdown)
- `opening: boolean` This boolean indicates whether the help text is visible or not (open or closed)

### `onChange: (item: QuestionnaireItem, answer: QuestionnaireResponseAnswer, actionRequester: IActionRequester, questionnaireInspector: IQuestionnaireInspector) => void`

This callback is called when the user enters an answer. The callback is called with the following arguments:

- `item: QuestionnaireItem` This is the item the user answered.
- `answer: QuestionnaireResponseAnswer` This is the actual answer the user entered.
- `actionRequester: IActionRequester` Instance that facilitates programmatic changes to the questionnaire response.
- `questionnaireInspector: IQuestionnaireInspector` Instance that lets users query the questionnaire for questionnaire items and
  questionnaireResponse items.

### `onRenderMarkdown: (item: QuestionnaireItem, markdown: string) => string`

This callback is called when the form needs to render markdown. It should return a HTML string representation of the markup. The callback is
called with the following arguments:

- `item: QuestionnaireItem` This is the item with the markdown.
- `markdown: string` The actual markdown.

### `fetchValueSet: (searchString: string, item: QuestionnaireItem, successCallback: (valueSet: ValueSet) => void, errorCallback(error: string) => void) => void`

This callback is called when an autosuggest field need to load data. It should call either successCallback with a valueSet, or errorCallback
with an error message.

- `searchString: string` The value currently typed in the autosuggest field.
- `item: QuestionnaireItem` This is the choice or open-choice item to load data for.
- `successCallback: (valueSet: ValueSet) => void` The function to call to return a list of values to the autosuggest field, which will be
  displayed as a list to the user.
- `errorCallback(error: string) => void)` The function to call to return an error message to the autosuggest field, which will be displayed
  to the user.

### `fetchReceivers: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void`

This callback is called when a receiver component needs to load data. It should call either successCallback with a list of OrgenhetHierarki
objects, or errorCallback with an error message.

- `successCallback: (receivers: Array<OrgenhetHierarki>) => void` The function to call to return a list of OrgenhetHierarki objects to the
  receiver component, which will be displayed as a set of choices to the user.
- `errorCallback(error: string) => void)` The function to call to return an error message to the receiver component, which will be displayed
  to the user.

### `onFieldsNotCorrectlyFilledOut: () => void`

This callback is called when a required field is not filled out, or if a field is incorrectly filled out.

### `onStepChange: (newIndex: number) => void`

This callback is called when the current step in a step-view changes. It takes in the parameter newIndex, which contains the new index that the current index will be updated to.
This can be used to make progress indicators display the correct step.

# Enum definitions

## `ValidationSummaryPlacement`

```ts
// location: '@helsenorge/form/components/form/validationSummaryPlacement'
enum ValidationSummaryPlacement {
  Top = 'Top',
  Bottom = 'Bottom',
}
```

# Interface definitions

## `IActionRequester`

```ts
// location '@helsenorge/refero/util/actionRequester'
interface IActionRequester {
  addIntegerAnswer(linkId: string, value: number, index?: number): void;
  addDecimalAnswer(linkId: string, value: number, index?: number): void;
  addChoiceAnswer(linkId: string, value: Coding, index?: number): void;
  addOpenChoiceAnswer(linkId: string, value: Coding | string, index?: number): void;
  addBooleanAnswer(linkId: string, value: boolean, index?: number): void;
  addDateAnswer(linkId: string, value: string, index?: number): void;
  addTimeAnswer(linkId: string, value: string, index?: number): void;
  addDateTimeAnswer(linkId: string, value: string, index?: number): void;
  addQuantityAnswer(linkId: string, value: Quantity, index?: number): void;
  addStringAnswer(linkId: string, value: string, index?: number): void;

  clearIntegerAnswer(linkId: string, index?: number): void;
  clearDecimalAnswer(linkId: string, index?: number): void;
  clearBooleanAnswer(linkId: string, index?: number): void;
  clearDateAnswer(linkId: string, index?: number): void;
  clearTimeAnswer(linkId: string, index?: number): void;
  clearDateTimeAnswer(linkId: string, index?: number): void;
  clearQuantityAnswer(linkId: string, index?: number): void;
  clearStringAnswer(linkId: string, index?: number): void;

  removeChoiceAnswer(linkId: string, value: Coding, index?: number): void;
  removeOpenChoiceAnswer(linkId: string, value: Coding | string, index?: number): void;
}
```

`IActionRequester` facilitates programmatic updates of the `QuestionnaireResponse`. All the `add*`, `clear*` and `remove*` methods, will
queue a change event when called. This queue will then be processed when the callback finishes.

`linkId` is the linkId of the item to be updated. `value` is the value to update with. `index` is optional and defaults to `0`. It indicates
which instance of an item should be updated in case it is a repeatable item.

`removeChoiceAnswer` and `removeOpenChoiceAnswer` only removes answers in the case it is a check-box group. It is not possible to remove an
answer from a radio-button group or drop-down group.

## `IQuestionnaireInspector`

```ts
interface IQuestionnaireInspector {
  findItemWithLinkIds(linkIds: Array<string>): Array<QuestionnaireItemPair>;
}
```

`IQuestionnaireInspector` lets the users query the state of the questionnaire for both `QuestionnaireItem` and `QuestionnaireResponse`.

## `Path`

```ts
// location: '@helsenorge/refero/util/refero-core'
interface Path {
  linkId: string;
  index?: number;
}
```

## `QuestionniareItemPair`

```ts
interface QuestionnaireItemPair {
  QuestionnaireItem: QuestionnaireItem;
  QuestionnaireResponseItems: Array<ItemAndPath>;
}

interface ItemAndPath {
  item: QuestionnaireResponseItem;
  path: Path[];
}
```

## `TextMessage`

```ts
// location: '@helsenorge/refero/types/text-message'
interface TextMessage {
  Title: string;
  Body: string;
}
```

## `UploadedFile`

```ts
// location: '@helsenorge/file-upload/components/dropzone'
interface UploadedFile {
  id?: string;
  name: string;
}
```

## `Resources`

```ts
// location: '@helsenorge/refero/util/resources'
interface Resources {
  deleteButtonText: string;
  validationSummaryHeader: string;
  validationFileMax: string;
  validationFileType: string;
  supportedFileFormats: string;
  selectDefaultPlaceholder: string;
  resetTime: string;
  errorAfterMaxDate: string;
  errorBeforeMinDate: string;
  dateRequired: string;
  oppgiTid: string;
  ugyldigTid: string;
  oppgiDatoTid: string;
  ugyldigDatoTid: string;
  oppgiVerdi: string;
  oppgiGyldigVerdi: string;
  formCancel: string;
  formSend: string;
  formSave: string;
  formError: string;
  formOptional: string;
  formRequired: string;
  repeatButtonText: string;
  avsluttSkjema: string;
  fortsett: string;
  confirmDeleteButtonText: string;
  confirmDeleteCancelButtonText: string;
  confirmDeleteHeading: string;
  confirmDeleteDescription: string;
  minutePlaceholder: string;
  hourPlaceholder: string;
  ikkeBesvart: string;
  uploadButtonText: string;
  filterDateCalendarButton: string;
  filterDateNavigateBackward: string;
  filterDateNavigateForward: string;
  filterDateErrorDateFormat: string;
  filterDateErrorBeforeMinDate: string;
  filterDateErrorAfterMaxDate: string;
  validationNotAllowed: string;
  formRequiredErrorMessage?: string;
  deleteAttachmentText?: string;
  autoSuggestLoadError?: string;
  autosuggestNoSuggestions?: string;
  stringOverMaxLengthError?: string;
  maxLengthText?: string;
  chooseFilesText?: string;
  skipLinkText?: string;
  clearDate?: string;
  calendarLabel?: string;
  closeDatePicker?: string;
  focusStartDate: string;
  jumpToPrevMonth?: string;
  jumpToNextMonth?: string;
  keyboardShortcuts?: string;
  showKeyboardShortcutsPanel?: string;
  hideKeyboardShortcutsPanel?: string;
  enterKey?: string;
  leftArrowRightArrow?: string;
  upArrowDownArrow?: string;
  pageUpPageDown?: string;
  homeEnd?: string;
  escape?: string;
  questionMark?: string;
  openThisPanel?: string;
  selectFocusedDate?: string;
  moveFocusByOneDay?: string;
  moveFocusByOneWeek?: string;
  moveFocusByOneMonth?: string;
  moveFocustoStartAndEndOfWeek?: string;
  returnFocusToInput?: string;
  year_field_invalid?: string;
  year_field_maxdate?: string;
  year_field_mindate?: string;
  year_field_required?: string;
  yearmonth_field_invalid?: string;
  yearmonth_field_invalid_year?: string;
  yearmonth_field_maxdate?: string;
  yearmonth_field_mindate?: string;
  yearmonth_field_month_placeholder?: string;
  yearmonth_field_required?: string;
  yearmonth_field_year_placeholder?: string;
  adresseKomponent_header?: string;
  adresseKomponent_skjemaSendesTil?: string;
  adresseKomponent_sublabel?: string;
  adresseKomponent_velgAvdeling?: string;
  adresseKomponent_velgHelseforetak?: string;
  adresseKomponent_velgHelseregion?: string;
  adresseKomponent_velgSykehus?: string;
  adresseKomponent_velgKlinikk?: string;
  adresseKomponent_velgSeksjon?: string;
  adresseKomponent_velgSengepost?: string;
  adresseKomponent_velgPoliklinikk?: string;
  adresseKomponent_velgTjeneste?: string;
  adresseKomponent_feilmelding?: string;
  adresseKomponent_loadError?: string;
  linkOpensInNewTab?: string;
  nextStep?: string;
  previousStep?: string;
}
```

## `AutoSuggestProps`

```ts
// location: '@helsenorge/refero/types/autoSuggestProps'
interface AutoSuggestProps {
  minSearchCharacters: number;
  typingSearchDelay: number;
}
```

## `ValueSet`

```ts
// location: '@helsenorge/refero/types/fhir'
interface ValueSet extends DomainResource {
  // ValueSet as defined by the FHIR standard
}
```

## `OrgenhetHierarki`

```ts
// location: '@helsenorge/refero/types/orgenhetHierarki'
interface OrgenhetHierarki {
  OrgenhetId: number;
  Navn: string;
  EnhetType: EnhetType;
  EndepunktId: string | null;
  UnderOrgenheter: Array<OrgenhetHierarki> | null;
}

enum EnhetType {
  Region = 1,
  Foretak = 2,
  Sykehus = 3,
  Klinikk = 4,
  Avdeling = 5,
  Seksjon = 6,
  Sengepost = 7,
  Poliklinikk = 8,
  Tjeneste = 9,
}
```
