import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { GlobalState } from '../../../reducers';
import {
  NewValueAction,
  removeCodingValueAsync,
  newCodingValueAsync,
  newCodingStringValueAsync,
  removeCodingStringValueAsync,
} from '../../../actions/newValue';
import TextField from './text-field';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import {
  hasOptions,
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
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Resource, Coding, QuestionnaireResponseItem } from '../../../types/fhir';
import ItemControlConstants from '../../../constants/itemcontrol';
import { Resources } from '../../../util/resources';
import withCommonFunctions from '../../with-common-functions';
import CheckboxView from './checkbox-view';
import RadioView from './radio-view';
import DropdownView from './dropdown-view';
import { OPEN_CHOICE_ID } from '../../../constants';
import { isReadOnly } from '../../../util';
import TextView from '../textview';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
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
}

class OpenChoice extends React.Component<Props & ValidationProps> {
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

    const displayValues = value.filter(el => el !== OPEN_CHOICE_ID).map(el => getDisplay(getOptions(item, containedResources), el));
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

  handleStringChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const value = (event.target as HTMLInputElement).value;
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

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const display = getDisplay(getOptions(item, this.props.containedResources), code);
      const system = getSystem(item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
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

  handleChange = (code?: string): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const display = getDisplay(getOptions(item, this.props.containedResources), code);
      const system = getSystem(item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
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

  singleValueHandler = (coding: Coding) => {
    const { dispatch, item, path, onAnswerChange } = this.props;

    if (dispatch) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }
  };

  multiValueHandler = (coding: Coding) => {
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

  renderTextField() {
    const { id, pdf, item, answer, onRenderMarkdown, ...other } = this.props;

    let a = answer;
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i] as QuestionnaireResponseItemAnswer;
        if (el.valueString) {
          a = el;
          break;
        }
      }
    }

    return (
      <TextField
        id={id}
        pdf={pdf}
        item={item}
        answer={a}
        handleStringChange={this.handleStringChange}
        onRenderMarkdown={onRenderMarkdown}
        {...other}
      />
    );
  }

  renderCheckbox = (options: Array<Options> | undefined) => {
    return (
      <CheckboxView
        options={options}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        renderOpenField={() => this.renderTextField()}
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
        renderOpenField={() => this.renderTextField()}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </DropdownView>
    );
  };

  renderRadio = (options: Array<Options> | undefined) => {
    const { item, resources, containedResources, children, id, answer, repeatButton, optionalLabel, ...rest } = this.props;
    return (
      <RadioView
        options={options}
        item={item}
        getErrorMessage={(value: string) => getErrorMessage(item, value, resources, containedResources)}
        handleChange={this.handleChange}
        validateInput={(value: string) => validateInput(item, value, containedResources)}
        id={id}
        selected={this.getValue(item, answer)}
        repeatButton={repeatButton}
        renderOpenField={() => this.renderTextField()}
        answer={answer}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...rest}
      >
        {children}
      </RadioView>
    );
  };

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || repeats;
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
        {hasOptions(item, containedResources)
          ? renderOptions(
              item,
              containedResources,
              getOptions(item, containedResources),
              this.renderRadio,
              this.renderCheckbox,
              this.renderDropdown
            )
          : null}
      </React.Fragment>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(OpenChoice);
const connectedStringComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedStringComponent;
