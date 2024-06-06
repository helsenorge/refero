import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

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
  getSublabelText,
  getMaxLength,
  scriptInjectionValidation,
  getLabelText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

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

export const String = (props: Props): JSX.Element | null => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;

    const value = event.target.value;
    if (dispatch) {
      dispatch(newStringValueAsync(props.path, value, props.item))?.then(newState => {
        return onAnswerChange(newState, path, item, { valueString: value });
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  // shouldComponentUpdate(nextProps: Props): boolean {
  //   const responseItemHasChanged = props.responseItem !== nextProps.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== nextProps.isHelpOpen;
  //   const answerHasChanged = props.answer !== nextProps.answer;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(nextProps.resources);
  //   const repeats = props.item.repeats ?? false;
  //   const newErrorMessage = props.error?.message !== nextProps.error?.message;
  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  // }

  // const getValidationErrorMessage = (value: string): string => {
  //   return getTextValidationErrorMessage(value, props.validateScriptInjection, props.item, props.resources);
  // };

  const { id, item, questionnaire, pdf, resources, answer, onRenderMarkdown, control, idWithLinkIdAndItemIndex } = props;
  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer, resources)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const maxLength = getMaxLength(item);
  const minLength = getMinLengthExtensionValue(item);
  const pattern = getRegexExtension(item);
  const errorMessage = getValidationTextExtension(item);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    debounce(() => handleChange(event), 250, false);
  };
  const value = getStringValue(answer);
  return (
    <div className="page_refero__component page_refero__component_string">
      <FormGroup error={props.error?.message} mode="ongrey">
        {props.renderHelpElement()}
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
            ...(props.validateScriptInjection && {
              validate: (value: string): true | string => scriptInjectionValidation(value, props.resources),
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
              label={
                <Label
                  testId={`${getId(props.id)}-string-label`}
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  className="page_refero__label"
                  sublabel={
                    <Sublabel
                      id={`${getId(props.id)}-sublabel`}
                      sublabelTexts={[{ text: subLabelText, hideFromScreenReader: false, type: 'normal' }]}
                    />
                  }
                  afterLabelChildren={props.renderHelpButton()}
                />
              }
              onChange={(e): void => {
                handleInputChange(e);
                onChange(e.target.value);
              }}
              type="text"
              width={25}
              testId={`${getId(props.id)}-string`}
              inputId={getId(props.id)}
              placeholder={getPlaceholder(item)}
              className="page_refero__input"
            />
          )}
        />
        {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {props.repeatButton}
      </FormGroup>
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(String);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
