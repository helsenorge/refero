import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { debounce } from '@helsenorge/core-utils/debounce';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getMinLengthExtensionValue, getPlaceholder, getRegexExtension, getValidationTextExtension } from '@/util/extension';
import { isReadOnly, isRequired, getId, getStringValue, getPDFStringValue, getMaxLength, scriptInjectionValidation } from '@/util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = QuestionnaireComponentItemProps;

export const String = (props: Props): JSX.Element | null => {
  const { path, item, id, pdf, resources, idWithLinkIdAndItemIndex, children, responseItems, index, responseItem } = props;
  const { promptLoginMessage, validateScriptInjection, onAnswerChange } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch && path) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, item, { valueString: value });
      });
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
      <TextView id={id} item={item} value={getPDFStringValue(answer, resources)} textClass="page_refero__component_readonlytext">
        {children}
      </TextView>
    );
  }

  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  const errorMessage = getValidationTextExtension(item);
  const debouncedHandleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = debounce(handleChange, 250, false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    debouncedHandleChange(event);
  };
  const value = getStringValue(answer);
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
    },
    ...(validateScriptInjection && {
      validate: (value: string): true | string => scriptInjectionValidation(value, resources),
    }),
    ...(minLength && {
      minLength: {
        value: minLength || 0,
        message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
      },
    }),
    ...(pattern && {
      pattern: {
        value: new RegExp(pattern),
        message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
      },
    }),
    shouldUnregister: true,
  });
  return (
    <div className="page_refero__component page_refero__component_string">
      <FormGroup error={error?.message ?? ''} mode="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Input
          {...rest}
          disabled={item.readOnly}
          defaultValue={value}
          onChange={(e): void => {
            handleInputChange(e);
            onChange(e);
          }}
          type="text"
          width={25}
          testId={`${getId(id)}-string`}
          inputId={getId(id)}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
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

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
export default String;
