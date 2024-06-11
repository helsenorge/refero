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
import { OrgenhetHierarki } from '../../../types/orgenhetHierarki';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import SliderView from './slider-view';
import { NewValueAction, newCodingValueAsync, removeCodingValueAsync } from '../../../actions/newValue';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import {
  getOptions,
  getSystem,
  getIndexOfAnswer,
  getDisplay,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '../../../util/choice';
import { isReadOnly, isDataReceiver } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import AutosuggestView from '../choice-common/autosuggest-view';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';
import TextView from '../textview';

export interface ChoiceProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  resources?: Resources;
  containedResources?: Resource[];
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  headerTag?: number;
  responseItem: QuestionnaireResponseItem;
  renderDeleteButton: () => JSX.Element | null;
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
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  children?: React.ReactNode;
}

export const Choice = (props: ChoiceProps): JSX.Element | null => {
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
      if (answer.valueCoding?.code === item.initial?.[0]?.valueCoding?.code && answer.valueCoding?.display === undefined) {
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

  const getPDFValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string => {
    const { resources, containedResources } = props;

    if (isDataReceiver(item) && Array.isArray(answer)) {
      return getDataReceiverValue(answer).join(', ');
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
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = props;
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
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = props;
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
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = props;
    if (dispatch) {
      const responseAnswer = { valueCoding: coding };
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = props;
    if (dispatch && code) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };

      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  // shouldComponentUpdate(nextProps: ChoiceProps): boolean {
  //   const responseItemHasChanged = props.responseItem !== nextProps.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== nextProps.isHelpOpen;
  //   const answerHasChanged = props.answer !== nextProps.answer;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(nextProps.resources);
  //   const repeats = props.item.repeats ?? false;
  //   const error = props.error?.message !== nextProps.error?.message;
  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || error;
  // }
  const renderComponentBasedOnType = (): JSX.Element | null => {
    const { resources, item, containedResources, answer } = props;
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) {
      return null;
    }
    const options = getOptions(resources, item, containedResources);

    const commonProps = {
      handleChange: handleChange,
      selected: getValue(item, answer),
      ...props,
    };

    const componentMap = {
      [itemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [itemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} handleChange={handleCheckboxChange} />,
      [itemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [itemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };

  const { id, item, pdf, answer, containedResources, children, onRenderMarkdown, resources } = props;
  const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
  const options = getOptions(resources, item, containedResources);
  const aboveDropdownThreshold = isAboveDropdownThreshold(options);
  const itemControlValue = getItemControlValue(item);
  const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE;
  const isReceiverComponent = itemControlValue === itemControlConstants.RECEIVERCOMPONENT;
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
          <DropdownView options={options} handleChange={handleChange} selected={value} {...props}>
            {children}
          </DropdownView>
        ) : (
          <RadioView options={options} handleChange={handleChange} selected={value} {...props}>
            {children}
          </RadioView>
        )
      ) : shouldRenderAutosuggest ? (
        <AutosuggestView handleChange={handleChange} clearCodingAnswer={clearCodingAnswer} {...props}>
          {children}
        </AutosuggestView>
      ) : isReceiverComponent ? (
        <ReceiverComponentWrapper
          {...props}
          handleChange={handleChange}
          selected={getValue(props.item, props.answer)}
          clearCodingAnswer={clearCodingAnswer}
        >
          {props.children}
        </ReceiverComponentWrapper>
      ) : null}
    </React.Fragment>
  );
};

const withFormProps = ReactHookFormHoc(Choice);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
