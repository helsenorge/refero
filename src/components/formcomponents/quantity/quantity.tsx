import * as React from 'react';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity as QuantityType,
  QuestionnaireResponseItem,
  Questionnaire,
} from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newQuantityValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import {
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getPlaceholder,
  getQuestionnaireUnitExtensionValue,
  getValidationTextExtension,
} from '../../../util/extension';
import { isReadOnly, getId, getSublabelText, renderPrefix, getText, isRequired, getDecimalPattern } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Quantity extends React.Component<Props> {
  getValue(): number | number[] | undefined {
    const { answer } = this.props;
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity.value);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  }

  getPDFValue(): string {
    const value = this.getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(m => `${m} ${this.getUnit()}`).join(', ');
    }
    return `${value} ${this.getUnit()}`;
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const extension = getQuestionnaireUnitExtensionValue(this.props.item);
    if (extension) {
      const quantity = {
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as QuantityType;

      const value = Number(parseFloat(event.target.value));
      if (value != null && !isNaN(value) && isFinite(value)) {
        quantity.value = value;
      }

      if (dispatch) {
        dispatch(newQuantityValueAsync(this.props.path, quantity, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(this.props.item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;
    const newErrorMessage = this.props.error?.message !== nextProps.error?.message;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  }

  render(): JSX.Element | null {
    const { id, item, questionnaire, onRenderMarkdown, resources, error, control, idWithLinkIdAndItemIndex } = this.props;
    if (this.props.pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={this.props.item}
          value={this.getPDFValue()}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }
    const value = this.getValue();
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const decimalPattern = getDecimalPattern(item);
    const minValue = getMinValueExtensionValue(item);
    const maxValue = getMaxValueExtensionValue(item);
    const errorMessage = getValidationTextExtension(item);
    return (
      <div className="page_refero__component page_refero__component_quantity">
        <FormGroup error={error?.message} mode="ongrey">
          {this.props.renderHelpElement()}
          <Controller
            name={idWithLinkIdAndItemIndex}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
              },

              ...(maxValue && {
                max: {
                  value: maxValue,
                  message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
                },
              }),
              ...(minValue && {
                min: {
                  value: minValue,
                  message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
                },
              }),
              ...(decimalPattern && { pattern: new RegExp(decimalPattern), message: 'Verdien er ikke tilatt' }),
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <Input
                {...rest}
                value={value !== undefined ? value + '' : ''}
                label={
                  <Label
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                    afterLabelChildren={this.props.renderHelpButton()}
                  />
                }
                type="number"
                inputId={getId(id)}
                testId={getId(id)}
                placeholder={getPlaceholder(item)}
                className="page_refero__quantity"
                onChange={(e): void => {
                  onChange(e.target.value);
                  this.handleChange(e);
                }}
                width={7}
              />
            )}
          />
          <span className="page_refero__unit">{this.getUnit()}</span>
          {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
          <div>{this.props.repeatButton}</div>
        </FormGroup>
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withFormProps = ReactHookFormHoc(Quantity);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
