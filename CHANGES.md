## 22.2.1

- Bugfix: Added onFormViewChange to externalRenderProps, to fix it being undefined
- Added stepIndex as an optional prop in onFormViewChange callback
- Added onFormViewChange in FormFillerPreview

## 22.2.0

- Renamed prop focusHandler to onFormViewChange
- onFormViewChange is an optional prop that is called when the form is initialized or if the view changes (example: step change)
- Focus handling is removed from Refero but can be handled with onFormViewChange

## 22.1.0

- Bugfix: Radiobutton-view triggered validation before form was submitted
- New prop: focusHandler. It allows consumers to manage focus logic on initialization and when navigating between steps in step-view.
- Removed env step in release workflow

## 22.0.0

- peerDependencies updated to helsenorge packages v.37.x.x and 13.x.x. Also added react 19.x.x as possible peerDependency
- dompurify upgraded to 3.3.0
- react upgraded to 19.2.1
- Helsenorge packages v.37.x.x and 13.x.x
- Add debounce to string inputs to improve performance on large forms

## 21.4.2

- Bugfix: added correct resource texts for form field tag levels

## 21.4.1

- Bugfix: Questionnaire with many items but no input-items would get "all felds are optional" tag

## 21.4.0

- Bugfix: Remove unused resource teksts, updated README.md
- added FormFieldTagLevel to indicate what fields are required/optional in the form

## 21.3.3

- Bugfix: Do not validate required on autosuggest before submit
- Bugfix: Added style class that was necessary back to date component

## 21.3.2

- Bugfix: Use antother styling class for date components, to remove extra spacing

## 21.3.1

- Fix bug related to intial values with repeatable items
- Added more unittests
- Dependabot package updates

## 21.3.0

- rewrite core logic for gTable to fix issues with data being shown in wrong rows and columns

## 21.2.0

- Fix issues with enableWhen in some edge cases
- Fix issues with nested repeatable items getting the same id's and showing the wrong values in the UI
- Fix issues with enableWhen not clearing items inside nested items when not wrapped in a container group
- Fix issues with enableWhen clearing wrong items in direct descendants to questionnaireResponse with repeat
- Fix issues with calculators not removing answers but instead leaving an empty array
- Fix calculations with zeros not working as expected. Now 0 is treated as a value.
- Added check for enableWhen conditions on FhirPath calculations to avoid unnecessary dispatches and re-renders
- Added better checks for newAnswer and current answers inside calculations, to check what items to dispatch a new answer to.
- Not casting newAnswer to empty array but returning undefined if no newAnswer exists
- Dependabot package updates

## 21.1.0

- Removed unused resource texts, updated Resource file for Helsenorge HN-Skjema

## 21.0.5

- Add new method to RenderCustomButtonsArgs, <code>setNewStepIndex?: (newIndex: number) => void;</code>, which can be used to change the
  current step in step-view mode.

## 21.0.4

- Remove scrollToTop onStepChange. This can be handled by the consumer of the library if needed.

## 21.0.3

- Rollback enableWhen listners to fix bug where enableWhen did not work in some cases when the first item in a questionnaire had repeat and
  enableWhen or the child items had enableWhen

## 21.0.2

- Bugfix: When submitting and errors existed, no errors got focus

## 21.0.1

- Added tests for enableWhen
- Fix bug where enableWhen did not work when the first item in a questionnaire had repeat and enableWhen or the child items had enableWhen

## 21.0.0

- FIX: Works even if the worker is blocked by CSP
- EnableWhen is now in a webworker and is called from a middleware, you need to get the middleware and add it to your store to make it work.
- Added new rcp worker when we added more methods to the worker.
- All fhirpath calculations in tables are now run in a webworker.
- Added more tests for enableWhen
- Updated major packages
  - Vite
  - fhirpath
  - uuid
  - dompurify
- Added new prop for attachment component: attachmentMaxFileSizePerFile. Will override the default max file size per file if set.
  Questionnaire extensions will still override this prop if set.

## 20.1.0

- Replaced custom validation-summary with validation-summary component from HN-Designsystem
- Use presentationButtonsType on custom buttons

## 20.0.0

- Updated peerDependencies @helsenorge packages to v.36.x.x and 12.x.x

## 19.0.2

- Fix: Initial values now support more than one initialValue

## 19.0.1

- Bugfix in slider: Inconsistent behavior when selecting values while slider was marked with error

## 19.0.0

- webworker for fhirPathCalculator, which will improve performance for large questionnaires with many calculated fields.

## 18.1.1

- Connect helpButton to label via arialabeledby
- Rewrite tests to use testId

## 18.1.0

- Added tests for valueSets for slider
- Added support for valueSets in slider-view

## 18.0.8

- Replaced the unit label after the quanity input-field with a sublabel

## 18.0.7

- Created a hook to set focus on the first element in stepview

## 18.0.6

- Fixed aria-label on links that did not match the visible link text

## 18.0.5

- random id on attachments on upload to avoid issues with multiple attachments with the same id

## 18.0.4

- Update runFhirPathQrUpdater to also check for children nested inside answers when updating items with fhirpath

## 18.0.3

- Change batch update of elements with fhirPathCalculator and better checks for necessary updates

## 18.0.2

- merge hotfix form 17.4.2 to main branch

## 18.0.0

- Upgrade Vite to v.6.x.x
- Upgrade vitest to v.3.x.x
- Upgrade @helsenorge/designsystem-react to v.11.x.x
- Upgrade @helsenorge/datepicker to v.11.x.x
- Upgrade @helsenorge/core-utils to v.35.x.x
- Upgrade @helsenorge/eslint-config to v.35.x.x
- Upgrade @helsenorge/autosuggest to v.35.x.x
- Upgrade @helsenorge/file-upload to v.35.x.x
- Changes to the stylesheets for local development

## 17.4.2

- changed maximum size of all attachments to 25MB

## 17.4.1

- Gave unique id's to Choice and Open-Choice options. Used the id's as keys to fix bug where the same option was added multiple times.

## 17.4.0

- Removed microweb related props.

## 17.3.3

- use setValueAs in react hook form to trim text values to avoid empty strings bypassing the validation <- do the same for textarea

## 17.3.2

- use setValueAs in react hook form to trim text values to avoid empty strings bypassing the validation
- Updated Types of react-hook-form to <code>UseFormReturn<DefaultValues, unknown, DefaultValues>;</code>

## 17.3.1

- Fix bug with validation of regex patterns. Move to validation function in utils.

## 17.3.0

- If a repeated item has initial value, set this value on the repeated item.
- Add valueReference to QuestionnaireResponse if the item has a valueReference and initial value

## 17.2.3

- table with itemControl 'table' now supports showing value from other column if only open-choice other value is selected

## 17.2.2

- fixed bug by moving the logic for the calculators into a action creator

## 17.2.1

- Fixed a bug with standard table where the headervalue did not represent the correct value from the choice input elements
- Fixed a infinite loop in standardTable

## 17.2.0

- Added prop to be able to hide validationSummary in form
- Fixed aria-label accessibility bug on anchorlinks

## 17.1.3

- Fix sorting of tables with date.

## 17.1.2

- GenerateQuestionnaireResponse now supports bundles of questionnaires

## 17.1.1

---

- Exclude items with the "help item-control extension from the questionnaire response

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
  "valueCodeableConcept": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/ValueSet/questionnaire-item-control",
        "code": "help"
      }
    ]
  }
}
```

## 17.0.1

---

- Check if group-item is enabled before displaying it in stepview

## 17.0.0

---

- Update helsenorge packages
- Update Label component to use new designsystem-react Label component
- Fix linting errors and update all tests to use .screen and properly use asycn await

## 16.4.1

---

- Exclude items with the "help item-control extension from the questionnaire response

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
  "valueCodeableConcept": {
    "coding": [
      {
        "system": "http://hl7.org/fhir/ValueSet/questionnaire-item-control",
        "code": "help"
      }
    ]
  }
}
```

## 16.4.0

---

- Split scoring into custom scoring and fhirpath scoring
- EnableWhen for items on the first level
- Moved logic for Table into group component

## 16.3.2

---

- Added horizontal separation line between repeated groups

## 16.3.1

---

- Included bugfix from version 16.2.3 in current version

## 16.3.0

---

- Changed default validation mode to onTouched

## 16.2.3

---

- Bugfix in attachment: Wrong validation texts were displayed on error

## 16.2.2

---

- Formatted code

## 16.2.1

---

- Support for Microweb Form buttons override in case custom props is set

## 16.2.0

---

- Support for accepting a prop for rendering your own action buttons in the form component
- Updated props description for form component

## 16.1.0

---

- Support for Microweb Step in refero
- Callbacks and override for formbuttons

## 16.0.9

---

- add dompurify to peerdependencies and remove from dependencies
- Bugfix: fix decimal field to only accept numbers and one period

## 16.0.8

---

- Bugfix: remove tostring from SanitizeText, return trustedHtml. Remove sanitazion from errorMessage

## 16.0.7

---

- UU bugfix: Grouped form controls missing an accessible name in Radiobuttons and Checkboxes

## 16.0.6

---

- Bugfix: Initial value was reset in Choice and Open-Choice
- Bugfix: Decimal field accepted all characters and some characters wiped the field
- Bugfix: Input fields width was too small

## 16.0.5

---

- Added id to slider-view component to make it possible for screenreaders to read the value of the slider

## 16.0.4

---

- Added placeholder in Choice dropdown that disappears after a selection is done

## 16.0.3

---

- Bugfix: fix attachement error message shows correct max size

## 16.0.2

---

- Bugfix: It was possible to write period in integer fields. Fixed by using type="text". Did this in decimal as well.
- Adjusted the calculation of the width of input fields.

## 16.0.1

---

- Date bugfix: Selecting month before selecting year added a year in the year field
- Date bugfix: Missing min and max values in time component
- Fixed bug with the autosuggest component not validation properly

## 16.0.0

---

- Removed and changed resources, removed unused.
- Upgraded all packages, complete rehaul of the project.
- Upgraded to v.33 of @helsenorge/xxx packages.
- Upgraded to v.9 of @helsenorge/designsystem.
- Removed all old form components and added new components from @helsenorge/designsystem.
- Rewrite from class to functional components.
- Added vite and vitest for development and build.
- Removed old enzyme and complete rewrite of tests with react-testing-library.
- Updated redux to use redux toolkit.
- Removed old form validation and added react-hook-form.
- Updated preview mode to be able to test the library with questionnaires and questionnaire-responses.
- Updated types in Attachment for UploadFile and MimeTypes from File-upload
- Update github actions to respect Beta versions
- Removed moment.js and added date-fns
- Added datepicker from @helsenorge/datepicker
- Upgraded to react 18
- Removed all dependencies to @helserorge/form (deprecated)
- Create new buttorow in refero to compensate for the missing buttonrow from form package

## 15.0.11

---

- Fixed bug in DateTime that added unwanted zero

## 15.0.10

---

- fix pipeline to publish with correct tag to npm
- fix small error in package.json

## 15.0.9

---

- Bugfix:
  - fix a bug with sorting strings that looks like numbers. now trying to parse all stings as numbers and if they are numbers, sort as
    numbers

## 15.0.8

---

- Bugfix:
  - fix a bug in the table-hn2. Not being able to sort on the first column in the table

## 15.0.7

---

- Bugfix:
  - Added support for emoji-codes in slider
    - Html codes
    - decimal codes
    - uni codes
    - hex codes

## 15.0.6

---

- Bugfix:
  - Added min and max display value on slider
  - Check if we should display ordinal values or labels as the slider steps

## 15.0.5

---

- Bugfix:
  - Added min and max display value on slider
  - Check if we should display ordinal values or labels as the slider steps

## 15.0.4

---

- Bugfix: Fix display language on slider

## 15.0.3

---

- Bugfix: Calutation works if item has RenderOptions

## 15.0.2

---

- Installed Designsystem v5.15.0 with slider bugfix and new slider props
- Slider can now be marked as selected with the new prop "selected"
- Slider now has an initial value with the new prop "value"

## 15.0.1

---

- Fix an issue where the delete button has no space after repeating an item
- Fix an issue where the help icon got pushed down to a new line

## 15.0.0

---

- Has possibility to display summary as table. Can support types Table, Table-HN1, Table-HN2 and GTable
- Support for ordering in GTable, Table-HN2 og Table

- Preview mode for development with vite.

## 14.0.10

---

- Bugfix: confirmation items did not update in repeating groups after fix

## 14.0.9

---

- Bugfix: When Confirmation is repeatable, the added items now have a initial value of false. Added same functionality for nested items.

## 14.0.8

---

- Bugfix: When Confirmation is repeatable, the added items now have a initial value of false

## 14.0.7

---

- Bugfix: Attachment Validation based on props max value, questionnaire item max attachment size rules and refero constant

## 14.0.5

---

- added enums to new fhirEnums.ts file

## 14.0.4

---

- Remove fhir.ts and added an npm package for the fhir typescript types

## 14.0.3

---

- bugfix: Render html tags in textarea label

## 14.0.1

---

- fixed slidercomponent not showing children

## 14.0.0

---

- Added component for slider view
- Upgraded Helsenorge packages to v29

## 13.2.2

---

- removed trustedHtml on empty strings in sidebar

## 13.2.1

---

- Added screen reader texts to aria-label instead of having them in hidden span-tags

## 13.2.0

---

- Total Score only calculates SS and not fields with calculated extentions

## 13.1.0

---

- Total Score, Seciton Score and BMI calculator can be displayed not only in fields with Quantity type, but also can be displayed in fields
  with Decimal and Integer types

## 13.0.0

---

- Upgraded to node 18
- Upgraded Helsenorge packages to v28.x
- Upgraded minor versions of many dependencies

## 12.2.0

---

- Upgraded marked package

## 12.1.0

---

- Added different classname for styling of pauseButton in step-view
- Reverted marked version to temporarily fix bug

## 12.0.5

---

- Bug fix: Correcting markdown line break handling + helpbutton

## 12.0.4

---

- Bug fix: Fixed wrong button order in normal form view

## 12.0.3

---

- Bug fix: Made getResponseItemAndPathWithLinkId be able to handle answer without item

## 12.0.0

---

- Upgraded helsenorge packages to v27.x.x
- Replaced old button position props in the Form component with new prop buttonOrder
- Created method for getting all QuestionnaireItems that have type

## 11.5.1

---

- Fixed bug that made forms with step-view crash.

## 11.5.0

---

- Fixing markdown bug where display elements will not use new line when formatting is used

## 11.4.9

---

- Fixing markdown bug where display elements will not use new line when formatting is used

## 11.4.8

---

- Quantity displays code and display name in data-receiver readonly text
- Fixed bug where pauseButton was displayed even though the form didn't have save capability
- Fixed bug where the form was not displayed for anonymous users

## 11.4.7

---

- Fixed bug where repeat button diactivated when item is not mandatory and does not have an answer

## 11.4.5

---

- Fixed error that caused the page to crash, because children was sent to the TextView component in a wrong way

## 11.4.4

---

- Removed Centimeter and Kilo from Quantity data-receiver readonly text

## 11.4.3

---

- Fixed bug where date-year was emptied if the component re-rendered

## 11.4.2

---

- Fixed bug where repeat button diactivated when item is group

## 11.4.1

---

- Fixed bug where attachement with enableWhen was not removed when parent changed

## 11.4.0

---

- Added functionality to render a form as a step-view
- Added new prop onStepChange. It is called when the step updates, and returns the new step value
- Upgraded form package to version 26.7.1
- Removed redundant fieldset tag
- Repeat button is now disabled when item has no answer

## 11.3.10

---

- Fixed UU-big by wrapping RadioGroup component in fieldset tag

## 11.3.9

---

- Bug fix: Added sanitize helper to make sure we return an actual string result or undefined on form components

## 11.3.8

---

- Small fix in date-day-input component: Removing misplaced undefined check

## 11.3.7

---

- Small fix in date-day-input component: Removing misplaced undefined check

## 11.3.6

---

- Fixed bug on date-day-input component to handle cases where answer does not contain a valid date

## 11.3.5

---

- Fixed referenceerror caused by the marked package by reverting to an older version
- Sanitized a prop sent to SafeTextArea imported from the form package, that contains html
- Removed redundant sanitizing

## 11.3.4

---

- Bug fix: Fixed unnecessary line break in markdown conversion

## 11.3.3

---

- Sets display in CodeSystem answer, if it is missing from initial property
- Calculated data can be copied from parent in a Data-Receiver field
- Repeatable Datetime and Time can be copied in Data-Receiver field

## 11.3.2

---

- Sanitized more strings with Dompurify

## 11.3.1

---

- Fixed onFieldsNotCorrectlyFilledOut being called twice

## 11.3.0

---

- Added helsenorge/form version 26.4.0 as peer dependency

## 11.2.2

---

- Made Dompurify accept the target attribute when sanitizing links
- Gave links with target="\_blank" the attribute rel="noopener noreferrer" for better security

## 11.2.1

---

- Added possibility to copy or move data fields to a summary function with help of data-receiver extension
- Added new callback prop to ReferoContainer called onFieldsNotCorrectlyFilledOut. It is called when a required field is not filled out, or
  if a field is incorrectly filled out.

## 11.0.0

---

- Upgraded helsenorge packages to version 26.x.x
- Upgraded third party libraries to the same versions used in the helsenorge v26 packages
- Replaced deprecated prop in an instance of the Button component
- Created a new prop in Text.tsx: "shouldExpanderRenderChildrenWhenClosed". It is used in the Expander component to decide if it's children
  should be rendered if the Expander is closed.

## 10.4.0-beta01

---

- Added functionality to copy or move data fields to a summary function

## 10.3.0

---

- Removed redundant load of Dompurify
- Returned Trusted Types in sanitize functions where it was missing
- Sanitized more texts with Dompurify
- Removed use of external CustomTag

## 10.2.0

---

- Added sanitizing for dangerouslySetInnerHTML in form components with DomPurify
- utils/index.ts: Moved renderer functions inside getMarkdownValue function so that they can access resources
- getText and getSublabelText now takes inn resources as an optional prop
- getMarkdownValue takes in srLinkText as an optional prop
- Fixed bug in date-year-input by creating a seperate function to get the year value
- Created a test suite for date components
- Created a test to check that date-year-input converts the string input to the correct date
- Moved getYear function to a new util file called "createDateFromYear"

## 10.1.3

---

- Made screenreader resource-text optional and added checks for undefined, to prevent error if it's undefined

## 10.1.2

---

- Added screenreader resource-text for links opening in new tab

## 10.1.1

---

- Upgraded helsenorge packages to version 25

## 10.0.1

---

- Removed sanitizing from dangerouslySetInnerHTML, because it caused error

## 10.0.0

---

- Rename project to refero
- 'SkjameutfyllerContainer' is now 'ReferoContainer'
- All css-classes with 'skjemautfyller' now renamed to 'refero'
- File skjemautfyller-core.ts renamed to refero-core.ts
- Upgrade to 24.1.x of @helsenorge packages

## 9.1.0

---

- Added support for internal linking based on sdf-hyperlink-target extension on all components
- Added DOMPurifier render with target="\_self"
- Added same-site url builder for links that open in the same window

## 9.0.1

---

- Fix handling of initial values for quantity fields.

## 9.0.0

---

- Upgrade to- 23.x.x version of @helsenorge packages
- Upgraded to use React 17.0.2
- Added @helsenorge/framework-utils as devDependency
- Added @helsenorge/date-time as peerDependency
- Added @helsenorge/autosuggest as peerDependency
- Added @helsenorge/file-upload as devDependency
- Added @helsenorge/form as devDependency
- Upgraded enzyme-adapter-react-16 to enzyme-adapter-react-17
- Upgraded designsystem-react to 1.0.0-formlayoutiphone.0
- Replaced ExpanderSection from Toolkit with Expander from designsystem
- Replaced icons from Toolkit with icons from designsystem
- Temporarily removed validation-spec.tsx. The behaviour tested for seems to work, but test won't run.

## 8.0.1

---

- Fixed a bug when duplicating an item for repeat, where the duplicated item sometimes would contain an empty answer block.

## 8.0.0

---

- Upgrade to 22.x.x version of @helsenorge packages
- Upgraded to use Node 16.13.2
- Added @helsenorge/designsystem-react as a peerDependency
- Added enzyme-adapter-react-16 as a devDependency
- Removed TS-Jest in favour of Babel for tests

## 7.10.8

---

- Removed InitialDate prop from DateRangePicker used in date-day-input.tsx

## 7.10.7

---

- Replaced Spinner component with Loader from designsystem-react in ReceiverComponent

## 7.10.6

---

- Fix publish fault

## 7.10.5

---

- Replaced Lightbox component with Modal from designsystem-react
- Replaced Spinner component with Loader from designsystem-react
- Replaced MessageBox component with NotaficationBox from designsystem-react
- Replaced button components from toolkit with Button from designsystem-react
- Upgrade package @helsenorge/core-build to 21.3.1
- Upgrade package @helsenorge/core-utils to 21.3.0
- Upgrade package @helsenorge/toolkit to 21.4.1

  7.10.4

---

- Fix bug where value in receiver component was not cleared when unselecting a leaf node.

  7.10.3

---

- Add support for questionnaire-item-control "receiver-component"

  7.10.2

---

- Fix focus bug in dateTime field when touch events is enabled in browser and date is entered by keyboard.

  7.10.1

---

- Remove "InitialFormData" from store.

  7.10.0

---

- Upgrade components to new version of @helsenorge/toolkit and @helsenorge/core-utils. Requires @helsenorge/toolkit v21.0.0 and
  @helsenorge/core-utils v21.0.0
- Upgrade package immer to 9.0.6
- Upgrade package uuid to 8.3.2
- Move package tabbable from depenencies to devDependencies

  7.9.3

---

- Re-render boolean component when resources prop is changed.

  7.9.2

---

- Add new props to disable submit and save buttons in <Form>-component: submitButtonDisabled, saveButtonDisabled

  7.9.1

---

- Show correct value for readonly year and year + month field with initial value.

  7.9.0

---

- Add new fields for year and year + month.
- Fix issue with dropdown value not being updated when deleting a repeatable item.
- Fix issue with entering date by keyboard when touch events is enabled in browser.

  7.8.1

---

- Remove support for unused Questionnaire extensions.

  7.8.0

---

- Add support for sublabel-extension for all components with label.
- Add support for questionnaire-item-control "highlight" for item type = "display".

  7.7.1

---

- Add id-attribute to markup of all form HTML elements.

  7.7.0

---

- Upgrade components to new version of @helsenorge/toolkit and @helsenorge/core-utils. Requires @helsenorge/toolkit v20.0.0 and
  @helsenorge/core-utils v20.0.0

  7.6.6

---

- Do not set empty "text" property for items in QuestionnaireResponse if the item does not have "text" property.

  7.6.5

---

- Add function to get value of sdf-generatepdf Questionnaire extension.

  7.6.4

---

- Replace MessageBox component with NotificationPanel.
- Change button types in confirm delete repeated item dialog from ActionButton to DisplayButton.

  7.6.3

---

- Add prop attachmentErrorMessage, which will be shown in a red messagebox on all attachment fields if set.

  7.6.2

---

- Translate resources for datepicker component.

  7.6.1

---

- Set "text" property in QuestionnaireResponse for repeated groups.

  7.6.0

---

- Upgrade components to new version of @helsenorge/toolkits. Requires @helsenorge/toolkit v19.1.0
- Date-time component will use language from questionnaire to set month and day names.

  7.5.1

---

- Fix crash when using date component with english locale.
- Set month opened in date component to current month (unless a date is set in date component)
- Remove depenency to moment. moment is included as depenency in @helsenorge/toolkit.

  7.5.0

---

- Upgrade components to new version of @helsenorge/toolkit and @helsenorge/core-utils. Requires @helsenorge/toolkit v19.0.0 and
  @helsenorge/core-utils v19.0.0
- New datepicker component. Will use language from questionnaire to set month and day names.
- Change checked color of checkboxes and radio buttons from purple to teal.
- Form button types changed from ActionButton to DisplayButton

  7.4.1

---

- Run enableWhen logic when Coding value is removed (most common when checkbox is un-checked).

  7.4.0

---

- Upgrade components to new version of @helsenorge/toolkit and @helsenorge/core-utils. Requires @helsenorge/toolkit v18.0.0 and
  @helsenorge/core-utils v5.4.0

  7.3.4

---

- When dispatching new value event for choice and open-choice, also send system in valueCoding if item use answerOption instead of
  answerValueSet.

  7.3.3

---

- Show existing answer in autocomplete field when the component is mounted.
- When evaluating enableWhen for a repeated item, search for condition question in repeated parent before searching the rest of the
  questionnaire.
- Fix agressive defauting added zeroes in time and date-time input fields.

  7.3.2

---

- Add function to get item and markdown text for all items with questionnaire-item-control "sidebar".

  7.3.1

---

- Hide no-suggestions message of autocomplete field when autocomplete field lose focus. Never show no-suggestions for open-choice
  autocomplete.
- Remove default placeholder of autocomplete field.

  7.3.0

---

- Add support for questionnaire-item-control "autocomplete" for choice and open-choice. Support url in answerValueSet for choice and
  open-choice.

  7.2.2

---

- Export function isIE11() from utils.

  7.2.1

---

- Add support for scroll navigator. Can be enabled with extension sdf-questionnaire-navgiator-state.

  7.2.0

---

- Skipped, published as beta version only.

  7.1.2

---

- Added support for questionnaire-item-control "highlight" for item type = "text.

  7.1.1

---

- Support for extension sdf-questionnaire-print-version on questionnaire to determine the url (if any) of the binary file representing the
  paper version of this questionnaire.

  7.1.0

---

- Upgrade components to new version of @helsenorge/toolkit and @helsenorge/core-utils. Requires @helsenorge/toolkit v15.0.1 and
  @helsenorge/core-utils v3.0.0

  7.0.2

---

- Fix for 'false' values in enableWhen: run enableWhen matching when answerDecimal and answerInteger is the number 0, and answerString is
  the empty string.

  7.0.1

---

- Performance improvement: Fix componentShouldUpdate check for when resources prop changes

  7.0.0

---

- Upgrade from FHIR STU3 to FHIR R4.

  6.6.1

---

- Update components if new resource prop is set after first render.

  6.6.0

---

- Upgrade components to new version of @helsenorge/toolkit. Requires @helsenorge/toolkit v14.0.0

  6.5.7

---

- Introduce new prop 'syncQuestionnaireResponse' to give limited assistance in synchronizing a Questionnaire and a QuestionnaireResponse
  object. It supports adding and deleting items, and very limited support for changed items. It does not support any extensions. In
  addition, it will convert old linkIds of the form X^Y into new linkIds of the form X.

  6.5.6

---

- Support for setting custom text on delete attachment button (deleteAttachmentText), instead of hardcoded 'Slett'.

  6.5.5

---

- Use v1.6.22 of @helsenorge/core-utils as peerDependency.

  6.5.4

---

- Fix issue with clearing answers of items multiple dependent enableWhen items.

  6.5.3

---

- Improve processing time when clearing answers of items which will hidden by enableWhen.

  6.5.2

---

- Do not set system in Coding object in processNewValueAction(...) if system is undefined or null.

  6.5.1

---

- Fix styling of static buttonbar.

  6.5.0

---

- Upgrade components to new version of @helsenorge/toolkit. Requires @helsenorge/toolkit v13.0.0

  6.4.3

---

- Render add and delete buttons of repeatable fields on separate lines for all field types.
- Remove title attribute of anchor tags rendered from markdown when title is null.

  6.4.2

---

- Fix bug for revalidate of textarea. Requires @helsenorge/toolkit v12.0.12

  6.4.1

---

- Remove extension sdf-save-to-document-archive.
- Support for extension sdf-endpoint on questionnaire to determine the recipient url (if any) of questionnaire.

  6.4.0

---

- Revalidate components when they are updated via props. Requires @helsenorge/toolkit v12.0.8

  6.3.0

---

- Support for error message when required string or text field is empty. Added resource formRequiredErrorMessage ("Du må fylle ut dette
  feltet")

  6.2.4

---

- Support for extension SaveToDocumentArchive on questionnaire to determine where QuestionnaireResponse is saved.

  6.2.3

---

- Add class 'page_skjemautfyller\_\_helpComponent--open' to help component content when content is expanded.

  6.2.2

---

- Repeat-buttons would be rendered on all repeated response items. Now only renders on last response item.

  6.2.1

---

- Fix bug where it was possible to type '000' in hours and minutes fields of time input.

  6.2.0

---

- Support for external rendering of markdown using the new onRenderMarkdown property.

  6.1.3

---

- Fix bug when collapsing enableWhen. Bedore it would not always clear the entered data, this should now be fixed.

  6.1.2

---

- Enable immer for ES5 to support IE11.
- Replace Number.isNaN(...) and Number.isFinite(...) with window.isNaN(...) and window.isFinite(...) to support IE11.

  6.1.1

---

- Add target attribute to list of valid DOMPurify attributes, so lnks can be opened in new tabs.

  6.1.0

---

- Use ExpandableSection component instead of ExpandableBlock component for itemControl-extension inline.
- Add css class 'page_skjemautfyller\_\_component_readonlytext' to markup of readonly string and text fields.

  6.0.0

---

- This version requires @helsenorge/toolkit v12.0.0 or higher as well as @helsenorge/core-utils v1.4.2 or higher.

  5.3.0

---

- Change button placement & button types: save button is now a secondary Actionbutton, instead of a Functionbutton. Save button is now
  between Submit and Cancel buttons.

  5.2.12

---

- Support for http://helsenorge.no/fhir/StructureDefinition/sdf-presentationbuttons

  5.2.11

---

- Support for http://ehelse.no/fhir/StructureDefinition/sdf-maxvalue and http://ehelse.no/fhir/StructureDefinition/sdf-minvalue

  5.2.10

---

- Don't render the Save or Cancel buttons if their callbacks are not defined.

  5.2.9

---

- Rendering optimalizations.

  5.2.8

---

- regex validation support for text fields.

  5.2.7

---

- enableWhen now supports checkboxes where several answers may be given. It triggers when any of the given answers matches the enableWhen
  answer. Previously it would only trigger when the answer exactly matched the enableWhen answer.

  5.2.6

---

- Bug fix for date-fields. Previously it was not possible to clear a date-fields value.

  5.2.5

---

- Added support for questionnaire-item-control type "grid".

  5.2.4

---

- Bug fix for scoring. Don't propagate NaN and Infinite results.

  5.2.3

---

- Support for extension maxDecimalPlaces on quantity types. Now also supports maxDecimalPlaces where the value is 0, in which case the input
  field acts as an integer field.

  5.2.2

---

- Changed the onChange public API to include an IQuestionnaireInspector, that supports querying a questionnaire for QuestionnaireItems and
  QuestionnaireResponses using linkIds.

  5.2.1

---

- Added support for enableWhen with quantity answers.

  5.2.0

---

- Upgrade @helsenorge/core-build and @helsenorge/toolkit

  5.0.1

---

- Added new property onChange, that gets triggered whenever a user answers a question. The onChange callback is passed an instance of
  IActionRequester, that facilitate programmatic changes to the questionnaire.

  5.0.0

---

- Support for scoring with total score (TS), section score (SS) question score (QS) and fhirpath scoring.
- Upgraded @helsenorge/core-build to v10.0.2.
- redux-thunk as middleware is now required.

  4.0.3

---

- Fixes bug where empty answers where not pruned from the reponse tree.

  4.0.2

---

- Added support for hidden items.

  4.0.0

---

- Removed ^ from QuestionnaireResponse for repeating items.

  3.5.2

---

- Update the redux state after typing in a text input (250ms debounce) without leaving (blur) the text input.

  3.5.1

---

- Update the redux state after typing in a text area (250ms debounce) without leaving (blur) the text area.

  3.5.0

---

- Added @helsenorge/toolkit version ^9.0.0 as peerDependency

  3.4.1

---

- Fixed bug when multple enableWhen items are dependent. Now all answers are cleared.

  3.4.0

---

- Use @helsenorge/toolkit version 8.4.2
- Use @helsenorge/core-build 8.1.0
- New rules for eslint og tslint

  3.2.1

---

- Added support for itemControl-extension inline. Using expandable block for child items
- when item type text has itemControl code == inline.

  3.2.0

---

- Use @helsenorge/toolkit version 8

  3.1.0

---

- Added validation of text and string input. If the new prop validateScriptInjection = true then
- html tags in input fields will give a validation error. Added resource validationNotAllowed (er ikke tillatt)

  3.0.3

---

- Fixed bug when a boolean with more than one children is repeated
- When using hasAnswer = false in enableWhen, then the item should be visible if there are no answer.

  3.0.2

---

- All components now properly renders their children. In previous versions, some component types did not render their childre.

  3.0.1

---

- Empty answer objects used to remain in the QuestionnaireResponse structure when an answer was removed. This should no longer be the case.
  An empty answer should now result in the answer property being removed entirely.

  3.0.0

---

- Use new versions of redux (7.1.0), react-redux (4.0.4) and redux-thunk (2.3)
- Added peerDependencies
- Use @helsenorge/toolkit v7.0.0 (added as peerDependency)

  2.6.7

---

- Use @helsenorge/toolkit v6.2.5 that fixes an event-notify issue with datepicker.

  2.6.6

---

- Support for questionnaire-item-control 'table', 'htable', 'gtable' and 'atable'.

  Group-items with itemControl-extension, having one of the codes 'table', 'htable', 'gtable' or 'atable', will be rendered with a
  corresponding class name. E.g. 'page_skjemautfyller\_\_itemControl_gtable'

  2.6.5

---

- Adding onKeyPress validity check on Quantity input so only numbers and decimal go through 2.6.4

---

- When closing items via enableWhen, make sure only the hidden fields are cleaned up, and not unrelated fields.

  2.6.3

---

- Changed the version of moment to "2.22.2" because that version is used by MinHelse

  2.6.1

---

- Use @helsenorge/toolkit v6.2.1

  2.6.0

---

- Introduce a new property 'validationSummaryPlacement' to control the placement of the form validation summary. Possible values are:

      ValidationSummaryPlacement.Top
      ValidationSummaryPlacement.Bottom

  If nothing is specified, it defaults to ValidationSummaryPlacement.Top.

  2.5.1

---

- enableWhen-components that were generated by a repeat used to be expanded as default. This behaviour have now been fixed, so that these
  components are properly expanded according to their criteria.

  2.5.0

---

- Item type of attachment with repeat set to true, will render to a component that can handle upload of multiple files. The component will
  for that reason render without the repeat and delete buttons.

  2.4.0

---

- Added public API to control what file types and file sizes are valid for attachments.

  2.3.0

---

- Added support for helpitems.

  Help for an item can be defined using another item that is a direct descendant of the item in question. This helpitem must be of type
  "text" and implement the itemControl-extension with a code value of "help". Eg.

  { linkId: "1", text: "This is a question", type: "group", item: [ { extension: [ { url:
  "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl", valueCodeableConcept: { coding: [ { system:
  "http://hl7.org/fhir/ValueSet/questionnaire-item-control", code: "help" } ] } } ], linkId: "1.0.1", text: "This is the help text for the
  item with linkId 1", type: "text" } ] }

  2.2.2

---

- Added component specific css classes for all components.
