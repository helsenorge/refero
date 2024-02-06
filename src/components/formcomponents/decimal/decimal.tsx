import * as React from 'react';

import { ValidationRule, useForm, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';
import { Resources } from '../../../types/resources';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDecimalValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import {
  getValidationTextExtension,
  getPlaceholder,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getRegexExtension,
} from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText, renderPrefix, getText, getDecimalPattern } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface DecimalProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Decimal: React.FC<DecimalProps & ValidationProps> = props => {
  const getValue = (): string | number | number[] | undefined => {
    const { item, answer } = props;
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
    const value = getValue();
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (props.resources && props.resources.ikkeBesvart) {
        text = props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  const handleChange = (event: React.FormEvent): void => {
    const { dispatch, path, item, promptLoginMessage, onAnswerChange } = props;
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (dispatch) {
      dispatch(newDecimalValueAsync(path, value, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const { register, getFieldState } = useFormContext();
  const { id, item, pdf, onRenderMarkdown } = props;
  const value = getValue();
  const inputId = getId(props.id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, props.questionnaire, props.resources)}`;
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  // validateOnExternalUpdate={true}
  const pattern: ValidationRule<RegExp> | undefined = getRegexExtension(item)
    ? new RegExp(getRegexExtension(item) as string, 'g')
    : undefined;
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  const validationMessage = getValidationTextExtension(item) || '';
  const { error } = getFieldState(getId(item.linkId));
  return (
    <div className="page_refero__component page_refero__component_decimal">
      <>
        {props.renderHelpElement()}
        <Input
          {...register(getId(item.linkId), {
            pattern,
            required: { value: isRequired(item), message: validationMessage },
            max: maxValue && { value: maxValue, message: validationMessage },
            min: minValue ? { value: minValue, message: validationMessage } : undefined,
            onChange: handleChange,
          })}
          label={
            <Label
              htmlFor={inputId}
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={props.renderHelpButton()}
            />
          }
          type="number"
          inputId={inputId}
          defaultValue={value ? value + '' : ''}
          placeholder={getPlaceholder(item)}
          errorText={error?.message}
          className="page_refero__input"
          width={25}
        />
      </>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Decimal);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
