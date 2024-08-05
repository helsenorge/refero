import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getMinLengthExtensionValue, getPlaceholder, getRegexExtension, getValidationTextExtension } from '@/util/extension';
import { isReadOnly, isRequired, getId, getStringValue, getPDFStringValue, getMaxLength, scriptInjectionValidation } from '@/util/index';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  oneToTwoColumn: boolean;
  validateScriptInjection: boolean;
  index?: number;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  children?: React.ReactNode;
  responseItems?: QuestionnaireResponseItem[];
}

export const String = ({
  promptLoginMessage,
  path,
  item,
  onAnswerChange,
  id,
  questionnaire,
  pdf,
  resources,
  control,
  idWithLinkIdAndItemIndex,
  validateScriptInjection,
  error,
  children,
  responseItems,
  renderContext,
  index,
  responseItem,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem) || [];
  const enable = useIsEnabled(item, path);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, path, item, { valueString: value });
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
  return (
    <div className="page_refero__component page_refero__component_string">
      <FormGroup error={error?.message ?? ''} mode="ongrey">
        <ReferoLabel
          item={item}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
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
          }}
          render={({ field: { onChange, ref, name } }): JSX.Element => (
            <Input
              name={name}
              ref={ref}
              disabled={item.readOnly}
              defaultValue={value}
              onChange={(e): void => {
                handleInputChange(e);
                onChange(e.target.value);
              }}
              type="text"
              width={25}
              testId={`${getId(id)}-string`}
              inputId={getId(id)}
              placeholder={getPlaceholder(item)}
              className="page_refero__input"
            />
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
const withFormProps = ReactHookFormHoc(String);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
export default layoutChangeComponent;
