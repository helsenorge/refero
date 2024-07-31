import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId } from '../../../util/index';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Integer = ({
  item,
  answer,
  repeatButton,
  resources,
  id,
  onRenderMarkdown,
  renderHelpButton,
  renderHelpElement,
  children,
  pdf,
  questionnaire,
  control,
  error,
  renderDeleteButton,
  idWithLinkIdAndItemIndex,
  promptLoginMessage,
  path,
  onAnswerChange,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getValue = (): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueInteger);
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
    if (dispatch) {
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, path, item, { valueInteger: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
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
        {renderHelpElement()}
        <ReferoLabel
          item={item}
          onRenderMarkdown={onRenderMarkdown}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-integer`}
          testId={`${getId(id)}-integer-label`}
          sublabelId={`${getId(id)}-integer-sublabel`}
          renderHelpButton={renderHelpButton}
        />
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
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withFormProps = ReactHookFormHoc(Integer);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoytChangeComponent = layoutChange(withCommonFunctionsComponent);
export default layoytChangeComponent;
