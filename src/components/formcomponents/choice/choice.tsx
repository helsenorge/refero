import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import withCommonFunctions from '../../with-common-functions';
import { newCodingValue, removeCodingValue } from '../../../actions/newValue';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Resource, Coding, QuestionnaireResponseItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { isReadOnly } from '../../../util/index';
import {
  getOptions,
  hasOptions,
  getSystem,
  getErrorMessage,
  validateInput,
  getIndexOfAnswer,
  getDisplay,
  renderOptions,
} from '../../../util/choice';
import TextView from '../textview';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import CheckboxView from './checkbox-view';

export interface ChoiceProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer;
  resources?: Resources;
  containedResources?: Resource[];
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  headerTag?: number;
  responseItem?: Array<QuestionnaireResponseItem>;
  renderDeleteButton: () => JSX.Element | undefined;
  repeatButton: JSX.Element;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
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
    answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseAnswer) => {
        if (el && el.valueCoding && el.valueCoding.code) {
          return el.valueCoding.code;
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

    return value.map(el => getDisplay(getOptions(item, containedResources), el)).join(', ');
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
    }
  };

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
        {...this.props}
      />
    );
  };

  renderRadio = (options: Array<Options> | undefined) => {
    return (
      <RadioView
        options={options}
        item={this.props.item}
        getErrorMessage={(value: string) => getErrorMessage(this.props.item, value, this.props.resources, this.props.containedResources)}
        children={this.props.children}
        handleChange={this.handleChange}
        validateInput={(value: string) => validateInput(this.props.item, value, this.props.containedResources)}
        id={this.props.id}
        selected={this.getValue(this.props.item, this.props.answer)}
        repeatButton={this.props.repeatButton}
        {...this.props}
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

const withCommonFunctionsComponent = withCommonFunctions(Choice);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedComponent;
