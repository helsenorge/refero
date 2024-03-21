import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Resource, Coding, QuestionnaireResponseItem, ValueSet } from 'fhir/r4';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import { Options } from '../../../types/formTypes/radioGroupOptions';
import { OrgenhetHierarki } from '../../../types/orgenhetHierarki';
import { Resources } from '../../../types/resources';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import SliderView from './slider-view';
import { NewValueAction, newCodingValueAsync, removeCodingValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getOptions, getSystem, getErrorMessage, validateInput, getIndexOfAnswer, getDisplay, renderOptions } from '../../../util/choice';
import { isReadOnly, isDataReceiver } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import AutosuggestView from '../choice-common/autosuggest-view';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';
import TextView from '../textview';

export interface ChoiceProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  resources?: Resources;
  containedResources?: Resource[];
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  headerTag?: number;
  responseItem: QuestionnaireResponseItem;
  renderDeleteButton: () => JSX.Element | undefined;
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
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  children: React.ReactNode;
}

const Choice = (props: ChoiceProps): JSX.Element | null => {
  // const [valid, setValid] = React.useState<boolean>(true);
  // const [validated, setValidated] = React.useState<boolean>(false);
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();

  const getValue = (
    item: QuestionnaireItem,
    answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding && el.valueCoding.code) {
          return el.valueCoding.code;
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
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueCoding || !!item.initial[0].valueCoding.code) {
      return undefined;
    }
    return [String(item.initial[0].valueCoding.code)];
  };

  const getDataReceiverValue = (answer: Array<QuestionnaireResponseItemAnswer>): (string | undefined)[] => {
    return answer.map((el: QuestionnaireResponseItemAnswer) => {
      if (el && el.valueCoding && el.valueCoding.display) {
        return el.valueCoding.display;
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

    return Array.isArray(value) ? value.map(el => getDisplay(getOptions(props.resources, item, containedResources), el)).join(', ') : value;
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(props.resources, props.item, props.containedResources), code);
    const system = systemArg ? systemArg : getSystem(props.item, code, props.containedResources);
    return { code, display, system };
  };

  const resetInitialAnswer = (code: string): void => {
    const { answer, promptLoginMessage, item, onAnswerChange, path } = props;
    if (dispatch && code) {
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
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
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
    }
  };

  const clearCodingAnswer = (coding: Coding): void => {
    const { promptLoginMessage, item, onAnswerChange, path } = props;
    if (dispatch) {
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { promptLoginMessage, item, onAnswerChange, path } = props;
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const renderCheckbox = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <CheckboxView
        options={options}
        id={props.id}
        handleChange={handleCheckboxChange}
        selected={getValue(props.item, props.answer)}
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
        onRenderMarkdown={props.onRenderMarkdown}
        {...props}
      >
        {props.children}
      </DropdownView>
    );
  };

  const renderRadio = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <RadioView
        options={options}
        getErrorMessage={(value: string): string => getErrorMessage(props.item, value, props.resources, props.containedResources)}
        handleChange={handleChange}
        validateInput={(value: string): boolean => validateInput(props.item, value, props.containedResources, props.resources)}
        id={props.id}
        selected={getValue(props.item, props.answer)}
        onRenderMarkdown={props.onRenderMarkdown}
        {...props}
      >
        {props.children}
      </RadioView>
    );
  };

  const renderSlider = (): JSX.Element => {
    return (
      <SliderView
        item={props.item}
        answer={props.answer}
        handleChange={handleChange}
        selected={getValue(props.item, props.answer)}
        path={props.path}
      >
        {props.children}
      </SliderView>
    );
  };

  const renderAutosuggest = (): JSX.Element => {
    return (
      <AutosuggestView
        handleChange={handleChange}
        id={props.id}
        clearCodingAnswer={clearCodingAnswer}
        onRenderMarkdown={props.onRenderMarkdown}
        {...props}
      >
        {props.children}
      </AutosuggestView>
    );
  };

  const renderReceiverComponent = (): JSX.Element => {
    return (
      <ReceiverComponentWrapper
        handleChange={handleChange}
        id={props.id}
        selected={getValue(props.item, props.answer)}
        clearCodingAnswer={clearCodingAnswer}
        fetchReceivers={props.fetchReceivers}
        {...props}
      >
        {props.children}
      </ReceiverComponentWrapper>
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
        renderAutosuggest,
        renderReceiverComponent
      )}
    </React.Fragment>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Choice);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
