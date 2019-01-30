# @helsenorge/skjemautfyller

React component that consumes a [FHIR Questionnaire](https://www.hl7.org/fhir/questionnaire.html) object and renders it as a form.

## Dependencies

* @helsenorge/toolkit
* [marked](https://www.npmjs.com/package/marked)
* [moment](https://www.npmjs.com/package/moment)
* [uuid](https://www.npmjs.com/package/uuid)

## Example usage

```tsx
import React from 'react';
import { Store, createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '@helsenorge/skjemautfyller/reducers';
import { SkjemautfyllerContainer } from '@helsenorge/skjemautfyller/components';

let store: Store<{}> = createStore(rootReducer);

class App extends Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <SkjemautfyllerContainer
          store={store}
          questionnaire={...}
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
        />
      </Provider>
    );
```

## Props

| Name                    | Required | Type                  | Default | Description                                                          |
| ----------------------- | -------- | --------------------- | ------- | -------------------------------------------------------------------- |
| store                   |          | Store<{}>             | null    | Redux store                                                          |
| questionnaire           |          | Questionnaire         | null    | FHIR Questionnaire object                                            |
| questionnaireResponse   |          | QuestionnaireResponse | null    | FHIR QuestionnaireResponse object                                    |
| resources               |          | Resources             | null    | Resources object                                                     |
| onSubmit                | true     | callback              |         | Callback when user submits the form                                  |
| onSave                  | true     | callback              |         | Callback when user saves the form                                    |
| onCancel                | true     | callback              |         | Callback when user cancels the form                                  |
| uploadAttachment        |          | callback              | null    | Callback when user uploads attachment                                |
| onDeleteAttachment      |          | callback              | null    | Callback when user deletes attachment                                |
| onOpenAttachment        |          | callback              | null    | Callback when user opens attachment                                  |
| onRequestAttachmentLink |          | callback              | null    | Callback when the form needs to render a link to an attachment       |
| promptLoginMessage      |          | callback              | null    | Callback when the form needs to notify the user about authentication |
| loginButton             | true     | JSX.Element           |         | JSX for when the form needs to render a login button                 |
| authorized              | true     | boolean               |         | Whether or not the user is authorized/authenticated                  |
| pdf                     |          | boolean               | false   | Renders the form without interactive elements                        |

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

## Callback API

### `onSubmit: () => void`

This callback is called when the user requests the current form to be submitted.

### `onSave: () => void`

This callback is called when the user requests the current form to be saved.

### `onCancel: () => void`

This callback is called when the user requests the current form to be cancled.

### `uploadAttachment: (itemPath: Array<Path>, files: File[], item: QuestionnaireItem | undefined, cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void) => void`

This callback is called when the user requests uploading an attachment. The callback is called with the following arguments:

* `itemPath: Array<Path>` An array of [`Path`](#Path) objects that points to the QuestionnaireItem.linkId that is assosiated with the
  current upload action. Ex. if an upload element is defined at a QuestionnaireItem with linkId '2.1', the array would contain two entries,
  one for linkId '2' and the last entry for linkId '2.1'.
* `files: File[]` An array of [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) objects to be be uploaded.
* `item: QuestionnaireItem | undefined` A reference to the
  [`QuestionnaireItem`](https://www.hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item) assosiated with the current upload
  action.
* `cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void` Call this callback to indicate success or
  failure of the upload action. Upon success, the [`uploadedFile`](#UploadedFile) argument should be passed along, while a
  [`TextMessage`](#TextMessage) should be passed along upon failure. The `id`-property of [`UploadedFile`](#UploadedFile) is used for other
  callbacks related to attachments in order to identify an attachment.

### `onDeleteAttachment: (itemPath: Array<Path>, item: QuestionnaireItem | undefined, fileId: string, cb: (success: boolean, errorMessage: TextMessage | null) => void) => void`

This callback is called when the user requests deleting an attachment. The callback is called with the following arguments:

* `itemPath: Array<Path>` See `uploadAttachment` for a description of this argument.
* `item: QuestionnaireItem | undefined` See `uploadAttachment` for a description of this argument.
* `fileId: string` This indicates which file the user is requesting to delete. It corresponds to the `id` property of
  [`UploadedFile`](#UploadedFile) passed to the `cb`-callback in `uploadAttachment`.

### `onOpenAttachment: (fileId: string) => void`

This callback is called when the user requests to open an attachment. The callback is called with the following arguments:

* `fileId: string` This identifies the attachment, as described under `onDeleteAttachment`.

### `onRequestAttachmentLink: (fileId: string) => string`

This callback is called when the form needs to render an `<a href>`-type link. The callback should return a link to the the attachment. The
callback is called with the following arguments:

* `fileId: string` This identifies the attachment, as described under `onDeleteAttachment`.

### `promptLoginMessage: () => void`

This callback is called when the form needs to notify the user about authentication. The callback could f.ex. show an alertbox to that
effect.

# Interface definitions

## `Path`

```ts
interface Path {
  linkId: string;
}
```

## `TextMessage`

```ts
interface TextMessage {
  Title: string;
  Body: string;
}
```

## `UploadedFile`

```ts
interface UploadedFile {
  id?: string;
  name: string;
}
```

## `Resources`

```ts
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
}
```
