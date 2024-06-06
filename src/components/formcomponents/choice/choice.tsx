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
}

interface ChoiceState {
  valid: boolean;
  validated: boolean;
}

export class Choice extends React.Component<ChoiceProps, ChoiceState> {
  constructor(props: ChoiceProps) {
    super(props);

    this.state = {
      valid: true,
      validated: false,
    };
  }

  getValue = (
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
        this.resetInitialAnswer(answer.valueCoding.code);
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

  getDataReceiverValue = (answer: Array<QuestionnaireResponseItemAnswer>): (string | undefined)[] => {
    return answer.map((el: QuestionnaireResponseItemAnswer) => {
      if (el && el.valueCoding && el.valueCoding.display) {
        return el.valueCoding.display;
      }
    });
  };

  getPDFValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string => {
    const { resources, containedResources } = this.props;

    if (isDataReceiver(item) && Array.isArray(answer)) {
      return this.getDataReceiverValue(answer).join(', ');
    }

    const value = this.getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    return Array.isArray(value)
      ? value.map(el => getDisplay(getOptions(this.props.resources, item, containedResources), el)).join(', ')
      : value;
  };

  getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg
      ? displayArg
      : getDisplay(getOptions(this.props.resources, this.props.item, this.props.containedResources), code);
    const system = systemArg ? systemArg : getSystem(this.props.item, code, this.props.containedResources);
    return { code, display, system };
  };

  resetInitialAnswer = (code: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code);
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

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code);
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

  clearCodingAnswer = (coding: Coding): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch) {
      const responseAnswer = { valueCoding: coding };
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };

      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  shouldComponentUpdate(nextProps: ChoiceProps): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;
    const error = this.props.error?.message !== nextProps.error?.message;
    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || error;
  }
  renderComponentBasedOnType = (): JSX.Element | null => {
    const { resources, item, containedResources, answer } = this.props;
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) {
      return null;
    }
    const options = getOptions(resources, item, containedResources);

    const commonProps = {
      handleChange: this.handleChange,
      selected: this.getValue(item, answer),
      ...this.props,
    };

    const componentMap = {
      [itemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [itemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} handleChange={this.handleCheckboxChange} />,
      [itemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [itemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };
  render(): JSX.Element | null {
    const { id, item, pdf, answer, containedResources, children, onRenderMarkdown, resources } = this.props;
    const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
    const options = getOptions(resources, item, containedResources);
    const aboveDropdownThreshold = isAboveDropdownThreshold(options);
    const itemControlValue = getItemControlValue(item);
    const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE;
    const isReceiverComponent = itemControlValue === itemControlConstants.RECEIVERCOMPONENT;
    const getValue = this.getValue(item, answer);

    if (pdf || isReadOnly(item)) {
      return (
        <TextView id={id} item={item} value={this.getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
          {children}
        </TextView>
      );
    }

    return (
      <React.Fragment>
        {hasOptionsAndNoCanonicalValueSet ? (
          itemControlValue ? (
            this.renderComponentBasedOnType()
          ) : aboveDropdownThreshold ? (
            <DropdownView options={options} handleChange={this.handleChange} selected={getValue} {...this.props}>
              {children}
            </DropdownView>
          ) : (
            <RadioView options={options} handleChange={this.handleChange} selected={getValue} {...this.props}>
              {children}
            </RadioView>
          )
        ) : shouldRenderAutosuggest ? (
          <AutosuggestView handleChange={this.handleChange} clearCodingAnswer={this.clearCodingAnswer} {...this.props}>
            {children}
          </AutosuggestView>
        ) : isReceiverComponent ? (
          <ReceiverComponentWrapper
            handleChange={this.handleChange}
            selected={this.getValue(this.props.item, this.props.answer)}
            clearCodingAnswer={this.clearCodingAnswer}
            {...this.props}
          >
            {this.props.children}
          </ReceiverComponentWrapper>
        ) : null}
      </React.Fragment>
    );
  }
}

const withFormProps = ReactHookFormHoc(Choice);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
