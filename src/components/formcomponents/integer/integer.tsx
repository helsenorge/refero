import React, { useState } from 'react';

import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '@/util/extension';
import { isReadOnly, isRequired, getId } from '@/util/index';

import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderItemProps } from '@/components/QuestionnaireItems';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = RenderItemProps;
const Integer = (props: Props): JSX.Element | null => {
  const { item, resources, id, pdf, idWithLinkIdAndItemIndex, path, responseItem, onAnswerChange, responseItems, index, children } = props;

  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { promptLoginMessage } = useExternalRenderContext();
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const enable = useIsEnabled(item, path);
  const answer = useGetAnswer(responseItem, item);
  const getValue = (): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueInteger).filter(f => f !== undefined);
    }
    if (answer && answer.valueInteger !== undefined && answer.valueInteger !== null) {
      return answer.valueInteger;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueInteger) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue();
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

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch && onAnswerChange && path) {
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, path, item, { valueInteger: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
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
  const errorMessage = getValidationTextExtension(item);
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  return (
    <div className="page_refero__component page_refero__component_integer">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-integer`}
          testId={`${getId(id)}-integer-label`}
          sublabelId={`${getId(id)}-integer-sublabel`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Controller
          name={idWithLinkIdAndItemIndex}
          control={control}
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
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Input
              {...rest}
              type="number"
              value={Array.isArray(value) ? value.join(', ') : value}
              inputId={getId(id)}
              testId={getId(id)}
              onChange={(e): void => {
                onChange(e.target.value);
                handleChange(e);
              }}
              placeholder={getPlaceholder(item)}
              className="page_refero__input"
              width={25}
            />
          )}
        />
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
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

const layoytChangeComponent = layoutChange(Integer);
export default layoytChangeComponent;
