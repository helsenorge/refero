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

import { ValidationProps } from '@helsenorge/form/components/form/validation';
import { Options } from '@helsenorge/form/components/radio-group';

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
  renderOptions,
  getOptions,
  getErrorMessage,
  validateInput,
  shouldShowExtraChoice,
  getDisplay,
  getSystem,
  getIndexOfAnswer,
  getItemControlValue,
} from '../../../util/choice';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import AutosuggestView from '../choice-common/autosuggest-view';
import TextView from '../textview';
import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import TextField from './text-field';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  resources?: Resources;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | undefined;
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
}

export class OpenChoice extends React.Component<Props & ValidationProps> {
  getDataReceiverValue = (answer: Array<QuestionnaireResponseItemAnswer>): (string | undefined)[] => {
    return answer
      .filter((f) => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding) {
          return el.valueCoding.display;
        }
        if (el && el.valueString) {
          return el.valueString;
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

    const displayValues = value.filter(el => el !== OPEN_CHOICE_ID).map(el => getDisplay(getOptions(resources, item, containedResources), el));
    const openValue = this.getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  };

  getOpenValue = (answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string | undefined => {
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

  getValue = (
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
      if (answer.valueCoding?.code === item.initial?.[0].valueCoding.code && answer.valueCoding?.display === undefined) {
        this.resetInitialAnswer(answer.valueCoding.code);
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

  handleStringChangeEvent = (event: React.FormEvent<{}>): void => {
    const value = (event.target as HTMLInputElement).value;
    this.handleStringChange(value);
  };

  handleStringChange = (value: string): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    if (dispatch) {
      if (value.length > 0) {
        dispatch(newCodingStringValueAsync(this.props.path, value, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
        );
      } else {
        dispatch(removeCodingStringValueAsync(this.props.path, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(this.props.resources, this.props.item, this.props.containedResources), code);
    const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(this.props.item, code, this.props.containedResources);
    const system = systemArg ? systemArg : valueSetSystem;
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
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(this.props.path, coding, item))?.then(newState =>
          onAnswerChange(newState, path, item, responseAnswer)
        );

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValueAsync(this.props.path, coding, this.props.item, true))?.then(newState =>
          onAnswerChange(newState, path, item, responseAnswer)
        );
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      this.interceptHandler(coding, getItemControlValue(item));
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
      dispatch(newCodingValueAsync(this.props.path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }

      this.interceptHandler(coding, getItemControlValue(item));
    }
  };

  interceptHandler = (coding: Coding, type: string | undefined): void => {
    switch (type) {
      case ItemControlConstants.CHECKBOX:
        return this.multiValueHandler(coding);
      default:
        return this.singleValueHandler(coding);
    }
  };

  singleValueHandler = (coding: Coding): void => {
    const { dispatch, item, path, onAnswerChange } = this.props;

    if (dispatch) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }
  };

  multiValueHandler = (coding: Coding): void => {
    const { dispatch, item, path, answer, onAnswerChange } = this.props;

    if (dispatch) {
      const isShown = shouldShowExtraChoice(answer);

      if (isShown && coding.code === OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }
  };

  renderTextField(): JSX.Element {
    const { id, pdf, item, answer, onRenderMarkdown, ...other } = this.props;
    
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
        handleStringChange={this.handleStringChangeEvent}
        onRenderMarkdown={onRenderMarkdown}
        resources={this.props.resources}
        {...other}
      />
    );
  }

  renderCheckbox = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <CheckboxView
        options={options}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        renderOpenField={(): JSX.Element => this.renderTextField()}
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
        renderOpenField={(): JSX.Element => this.renderTextField()}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </DropdownView>
    );
  };

  renderRadio = (options: Array<Options> | undefined): JSX.Element => {
    const { item, resources, containedResources, children, id, answer, repeatButton, ...rest } = this.props;
    return (
      <RadioView
        options={options}
        item={item}
        getErrorMessage={(value: string): string => getErrorMessage(item, value, resources, containedResources)}
        handleChange={this.handleChange}
        validateInput={(value: string): boolean => validateInput(item, value, containedResources, resources)}
        id={id}
        selected={this.getValue(item, answer)}
        repeatButton={repeatButton}
        renderOpenField={(): JSX.Element => this.renderTextField()}
        answer={answer}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...rest}
      >
        {children}
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
        handleStringChange={this.handleStringChange}
        {...this.props}
      >
        {this.props.children}
      </AutosuggestView>
    );
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const answerHasChanged = this.props.answer !== nextProps.answer;
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
        {renderOptions(item, containedResources, this.renderRadio, this.renderCheckbox, this.renderDropdown, this.props.resources, this.renderAutosuggest)}
      </React.Fragment>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(OpenChoice);
const connectedStringComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedStringComponent;
