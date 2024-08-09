import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';

import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDecimalValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getPlaceholder, getValidationTextExtension } from '@/util/extension';
import { isReadOnly, getId, getDecimalPattern, isRequired } from '@/util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderItemProps } from '@/components/QuestionnaireItems';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = RenderItemProps;

const Decimal = (props: Props): JSX.Element | null => {
  const { id, item, pdf, resources, children, idWithLinkIdAndItemIndex, path, onAnswerChange, responseItems, index, responseItem } = props;
  const { promptLoginMessage } = useExternalRenderContext();
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex || '', formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);

  const getValue = (
    item: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDecimal).filter(f => f !== undefined);
    }
    if (answer && answer.valueDecimal !== undefined && answer.valueDecimal !== null) {
      return answer.valueDecimal;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDecimal) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue(item, answer);
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    dispatch(newDecimalValueAsync(path || [], value, item))?.then(newState => {
      return onAnswerChange && onAnswerChange(newState, path || [], item, { valueDecimal: value } as QuestionnaireResponseItemAnswer);
    });

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const value = getValue(item, answer);
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
  const decimalPattern = getDecimalPattern(item);
  const maxValue = getMaxValueExtensionValue(item);
  const minValue = getMinValueExtensionValue(item);
  const validationText = getValidationTextExtension(item);

  return (
    <div className="page_refero__component page_refero__component_decimal">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-decimal`}
          testId={`${getId(id)}-decimal-label`}
          sublabelId={`${getId(id)}-decimal-sublabel`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Controller
          name={idWithLinkIdAndItemIndex || ''}
          control={control}
          shouldUnregister={true}
          defaultValue={value ? value + '' : ''}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
            },
            ...(maxValue && {
              max: {
                value: maxValue,
                message: validationText ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
              },
            }),
            ...(minValue && {
              min: {
                value: minValue,
                message: validationText ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
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
              type="number"
              inputId={getId(id)}
              name={getId(id)}
              value={value ? value + '' : ''}
              placeholder={getPlaceholder(item)}
              className="page_refero__input"
              onChange={(e): void => {
                handleChange(e);
                onChange(e.target.value);
              }}
              width={25}
            />
          )}
        />
      </FormGroup>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

const layoutChangeComponent = layoutChange(Decimal);
export default layoutChangeComponent;
