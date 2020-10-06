import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import withCommonFunctions from '../../with-common-functions';
import { NewValueAction, newCodingValueAsync, removeCodingValueAsync } from '../../../actions/newValue';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Resource,
  Coding,
  QuestionnaireResponseItem,
  ValueSet,
} from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { isReadOnly } from '../../../util/index';
import { getOptions, getSystem, getErrorMessage, validateInput, getIndexOfAnswer, getDisplay, renderOptions } from '../../../util/choice';
import TextView from '../textview';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import CheckboxView from './checkbox-view';
import { GlobalState } from '../../../reducers';
import AutosuggestView from './autosuggest-view';
import { AutoSuggestProps } from '../../../types/autoSuggestProps';

export interface ChoiceProps {
  item: QuestionnaireItem;
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
  renderDeleteButton: () => JSX.Element | undefined;
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
}

interface ChoiceState {
  valid: boolean;
  validated: boolean;
}

export class Choice extends React.Component<ChoiceProps & ValidationProps, ChoiceState> {
  constructor(props: ChoiceProps & ValidationProps) {
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

  getPDFValue = (item: QuestionnaireItem, answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string => {
    const { resources, containedResources } = this.props;

    const value = this.getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    return value.map(el => getDisplay(getOptions(item, containedResources), el)).join(', ');
  };

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const display = getDisplay(getOptions(item, this.props.containedResources), code);
      const system = getSystem(item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
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
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const display = displayArg ? displayArg : getDisplay(getOptions(item, this.props.containedResources), code);
      const system = systemArg ? systemArg : getSystem(item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  renderCheckbox = (options: Array<Options> | undefined) => {
    return (
      <CheckboxView
        options={options}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </CheckboxView>
    );
  };

  renderDropdown = (options: Array<Options> | undefined) => {
    return (
      <DropdownView
        options={options}
        id={this.props.id}
        handleChange={this.handleChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        validateInput={(value: string) => validateInput(this.props.item, value, this.props.containedResources)}
        resources={this.props.resources}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </DropdownView>
    );
  };

  renderRadio = (options: Array<Options> | undefined) => {
    return (
      <RadioView
        options={options}
        getErrorMessage={(value: string) => getErrorMessage(this.props.item, value, this.props.resources, this.props.containedResources)}
        handleChange={this.handleChange}
        validateInput={(value: string) => validateInput(this.props.item, value, this.props.containedResources)}
        id={this.props.id}
        selected={this.getValue(this.props.item, this.props.answer)}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </RadioView>
    );
  };

  renderAutosuggest = (): JSX.Element => {
    return (
      <AutosuggestView
        handleChange={this.handleChange}
        id={this.props.id}
        clearCodingAnswer={this.clearCodingAnswer}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </AutosuggestView>
    );
  };

  shouldComponentUpdate(nextProps: ChoiceProps, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = this.props.resources !== nextProps.resources;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { item, pdf, answer, containedResources, children, onRenderMarkdown } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView item={item} value={this.getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
          {children}
        </TextView>
      );
    }
    return (
      <React.Fragment>
        {renderOptions(item, containedResources, this.renderRadio, this.renderCheckbox, this.renderDropdown, this.renderAutosuggest)}
      </React.Fragment>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Choice);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
