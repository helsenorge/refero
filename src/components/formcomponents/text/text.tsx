import React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from 'fhir/r4';
import { Controller } from 'react-hook-form';
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
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import { ReferoLabel } from '../../referoLabel/ReferoLabel';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';
import { useDispatch } from 'react-redux';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  id?: string;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  resources?: Resources;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  shouldExpanderRenderChildrenWhenClosed?: boolean;
  children?: React.ReactNode;
}
export const Text = ({
  id,
  item,
  answer,
  pdf,
  children,
  resources,
  onRenderMarkdown,
  questionnaire,
  control,
  idWithLinkIdAndItemIndex,
  promptLoginMessage,
  path,
  onAnswerChange,
  shouldExpanderRenderChildrenWhenClosed,
  renderHelpButton,
  renderHelpElement,
  error,
  validateScriptInjection,
  renderDeleteButton,
  repeatButton,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const handleChange = (event: React.FormEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: value }));
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
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer, resources)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
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
        {renderHelpElement()}

        <ReferoLabel
          testId={`${getId(id)}-text-label`}
          htmlFor={getId(id)}
          onRenderMarkdown={onRenderMarkdown}
          item={item}
          labelId={`${getId(id)}-text-label`}
          questionnaire={questionnaire}
          resources={resources}
          renderHelpButton={renderHelpButton}
        />
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
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withFormProps = ReactHookFormHoc(Text);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
export default withCommonFunctionsComponent;
