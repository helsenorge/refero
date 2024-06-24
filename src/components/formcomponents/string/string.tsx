import React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getMinLengthExtensionValue, getPlaceholder, getRegexExtension, getValidationTextExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getPDFStringValue,
  getMaxLength,
  scriptInjectionValidation,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  oneToTwoColumn: boolean;
  visibleDeleteButton: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

export const String = ({
  dispatch,
  promptLoginMessage,
  path,
  item,
  onAnswerChange,
  id,
  questionnaire,
  pdf,
  resources,
  answer,
  onRenderMarkdown,
  control,
  idWithLinkIdAndItemIndex,
  renderDeleteButton,
  repeatButton,
  validateScriptInjection,
  error,
  children,
  renderHelpButton,
  renderHelpElement,
}: Props): JSX.Element | null => {
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

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = responseItem !== nextresponseItem;
  //   const helpItemHasChanged = isHelpOpen !== nextisHelpOpen;
  //   const answerHasChanged = answer !== nextanswer;
  //   const resourcesHasChanged = JSON.stringify(resources) !== JSON.stringify(nextresources);
  //   const repeats = item.repeats ?? false;
  //   const newErrorMessage = error?.message !== nexterror?.message;
  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  // }

  // const getValidationErrorMessage = (value: string): string => {
  //   return getTextValidationErrorMessage(value, validateScriptInjection, item, resources);
  // };

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
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <ReferoLabel
          item={item}
          onRenderMarkdown={onRenderMarkdown}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
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
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(String);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
