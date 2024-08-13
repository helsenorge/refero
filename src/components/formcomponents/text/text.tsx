import React, { useState } from 'react';

import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import Expander from '@helsenorge/designsystem-react/components/Expander';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';

import { debounce } from '@helsenorge/core-utils/debounce';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import Constants from '@/constants/index';
import itemControlConstants from '@/constants/itemcontrol';
import { GlobalState } from '@/reducers';
import {
  getPlaceholder,
  getMinLengthExtensionValue,
  getItemControlExtensionValue,
  getRegexExtension,
  getValidationTextExtension,
} from '@/util/extension';
import { isReadOnly, isRequired, getId, getStringValue, getMaxLength, getPDFStringValue, scriptInjectionValidation } from '@/util/index';
import { ReferoLabel } from '../../referoLabel/ReferoLabel';
import TextView from '../textview';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = QuestionnaireComponentItemProps & {
  shouldExpanderRenderChildrenWhenClosed?: boolean;
};
export const Text = (props: Props): JSX.Element | null => {
  const {
    id,
    item,
    pdf,
    resources,
    idWithLinkIdAndItemIndex,
    path,
    shouldExpanderRenderChildrenWhenClosed,
    responseItems,
    responseItem,
    index,
    children,
  } = props;
  const { promptLoginMessage, validateScriptInjection, onAnswerChange } = useExternalRenderContext();
  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);
  const handleChange = (event: React.FormEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    if (dispatch && path) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueString: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const debouncedHandleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void = debounce(handleChange, 250, false);
  const onTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    event.persist();
    debouncedHandleChange(event);
  };

  const itemControls = getItemControlExtensionValue(item);
  if (!enable) {
    return null;
  }
  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
    return null;
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
    return (
      <div id={id} className="page_refero__component page_refero__component_expandabletext">
        <Expander title={item.text ? item.text : ''} renderChildrenWhenClosed={shouldExpanderRenderChildrenWhenClosed ? true : false}>
          {children}
        </Expander>
      </div>
    );
  }

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFStringValue(answer, resources)} textClass="page_refero__component_readonlytext">
        {children}
      </TextView>
    );
  }

  const value = getStringValue(answer);
  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  const validationTextMessage = getValidationTextExtension(item);

  return (
    <div className="page_refero__component page_refero__component_text">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          testId={`${getId(id)}-text-label`}
          htmlFor={getId(id)}
          item={item}
          labelId={`${getId(id)}-text-label`}
          resources={resources}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Controller
          name={idWithLinkIdAndItemIndex}
          defaultValue={value || ''}
          control={control}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || 'Verdien er påkrevd',
            },
            ...(minLength && {
              minLength: {
                value: minLength || 0,
                message: validationTextMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
              },
            }),
            ...(maxLength && {
              maxLength: {
                value: maxLength,
                message: validationTextMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
              },
            }),
            ...(pattern && {
              pattern: {
                value: new RegExp(pattern),
                message: validationTextMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
              },
            }),
            ...(validateScriptInjection && {
              validate: (value: string): true | string => scriptInjectionValidation(value, resources),
            }),
          }}
          render={({ field: { onChange, name, ref } }): JSX.Element => (
            <Textarea
              ref={ref}
              name={name}
              defaultValue={value}
              onChange={(e): void => {
                onTextAreaChange(e);
                onChange(e?.target?.value);
              }}
              textareaId={getId(id)}
              maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
              placeholder={getPlaceholder(item)}
              testId={`${getId(id)}-text`}
              grow={true}
              maxCharacters={maxLength}
              maxText={maxLength ? resources?.maxLengthText?.replace('{0}', `${maxLength}`) : ''}
            />
          )}
        />
        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
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

export default Text;
