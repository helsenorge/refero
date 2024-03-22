import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Resource, Coding, QuestionnaireResponseItem, ValueSet } from 'fhir/r4';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import TextField from './text-field';
import { OPEN_CHOICE_ID } from '../../../constants';
import { OPEN_CHOICE_SYSTEM } from '../../../constants/codingsystems';
import ItemControlConstants from '../../../constants/itemcontrol';
import {
  NewValueAction,
  removeCodingValueAsync,
  newCodingValueAsync,
  newCodingStringValueAsync,
  removeCodingStringValueAsync,
} from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { isReadOnly, isDataReceiver } from '../../../util';
import {
  renderOptions,
  getOptions,
  validateInput,
  shouldShowExtraChoice,
  getDisplay,
  getSystem,
  getIndexOfAnswer,
  getItemControlValue,
} from '../../../util/choice';
import { mapStateToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';
import SliderView from '../choice/slider-view';
import AutosuggestView from '../choice-common/autosuggest-view';
import TextView from '../textview';

export interface OpenChoiceProps extends WithFormComponentsProps {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  resources?: Resources;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | undefined;
  headerTag?: number;
  responseItem: QuestionnaireResponseItem;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  children?: React.ReactNode;
}

const OpenChoice = (props: OpenChoiceProps): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getDataReceiverValue = (answer: Array<QuestionnaireResponseItemAnswer>): (string | undefined)[] => {
    return answer
      .filter(f => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding) {
          return el.valueCoding.display;
        }
        if (el && el.valueString) {
          return el.valueString;
        }
      });
  };

  const getPDFValue = (
    item: QuestionnaireItem,
    answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): string => {
    const { resources, containedResources } = props;

    if (isDataReceiver(item)) {
      return getDataReceiverValue(answer as Array<QuestionnaireResponseItemAnswer>).join(', ');
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
      .map(el => getDisplay(getOptions(resources, item, containedResources), el));
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

  const handleStringChangeEvent = (event: React.FormEvent<{}>): void => {
    const value = (event.target as HTMLInputElement).value;
    handleStringChange(value);
  };

  const handleStringChange = (value: string): void => {
    const { promptLoginMessage, path, item, onAnswerChange } = props;
    if (value.length > 0) {
      dispatch(newCodingStringValueAsync(props.path, value, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
      );
    } else {
      dispatch(removeCodingStringValueAsync(props.path, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(props.resources, props.item, props.containedResources), code);
    const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(props.item, code, props.containedResources);
    const system = systemArg ? systemArg : valueSetSystem;
    return { code, display, system } as Coding;
  };

  const resetInitialAnswer = (code: string): void => {
    const { answer, promptLoginMessage, item, onAnswerChange, path } = props;
    if (code) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
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
    const { answer, promptLoginMessage, item, onAnswerChange, path } = props;
    if (code) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(props.path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValueAsync(props.path, coding, props.item, true))?.then(newState =>
          onAnswerChange(newState, path, item, responseAnswer)
        );
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      interceptHandler(coding, getItemControlValue(item));
    }
  };

  const clearCodingAnswer = (coding: Coding): void => {
    const { promptLoginMessage, item, onAnswerChange, path } = props;
    const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
    dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { promptLoginMessage, item, onAnswerChange, path } = props;
    if (code) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(newCodingValueAsync(props.path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
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
    const { item, path, onAnswerChange } = props;

    if (coding.code !== OPEN_CHOICE_ID) {
      dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
      );
    }
  };

  const multiValueHandler = (coding: Coding): void => {
    const { item, path, answer, onAnswerChange } = props;

    const isShown = shouldShowExtraChoice(answer);

    if (isShown && coding.code === OPEN_CHOICE_ID) {
      dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
      );
    }
  };

  const renderTextField = (): JSX.Element => {
    const { id, pdf, item, answer, onRenderMarkdown, ...other } = props;

    let a: QuestionnaireResponseItemAnswer = {};
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i] as QuestionnaireResponseItemAnswer;
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
        id={id}
        pdf={pdf}
        item={item}
        answer={a}
        handleStringChange={handleStringChangeEvent}
        onRenderMarkdown={onRenderMarkdown}
        resources={props.resources}
        {...other}
      />
    );
  };

  const renderCheckbox = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <CheckboxView
        options={options}
        id={props.id}
        handleChange={handleCheckboxChange}
        selected={getValue(props.item, props.answer)}
        renderOpenField={(): JSX.Element => renderTextField()}
        onRenderMarkdown={props.onRenderMarkdown}
        {...props}
      >
        {props.children}
      </CheckboxView>
    );
  };

  const renderDropdown = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <DropdownView
        options={options}
        id={props.id}
        handleChange={handleChange}
        selected={getValue(props.item, props.answer)}
        validateInput={(value: string): boolean => validateInput(props.item, value, props.containedResources, props.resources)}
        resources={props.resources}
        renderOpenField={(): JSX.Element => renderTextField()}
        onRenderMarkdown={props.onRenderMarkdown}
        {...props}
      >
        {props.children}
      </DropdownView>
    );
  };

  const renderRadio = (options: Array<Options> | undefined): JSX.Element => {
    const { item, resources, containedResources, children, id, answer, repeatButton, ...rest } = props;
    return (
      <RadioView
        options={options}
        item={item}
        handleChange={handleChange}
        validateInput={(value: string): boolean => validateInput(item, value, containedResources, resources)}
        id={id}
        selected={getValue(item, answer)}
        repeatButton={repeatButton}
        renderOpenField={(): JSX.Element => renderTextField()}
        answer={answer}
        onRenderMarkdown={props.onRenderMarkdown}
        {...rest}
      >
        {children}
      </RadioView>
    );
  };

  const renderAutosuggest = (): JSX.Element => {
    return (
      <AutosuggestView
        handleChange={handleChange}
        id={props.id}
        clearCodingAnswer={clearCodingAnswer}
        onRenderMarkdown={props.onRenderMarkdown}
        handleStringChange={handleStringChange}
        {...props}
      >
        {props.children}
      </AutosuggestView>
    );
  };

  const renderSlider = (): JSX.Element => {
    return (
      <SliderView
        item={props.item}
        answer={props.answer}
        handleChange={handleChange}
        path={props.path}
        selected={getValue(props.item, props.answer)}
      >
        {props.children}
      </SliderView>
    );
  };

  const { id, item, pdf, answer, containedResources, children, onRenderMarkdown } = props;
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
        {children}
      </TextView>
    );
  }

  return (
    <React.Fragment>
      {renderOptions(
        item,
        containedResources,
        renderRadio,
        renderCheckbox,
        renderDropdown,
        renderSlider,
        props.resources,
        renderAutosuggest
      )}
    </React.Fragment>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(OpenChoice);
const connectedStringComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedStringComponent;
