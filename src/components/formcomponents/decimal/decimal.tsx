import React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDecimalValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getPlaceholder, getValidationTextExtension } from '@/util/extension';
import { isReadOnly, getId, getDecimalPattern, isRequired } from '@/util/index';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Decimal = ({
  id,
  item,
  pdf,
  onRenderMarkdown,
  control,
  answer,
  questionnaire,
  resources,
  renderHelpButton,
  renderHelpElement,
  children,
  error,
  idWithLinkIdAndItemIndex,
  path,
  onAnswerChange,
  promptLoginMessage,
  repeatButton,
  renderDeleteButton,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDecimal);
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

  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (dispatch) {
      dispatch(newDecimalValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseItemAnswer);
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const value = getValue(item, answer);

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
  const decimalPattern = getDecimalPattern(item);
  const maxValue = getMaxValueExtensionValue(item);
  const minValue = getMinValueExtensionValue(item);
  const validationText = getValidationTextExtension(item);
  return (
    <div className="page_refero__component page_refero__component_decimal">
      {renderHelpElement()}
      <ReferoLabel
        item={item}
        onRenderMarkdown={onRenderMarkdown}
        questionnaire={questionnaire}
        resources={resources}
        htmlFor={getId(id)}
        labelId={`${getId(id)}-label-decimal`}
        testId={`${getId(id)}-decimal-label`}
        sublabelId={`${getId(id)}-decimal-sublabel`}
        renderHelpButton={renderHelpButton}
      />
      <FormGroup error={error?.message} mode="ongrey">
        <Controller
          name={idWithLinkIdAndItemIndex}
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
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withFormProps = ReactHookFormHoc(Decimal);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
export default layoutChangeComponent;
