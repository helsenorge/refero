//Component
export { default as Refero } from './components/index';
export { default } from './components/index';
export { ReferoLabel } from './components/referoLabel/ReferoLabel';
export { default as SafeText } from './components/referoLabel/SafeText';
export { ReadOnly } from './components/formcomponents/read-only/readOnly';

//Validation
export * from './components/validation/rules';
export { shouldValidate } from './components/validation/utils';

// Re-export react-hook-form hooks for plugins to use (ensures same instance)
export { useFormContext, type FieldError, type FieldValues, type RegisterOptions } from 'react-hook-form';

//State
////Actions
export * from './actions/form';
export * from './actions/generateQuestionnaireResponse';
export * from './actions/newValue';
export * from './actions/syncQuestionnaireResponse';

////Reducer
export * from './reducers/form';
export { default as form } from './reducers/form';

export * from './reducers/index';
export { default as rootReducer } from './reducers/index';
//Hooks
export { useIsEnabled, isEnableWhenEnabled, useCheckIfEnabled } from './hooks/useIsEnabled';
export { usePluginDispatch, type PluginAsyncThunk } from './hooks/usePluginDispatch';
export { usePluginValidation, type UsePluginValidationOptions, type UsePluginValidationResult } from './hooks/usePluginValidation';

//Utils
export * from './util/index';
export * from './util/hacks';
export * from './util/extension';
export * from './util/codingsystem';
export * from './util/actionRequester';
export * from './util/questionnaireInspector';
export * from './util/refero-core';
export * from './util/getTopLevelElements';
export * from './util/pluginUtils';
export {
  hasCanonicalValueSet,
  hasOptions,
  getOptions,
  getSystem,
  getSystemForItem,
  getDisplay,
  renderOptions,
  isAboveDropdownThreshold,
  getItemControlValue,
  isAllowedValue,
  validateInput,
  getIndexOfAnswer,
  shouldShowExtraChoice,
  getContainedOptions,
} from './util/choice';

//Types
export * from './types/formTypes/formButton';
export * from './types/formTypes/formInputs';
export * from './types/formTypes/radioGroupOptions';
export * from './types/formTypes/validationSummaryPlacement';
export * from './types/autoSuggestProps';
export * from './types/dispatchProps';
export * from './types/fhirEnums';
export * from './types/orgenhetHierarki';
export * from './types/queryStrings';
export * from './types/referoProps';
export * from './types/sidebar';
export * from './types/text-message';
export * from './types/componentPlugin';
export * from './context/componentPlugin';
export * from './components/formcomponents/plugin';
export * from './util/resources';

//Constants
export * from './constants/itemType';
export { default as ItemTypeConstants } from './constants/itemType';

export * from './constants/codingsystems';
export { default as CodingSystemConstants } from './constants/codingsystems';

export * as ExtensionConstants from './constants/extensions';

export { default as ItemControl } from './constants/itemcontrol';

export { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from './constants/index';
