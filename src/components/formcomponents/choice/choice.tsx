import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Resource,
  Coding,
  QuestionnaireResponseItem,
  ValueSet,
} from '../../../types/fhir';
import { OrgenhetHierarki } from '../../../types/orgenhetHierarki';

import { ValidationProps } from '@helsenorge/form/components/form/validation';
import { Options } from '@helsenorge/form/components/radio-group';

import { NewValueAction, newCodingValueAsync, removeCodingValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getOptions, getSystem, getErrorMessage, validateInput, getIndexOfAnswer, getDisplay, renderOptions } from '../../../util/choice';
import { isReadOnly, isDataReceiver } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import AutosuggestView from '../choice-common/autosuggest-view';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';
import TextView from '../textview';
import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';

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
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
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
      if (answer.valueCoding?.code === item.initial?.[0].valueCoding.code && answer.valueCoding?.display === undefined) {
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

  getPDFValue = (item: QuestionnaireItem, answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string => {
    const { resources, containedResources } = this.props;

    if (isDataReceiver(item)) {
      return this.getDataReceiverValue(answer as Array<QuestionnaireResponseItemAnswer>).join(', ');
    }

    const value = this.getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    return Array.isArray(value) ? value.map(el => getDisplay(getOptions(this.props.resources, item, containedResources), el)).join(', ') : value;
  };

  getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(this.props.resources, this.props.item, this.props.containedResources), code);
    const system = systemArg ? systemArg : getSystem(this.props.item, code, this.props.containedResources);
    return { code, display, system } as Coding;
  }

  resetInitialAnswer = (code: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding  } as QuestionnaireResponseItemAnswer;
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
      const responseAnswer = { valueCoding: coding  } as QuestionnaireResponseItemAnswer;
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
      const coding = this.getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  renderCheckbox = (options: Array<Options> | undefined): JSX.Element => {
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

  renderDropdown = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <DropdownView
        options={options}
        id={this.props.id}
        handleChange={this.handleChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        validateInput={(value: string): boolean => validateInput(this.props.item, value, this.props.containedResources, this.props.resources)}
        resources={this.props.resources}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </DropdownView>
    );
  };

  renderRadio = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <RadioView
        options={options}
        getErrorMessage={(value: string): string =>
          getErrorMessage(this.props.item, value, this.props.resources, this.props.containedResources)
        }
        handleChange={this.handleChange}
        validateInput={(value: string): boolean => validateInput(this.props.item, value, this.props.containedResources, this.props.resources)}
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

  renderReceiverComponent = (): JSX.Element => {
    return (
      <ReceiverComponentWrapper
        handleChange={this.handleChange}
        id={this.props.id}
        selected={this.getValue(this.props.item, this.props.answer)}
        clearCodingAnswer={this.clearCodingAnswer}
        fetchReceivers={this.props.fetchReceivers}
        {...this.props}
      >
        {this.props.children}
      </ReceiverComponentWrapper>
    );
  };

  shouldComponentUpdate(nextProps: ChoiceProps): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  render(): JSX.Element | null {
    const { id, item, pdf, answer, containedResources, children, onRenderMarkdown } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView id={id} item={item} value={this.getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
          {children}
        </TextView>
      );
    }
    return (
      <React.Fragment>
        {renderOptions(
          item,
          containedResources,
          this.renderRadio,
          this.renderCheckbox,
          this.renderDropdown,
          this.props.resources,
          this.renderAutosuggest,
          this.renderReceiverComponent
        )}
      </React.Fragment>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Choice);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
