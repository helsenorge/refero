import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { ValidationRule, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ValidationProps } from '../../../types/formTypes/validation';
import { Resources } from '../../../types/resources';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
  getSublabelText,
  renderPrefix,
  getText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface StringProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  visibleDeleteButton: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const String: React.FC<StringProps & ValidationProps> = props => {
  const [inputValue, setInputValue] = React.useState('');
  const { register, getFieldState } = useFormContext();

  const handleChange = (event: React.FormEvent): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(props.path, value, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const debouncedHandleChange: (event: React.FormEvent) => void = debounce(handleChange, 250, false);

  const validateText2 = (value: string): true | string => {
    return validateText(value, props.validateScriptInjection) ? true : 'error';
  };

  const getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, props.validateScriptInjection, props.item, props.resources);
  };

  const getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? props.resources?.formRequiredErrorMessage : undefined;
  };

  const { id, item, questionnaire, pdf, resources, answer, onRenderMarkdown } = props;
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

  const inputId = getId(props.id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // onChangeValidator={this.validateText}

  // validateOnExternalUpdate={true}

  const fieldState = getFieldState(getId(item.linkId));
  const handleInputChange = (event: React.FormEvent<HTMLInputElement>): void => {
    event.persist();
    debouncedHandleChange(event);
    setInputValue(event.currentTarget.value);
  };
  const pattern: ValidationRule<RegExp> | undefined = getRegexExtension(item)
    ? new RegExp(getRegexExtension(item) as string, 'g')
    : undefined;

  return (
    <div className="page_refero__component page_refero__component_string">
      {props.renderHelpElement()}
      <Input
        {...register(getId(item.linkId), {
          required: isRequired(item) && {
            value: isRequired(item),
            message: getRequiredErrorMessage(item) || resources?.formRequiredErrorMessage || '',
          },
          minLength: getMinLengthExtensionValue(item) && {
            value: getMinLengthExtensionValue(item) || 0,
            message: getValidationErrorMessage(inputValue),
          },
          maxLength: getMaxLength(item) && {
            value: getMaxLength(item) || 0,
            message: resources?.stringOverMaxLengthError || '',
          },
          onChange: handleInputChange,
          pattern: pattern && {
            value: pattern,
            message: getValidationErrorMessage(inputValue),
          },
          // validate: validateText2,
        })}
        label={
          <Label
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
            afterLabelChildren={props.renderHelpButton()}
          />
        }
        type="text"
        width={25}
        inputId={inputId}
        defaultValue={getStringValue(answer)}
        required={isRequired(item)}
        placeholder={getPlaceholder(item)}
        min={getMinLengthExtensionValue(item)}
        max={getMaxLength(item)}
        className="page_refero__input"
        errorText={fieldState.error?.message}
        error={fieldState.invalid}
      />
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
