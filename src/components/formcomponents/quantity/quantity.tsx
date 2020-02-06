import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction, newQuantityValueAsync } from '../../../actions/newValue';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import ExtensionConstants from '../../../constants/extensions';
import { Extension } from '../../../types/fhir';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import withCommonFunctions from '../../with-common-functions';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import {
  getValidationTextExtension,
  getPlaceholder,
  getExtension,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getQuestionnaireUnitExtensionValue,
} from '../../../util/extension';

import { QuestionnaireItem, QuestionnaireResponseAnswer, Quantity as QuantityType, decimal, code } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
}
interface QuantityInputFieldProps {
  step?: string;
  onKeyPress: (e: React.KeyboardEvent<{}>) => void;
}

class Quantity extends React.Component<Props & ValidationProps, {}> {
  getValue() {
    const { answer } = this.props;
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  }

  getPDFValue() {
    const value = this.getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return `${value} ${this.getUnit()}`;
  }

  handleChange = (event: React.FormEvent<{}>) => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const extension = getQuestionnaireUnitExtensionValue(this.props.item);
    if (extension) {
      const value = Number(parseFloat((event.target as HTMLInputElement).value));
      const code = extension.code;
      const quantity = {
        value: (value as unknown) as decimal,
        unit: extension.display,
        system: extension.system,
        code: (code as unknown) as code,
      } as QuantityType;
      if (dispatch) {
        dispatch(newQuantityValueAsync(this.props.path, quantity, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getUnit = () => {
    const valueCoding = getQuestionnaireUnitExtensionValue(this.props.item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  inputProps() {
    const props: QuantityInputFieldProps = {
      onKeyPress: (e: React.KeyboardEvent<{}>) => {
        const key = String.fromCharCode(e.which);
        if ('0123456789-.,'.indexOf(key) === -1) {
          e.preventDefault();
        }
      },
    };
    const step = getExtension(ExtensionConstants.STEP_URL, this.props.item);
    if (step && step.valueInteger) {
      props.step = this.getStepInputProp(step);
    } else {
      props.step = 'any';
    }
    return props;
  }

  getStepInputProp(stepExtension: Extension): string {
    const step: number = Number(stepExtension.valueInteger);
    if (step === 0) {
      return '1';
    }
    let stepAsString = '';
    for (let i = 1; i < step; i++) {
      stepAsString += '0';
    }
    return `0.${stepAsString}1`;
  }

  render(): JSX.Element | null {
    const { item } = this.props;
    if (this.props.pdf || isReadOnly(item)) {
      return (
        <TextView item={this.props.item} value={this.getPDFValue()}>
          {this.props.children}
        </TextView>
      );
    }
    const value = this.getValue();
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_quantity">
        <Validation {...this.props}>
          <SafeInputField
            size="xSmall"
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value !== undefined ? value + '' : ''}
            showLabel={true}
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            max={getMaxValueExtensionValue(item)}
            min={getMinValueExtensionValue(item)}
            onBlur={this.handleChange}
            errorMessage={getValidationTextExtension(item)}
            className="page_skjemautfyller__quantity"
            inputProps={this.inputProps()}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
          >
            <span className="page_skjemautfyller__unit">{this.getUnit()}</span>
          </SafeInputField>
        </Validation>
        <div>{this.props.repeatButton}</div>
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Quantity);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
