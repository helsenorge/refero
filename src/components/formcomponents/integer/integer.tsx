import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { NewValueAction, newIntegerValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getPlaceholder } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

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
import { maxValue, minValue, required } from '@/components/validation/rules';

export type Props = QuestionnaireComponentItemProps;
const Integer = (props: Props): JSX.Element | null => {
  const { item, resources, id, pdf, idWithLinkIdAndItemIndex, path, responseItem, responseItems, index, children } = props;

  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
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
    if (dispatch && path) {
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueInteger: value }));
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
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    max: maxValue({ item, resources }),
    min: minValue({ item, resources }),
    shouldUnregister: true,
  });
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

        <Input
          {...rest}
          type="number"
          value={Array.isArray(value) ? value.join(', ') : value}
          inputId={getId(id)}
          testId={getId(id)}
          onChange={(e): void => {
            onChange(e);
            handleChange(e);
          }}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
          width={25}
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

export default Integer;
