import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction, newQuantityValueAsync } from '../../../actions/newValue';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import withCommonFunctions from '../../with-common-functions';
import { isReadOnly, isRequired, getId, renderPrefix, getText, getDecimalPattern } from '../../../util/index';
import {
  getValidationTextExtension,
  getPlaceholder,
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
      const quantity = {
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as QuantityType;

      const value = Number(parseFloat((event.target as HTMLInputElement).value));
      if (value != null && !Number.isNaN(value) && Number.isFinite(value)) {
        quantity.value = (value as unknown) as decimal;
      }

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
            pattern={getDecimalPattern(item)}
            className="page_skjemautfyller__quantity"
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
