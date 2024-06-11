import * as React from 'react';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Resource,
  Coding,
  QuestionnaireResponseItem,
  ValueSet,
  Questionnaire,
} from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import TextField from './text-field';
import {
  NewValueAction,
  removeCodingValueAsync,
  newCodingValueAsync,
  newCodingStringValueAsync,
  removeCodingStringValueAsync,
} from '../../../actions/newValue';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '../../../constants';
import ItemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { isReadOnly, isDataReceiver } from '../../../util';
import {
  getOptions,
  shouldShowExtraChoice,
  getDisplay,
  getSystem,
  getIndexOfAnswer,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '../../../util/choice';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import SliderView from '../choice/slider-view';
import AutosuggestView from '../choice-common/autosuggest-view';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  questionnaire?: Questionnaire;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  resources?: Resources;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | null;
  headerTag?: number;
  responseItem: QuestionnaireResponseItem;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  children: JSX.Element;
}

export const OpenChoice = (props: Props): JSX.Element | null => {
  const {
    id,
    item,
    pdf,
    answer,
    containedResources,
    children,
    onRenderMarkdown,
    resources,
    dispatch,
    promptLoginMessage,
    path,
    onAnswerChange,
  } = props;

  const getDataReceiverValue = (answer: QuestionnaireResponseItemAnswer[]): string[] | undefined => {
    return answer
      .filter(f => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding) {
          return el.valueCoding.display;
        }
        if (el && el.valueString) {
          return el.valueString;
        }
      })
      .filter((it): it is string => it !== undefined);
  };

  const getPDFValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string => {
    if (isDataReceiver(item) && Array.isArray(answer)) {
      return getDataReceiverValue(answer)?.join(', ') || '';
    }
    const value = getValue(item, answer);

    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    const displayValues = value
      .filter(el => el !== OPEN_CHOICE_ID)
      .map(el => getDisplay(getOptions(resources, item, containedResources), el))
      .filter((it): it is string => it !== undefined);
    const openValue = getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  };

  const getOpenValue = (answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string | undefined => {
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i];
        if (el.valueString) {
          return el.valueString;
        }
      }
    }

    return;
  };

  const getValue = (
    item: QuestionnaireItem,
    answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseItemAnswer) => {
        if (el) {
          if (el.valueCoding && el.valueCoding.code) {
            return el.valueCoding.code;
          }
        }
      });
    } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code) {
      if (answer.valueCoding?.code === item.initial?.[0].valueCoding?.code && answer.valueCoding?.display === undefined) {
        resetInitialAnswer(answer.valueCoding.code);
      }
      return [answer.valueCoding.code];
    }
    const initialSelectedOption = item.answerOption?.filter(x => x.initialSelected);
    if (initialSelectedOption && initialSelectedOption.length > 0) {
      return [initialSelectedOption[0].valueCoding?.code];
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueCoding || !item.initial[0].valueCoding.code) {
      return undefined;
    }
    return [String(item.initial[0].valueCoding.code)];
  };

  const handleStringChangeEvent = (event: React.FocusEvent<HTMLInputElement, Element>): void => {
    const value = event.target.value;
    handleStringChange(value);
  };

  const handleStringChange = (value: string): void => {
    if (dispatch) {
      if (value.length > 0) {
        dispatch(newCodingStringValueAsync(path, value, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: value })
        );
      } else {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(resources, item, containedResources), code);
    const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(item, code, containedResources);
    const system = systemArg ? systemArg : valueSetSystem;
    return { code, display, system };
  };

  const resetInitialAnswer = (code: string): void => {
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }
      dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleCheckboxChange = (code?: string): void => {
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      interceptHandler(coding, getItemControlValue(item));
    }
  };

  const clearCodingAnswer = (coding: Coding): void => {
    if (dispatch) {
      const responseAnswer = { valueCoding: coding };
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };
      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }

      interceptHandler(coding, getItemControlValue(item));
    }
  };

  const interceptHandler = (coding: Coding, type: string | undefined): void => {
    switch (type) {
      case ItemControlConstants.CHECKBOX:
        return multiValueHandler(coding);
      default:
        return singleValueHandler(coding);
    }
  };

  const singleValueHandler = (coding: Coding): void => {
    if (dispatch) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }
  };

  const multiValueHandler = (coding: Coding): void => {
    if (dispatch) {
      const isShown = shouldShowExtraChoice(answer);

      if (isShown && coding.code === OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }
  };

  const renderTextField = (): JSX.Element => {
    let a: QuestionnaireResponseItemAnswer = {};
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i];
        if (el.valueString) {
          a = el;
          break;
        }
      }
    } else {
      a = answer;
    }

    return (
      <TextField
        {...props}
        answer={a}
        handleStringChange={handleStringChangeEvent}
        handleChange={handleStringChange}
        resources={resources}
      />
    );
  };

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = responseItem !== nextresponseItem;
  //   const helpItemHasChanged = isHelpOpen !== nextisHelpOpen;
  //   const resourcesHasChanged = JSON.stringify(resources) !== JSON.stringify(nextresources);
  //   const answerHasChanged = answer !== nextanswer;
  //   const repeats = item.repeats ?? false;
  //   const error = error !== nexterror;

  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || error;
  // }
  const renderComponentBasedOnType = (): JSX.Element | null => {
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) {
      return null;
    }
    const options = getOptions(resources, item, containedResources);

    const commonProps = {
      handleChange: handleChange,
      selected: getValue(item, answer),
      renderOpenField: () => renderTextField(),
      ...props,
    };

    const componentMap = {
      [ItemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [ItemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} handleChange={handleCheckboxChange} />,
      [ItemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [ItemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };

  const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
  const options = getOptions(resources, item, containedResources);
  const aboveDropdownThreshold = isAboveDropdownThreshold(options);
  const itemControlValue = getItemControlValue(item);
  const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === ItemControlConstants.AUTOCOMPLETE;
  const value = getValue(item, answer);

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
        {children}
      </TextView>
    );
  }

  return (
    <React.Fragment>
      {hasOptionsAndNoCanonicalValueSet ? (
        itemControlValue ? (
          renderComponentBasedOnType()
        ) : aboveDropdownThreshold ? (
          <DropdownView
            options={options}
            handleChange={handleChange}
            selected={value}
            renderOpenField={(): JSX.Element => renderTextField()}
            {...props}
          >
            {children}
          </DropdownView>
        ) : (
          <RadioView
            options={options}
            handleChange={handleChange}
            selected={value}
            renderOpenField={(): JSX.Element => renderTextField()}
            {...props}
          >
            {children}
          </RadioView>
        )
      ) : shouldRenderAutosuggest ? (
        <AutosuggestView
          handleChange={handleChange}
          clearCodingAnswer={clearCodingAnswer}
          handleStringChange={handleStringChange}
          {...props}
        >
          {children}
        </AutosuggestView>
      ) : null}
    </React.Fragment>
  );
};
const withFormProps = ReactHookFormHoc(OpenChoice);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedStringComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedStringComponent;
