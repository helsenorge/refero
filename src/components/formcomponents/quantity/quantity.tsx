import { useState } from 'react';

import { QuestionnaireResponseItemAnswer, Quantity as QuantityType } from 'fhir/r4';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
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

import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = QuestionnaireComponentItemProps;

const Quantity = (props: Props): JSX.Element | null => {
  const { path, item, id, resources, pdf, idWithLinkIdAndItemIndex, responseItems, index, children, responseItem } = props;
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);

  const getValue = (
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): number | number[] | undefined | string => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity?.value).filter(f => f !== undefined);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  };

  const getPDFValue = (): string => {
    const value = getValue(answer);
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
    const quantity: QuantityType = {
      unit: extension?.display,
      system: extension?.system,
      code: extension?.code,
    };

    const value = Number(parseFloat(event.target.value));
    if (value !== null && !isNaN(value) && isFinite(value)) {
      quantity.value = value;
    }

    dispatch(newQuantityValueAsync(path || [], quantity, item))?.then(newState =>
      onAnswerChange(newState, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
    );

    if (promptLoginMessage) {
      promptLoginMessage();
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
  const value = getValue(answer);
  const decimalPattern = getDecimalPattern(item);
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  const errorMessage = getValidationTextExtension(item);
  return (
    <div className="page_refero__component page_refero__component_quantity">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
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
          responseItem={responseItem}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Quantity;
