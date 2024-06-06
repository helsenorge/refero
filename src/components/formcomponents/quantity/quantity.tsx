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
import { isReadOnly, getId, getSublabelText, isRequired, getDecimalPattern, getLabelText } from '../../../util/index';
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
  children?: React.ReactNode;
}

const Quantity = (props: Props): JSX.Element | null => {
  const getValue = (): number | number[] | undefined => {
    const { answer } = props;
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity.value);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  };

  const getPDFValue = (): string => {
    const value = getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (props.resources && props.resources.ikkeBesvart) {
        text = props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(m => `${m} ${getUnit()}`).join(', ');
    }
    return `${value} ${getUnit()}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const extension = getQuestionnaireUnitExtensionValue(props.item);
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
        dispatch(newQuantityValueAsync(props.path, quantity, props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(props.item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = props.responseItem !== nextProps.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== nextProps.isHelpOpen;
  //   const answerHasChanged = props.answer !== nextProps.answer;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(nextProps.resources);
  //   const repeats = props.item.repeats ?? false;
  //   const newErrorMessage = props.error?.message !== nextProps.error?.message;

  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  // }

  const { id, item, questionnaire, onRenderMarkdown, resources, error, control, idWithLinkIdAndItemIndex } = props;
  if (props.pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }
  const value = getValue();
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const decimalPattern = getDecimalPattern(item);
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  const errorMessage = getValidationTextExtension(item);

  return (
    <div className="page_refero__component page_refero__component_quantity">
      <FormGroup error={error?.message} mode="ongrey">
        {props.renderHelpElement()}
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
            ...(decimalPattern && {
              pattern: {
                value: new RegExp(decimalPattern),
                message: resources?.oppgiGyldigVerdi ?? 'Verdien er ikke et gyldig tall',
              },
            }),
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Input
              {...rest}
              value={value !== undefined ? value + '' : ''}
              label={
                <Label
                  htmlFor={getId(id)}
                  className="page_refero__label"
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  sublabel={<Sublabel id={`${getId(id)}-sublabel`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={props.renderHelpButton()}
                />
              }
              type="number"
              inputId={getId(id)}
              testId={getId(id)}
              placeholder={getPlaceholder(item)}
              className="page_refero__quantity"
              onChange={(e): void => {
                onChange(e.target.value);
                handleChange(e);
              }}
              width={7}
            />
          )}
        />
        <span className="page_refero__unit">{getUnit()}</span>
        {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        <div>{props.repeatButton}</div>
      </FormGroup>
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(Quantity);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
