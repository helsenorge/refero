import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import withCommonFunctions from '../../with-common-functions';
import { newCodingValue, removeCodingValue } from '../../../actions/newValue';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import Constants from '../../../constants/index';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Resource, Coding, QuestionnaireResponseItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { isRequired, isReadOnly } from '../../../util/index';
import { getValidationTextExtension, getItemControlExtensionValue } from '../../../util/extension';
import { getOptions, hasOptions, getSystem } from '../../../util/choice';
import itemControlConstants from '../../../constants/itemcontrol';
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

  getValue = () => {
    const { item, answer } = this.props;
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

  getPDFValue = () => {
    const value = this.getValue();
    if (!value) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }

    return value.map(el => this.getDisplay(getOptions(this.props.item, this.props.containedResources), el)).join(', ');
  };

  getDisplay = (options: Array<Options> | undefined, value: string | undefined): string | undefined => {
    if (!options || options.length === 0) {
      return undefined;
    }
    let display;
    options.forEach(o => {
      if (o.type === value) {
        display = o.label;
        return;
      }
    });
    return display;
  };

  getIndexOfAnswer = (code: string, answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer) => {
    if (answer && Array.isArray(answer)) {
      return answer.findIndex(el => {
        if (el && el.valueCoding && el.valueCoding.code) {
          return el.valueCoding.code === code;
        }
        return false;
      });
    } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code === code) {
      return 0;
    }
    return -1;
  };

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage } = this.props;
    if (dispatch && code) {
      let display = this.getDisplay(getOptions(this.props.item, this.props.containedResources), code);
      const system = getSystem(this.props.item, this.props.containedResources);
      let coding = { code, display, system } as Coding;
      if (this.getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValue(this.props.path, coding, this.props.item));

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
    const { dispatch, promptLoginMessage } = this.props;
    if (dispatch && code) {
      const display = this.getDisplay(getOptions(this.props.item, this.props.containedResources), code);
      const system = getSystem(this.props.item, this.props.containedResources);
      const coding = { code, display, system } as Coding;
      dispatch(newCodingValue(this.props.path, coding, this.props.item));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  isAllowedValue = (value: string | undefined): boolean => {
    const { item, containedResources } = this.props;
    if (!item) {
      return true;
    }

    if (item.options || item.options) {
      const allowedValues: Array<Options> | undefined = getOptions(item, containedResources);
      if (!allowedValues || allowedValues.length === 0) {
        return true;
      }

      const matches = allowedValues.filter((a: Options) => a.type === value);
      return matches.length > 0;
    }

    return true;
  };

  validateInput = (value: string | undefined) => {
    if (isRequired(this.props.item) && !value) {
      return false;
    }
    if (!this.isAllowedValue(value)) {
      return false;
    }
    return true;
  };

  getErrorMessage = (value: string): string => {
    const { resources, item } = this.props;
    if (!resources || !item) {
      return '';
    }
    const extensionText = getValidationTextExtension(item);
    if (extensionText) {
      return extensionText;
    }
    if (!value && isRequired(this.props.item) && resources) {
      return resources.oppgiVerdi;
    }
    if (!this.isAllowedValue(value)) {
      return resources.oppgiGyldigVerdi;
    }
    return '';
  };

  getItemControlValue = () => {
    const itemControl = getItemControlExtensionValue(this.props.item);
    if (itemControl) {
      for (let i = 0; i < itemControl.length; i++) {
        if (itemControl[i] && itemControl[i].code) {
          if (itemControl[i].code === itemControlConstants.CHECKBOX) {
            return itemControlConstants.CHECKBOX;
          }
          if (itemControl[i].code === itemControlConstants.DROPDOWN) {
            return itemControlConstants.DROPDOWN;
          }
          if (itemControl[i].code === itemControlConstants.RADIOBUTTON) {
            return itemControlConstants.RADIOBUTTON;
          }
        }
      }
    }
    return undefined;
  };

  isAboveDropdownThreshold = (): boolean => {
    const options = getOptions(this.props.item, this.props.containedResources);
    if (!options) {
      return false;
    }
    return options.length > Constants.CHOICE_DROPDOWN_TRESHOLD;
  };

  renderCheckbox = (options: Array<Options> | undefined) => {
    return (
      <CheckboxView
        options={options}
        item={this.props.item}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue()}
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
        selected={this.getValue()}
        validateInput={this.validateInput}
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
        getErrorMessage={this.getErrorMessage}
        children={this.props.children}
        handleChange={this.handleChange}
        validateInput={this.validateInput}
        id={this.props.id}
        selected={this.getValue()}
        repeatButton={this.props.repeatButton}
        {...this.props}
      />
    );
  };

  renderOptions = (options: Array<Options> | undefined): JSX.Element | null => {
    const itemControlValue = this.getItemControlValue();
    if (itemControlValue) {
      switch (itemControlValue) {
        case itemControlConstants.DROPDOWN:
          return this.renderDropdown(options);
        case itemControlConstants.CHECKBOX:
          return this.renderCheckbox(options);
        case itemControlConstants.RADIOBUTTON:
          return this.renderRadio(options);
        default:
          break;
      }
    } else if (this.isAboveDropdownThreshold()) {
      return this.renderDropdown(options);
    }
    return this.renderRadio(options);
  };

  render(): JSX.Element | null {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return <TextView item={this.props.item} value={this.getPDFValue()} children={this.props.children} />;
    }
    return (
      <React.Fragment>
        {hasOptions(this.props.item, this.props.containedResources)
          ? this.renderOptions(getOptions(this.props.item, this.props.containedResources))
          : null}
      </React.Fragment>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Choice);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
