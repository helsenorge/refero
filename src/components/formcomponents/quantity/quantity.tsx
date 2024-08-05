import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity as QuantityType, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { NewValueAction, newQuantityValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import {
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getPlaceholder,
  getQuestionnaireUnitExtensionValue,
  getValidationTextExtension,
} from '@/util/extension';
import { isReadOnly, getId, isRequired, getDecimalPattern } from '@/util/index';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  children?: React.ReactNode;
}

const Quantity = ({
  promptLoginMessage,
  path,
  item,
  onAnswerChange,
  id,
  questionnaire,
  resources,
  error,
  pdf,
  idWithLinkIdAndItemIndex,
  responseItems,
  renderContext,
  index,
  children,
  responseItem,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem);
  const enable = useIsEnabled(item, path);
  const getValue = (): number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity?.value).filter(f => f !== undefined);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  };

  const getPDFValue = (): string => {
    const value = getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(m => `${m} ${getUnit()}`).join(', ');
    }
    return `${value} ${getUnit()}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const extension = getQuestionnaireUnitExtensionValue(item);
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
        dispatch(newQuantityValueAsync(path, quantity, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };
  if (!enable) {
    return null;
  }
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }
  const value = getValue();
  const decimalPattern = getDecimalPattern(item);
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  const errorMessage = getValidationTextExtension(item);

  return (
    <div className="page_refero__component page_refero__component_quantity">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-quantity-label`}
          testId={`${getId(id)}-quantity-label`}
          sublabelId={`${getId(id)}-quantity-sublabel`}
          afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
        />
        <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />

        <Controller
          name={idWithLinkIdAndItemIndex}
          shouldUnregister={true}
          defaultValue={value}
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
            <>
              <Input
                {...rest}
                value={value !== undefined ? value + '' : ''}
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
              <span className="page_refero__unit">{getUnit()}</span>
            </>
          )}
        />
        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
          onAnswerChange={onAnswerChange}
          renderContext={renderContext}
          responseItem={responseItem}
          resources={resources}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton path={path.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(Quantity);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
export default withCommonFunctionsComponent;
