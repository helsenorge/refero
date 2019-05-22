import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import TextField from './text-field';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newCodingStringValue, removeCodingStringValue, removeCodingValue, newCodingValue } from '../../../actions/newValue';
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
import { QuestionnaireItem, QuestionnaireResponseAnswer, Resource, Coding, QuestionnaireResponseItem } from '../../../types/fhir';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import ItemControlConstants from '../../../constants/itemcontrol';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
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
  answer: QuestionnaireResponseAnswer;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  dispatch?: Dispatch<{}>;
  resources?: Resources;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | undefined;
  headerTag?: number;
  responseItem?: Array<QuestionnaireResponseItem>;
  repeatButton: JSX.Element;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
}

class OpenChoice extends React.Component<Props & ValidationProps> {
  getPDFValue = (item: QuestionnaireItem, answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer): string => {
    const { resources, containedResources } = this.props;

    const value = this.getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    let displayValues = value.filter(el => el !== OPEN_CHOICE_ID).map(el => getDisplay(getOptions(item, containedResources), el));
    let openValue = this.getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  };

  getOpenValue = (answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer): string | undefined => {
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        let el = answer[i];
        if (el.valueString) {
          return el.valueString;
        }
      }
    }

    return;
  };

  getValue = (
    item: QuestionnaireItem,
    answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseAnswer) => {
        if (el) {
          if (el.valueCoding && el.valueCoding.code) {
            return el.valueCoding.code;
          }
        }
      });
    } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code) {
      return [answer.valueCoding.code];
    }
    if (!item || !item.initialCoding || !item.initialCoding.code) {
      return undefined;
    }
    return [String(item.initialCoding.code)];
  };

  handleStringChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage } = this.props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      if (value.length > 0) {
        dispatch(newCodingStringValue(this.props.path, value, this.props.item));
      } else {
        dispatch(removeCodingStringValue(this.props.path, this.props.item));
      }
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage, item } = this.props;
    if (dispatch && code) {
      let display = getDisplay(getOptions(item, this.props.containedResources), code);
      const system = getSystem(item, this.props.containedResources);
      let coding = { code, display, system } as Coding;
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValue(this.props.path, coding, item));

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValue(this.props.path, coding, this.props.item, true));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      this.interceptHandler(coding, getItemControlValue(item));
    }
  };

  handleChange = (code?: string): void => {
    const { dispatch, promptLoginMessage, item } = this.props;
    if (dispatch && code) {
      const display = getDisplay(getOptions(item, this.props.containedResources), code);
      const system = getSystem(item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
      dispatch(newCodingValue(this.props.path, coding, item));
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
    const { dispatch, item, path } = this.props;

    if (dispatch) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValue(path, item));
      }
    }
  };

  multiValueHandler = (coding: Coding) => {
    const { dispatch, item, path, answer } = this.props;

    if (dispatch) {
      var isShown = shouldShowExtraChoice(answer);

      if (isShown && coding.code === OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValue(path, item));
      }
    }
  };

  renderTextField() {
    const { id, pdf, item, answer, ...other } = this.props;

    let a = answer;
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        let el = answer[i] as QuestionnaireResponseAnswer;
        if (el.valueString) {
          a = el;
          break;
        }
      }
    }

    return <TextField id={id} pdf={pdf} item={item} answer={a} handleStringChange={this.handleStringChange} {...other} />;
  }

  renderCheckbox = (options: Array<Options> | undefined) => {
    return (
      <CheckboxView
        options={options}
        item={this.props.item}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        children={this.props.children}
        repeatButton={this.props.repeatButton}
        renderOpenField={() => this.renderTextField()}
        {...this.props}
      />
    );
  };

  renderDropdown = (options: Array<Options> | undefined) => {
    return (
      <DropdownView
        options={options}
        item={this.props.item}
        id={this.props.id}
        handleChange={this.handleChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        validateInput={(value: string) => validateInput(this.props.item, value, this.props.containedResources)}
        resources={this.props.resources}
        children={this.props.children}
        repeatButton={this.props.repeatButton}
        renderOpenField={() => this.renderTextField()}
        {...this.props}
      />
    );
  };

  renderRadio = (options: Array<Options> | undefined) => {
    const { item, resources, containedResources, children, id, answer, repeatButton, optionalLabel, ...rest } = this.props;
    return (
      <RadioView
        options={options}
        item={item}
        getErrorMessage={(value: string) => getErrorMessage(item, value, resources, containedResources)}
        children={children}
        handleChange={this.handleChange}
        validateInput={(value: string) => validateInput(item, value, containedResources)}
        id={id}
        selected={this.getValue(item, answer)}
        repeatButton={repeatButton}
        renderOpenField={() => this.renderTextField()}
        answer={answer}
        {...rest}
      />
    );
  };

  render(): JSX.Element | null {
    const { item, pdf, answer, containedResources, children } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={this.getPDFValue(item, answer)} children={children} />;
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
const connectedStringComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedStringComponent;
