import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ValidationProps } from '../../../types/formTypes/validation';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface IntegerProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Integer = (props: IntegerProps & ValidationProps): JSX.Element | null => {
  const { register, getFieldState } = useFormContext();
  const getValue = (): string | number | number[] | undefined => {
    const { item, answer } = props;
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
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch) {
      dispatch(newIntegerValueAsync(props.path, value, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueInteger: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const inputId = getId(props.id);

  if (props.pdf || isReadOnly(props.item)) {
    return (
      <TextView
        id={props.id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={props.onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  const value = getValue();
  const labelText = `${renderPrefix(props.item)} ${getText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources)}`;
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);

  // showLabel={true}
  // validateOnExternalUpdate={true}
  const { error, invalid } = getFieldState(getId(props.item.linkId));
  const maxValue = getMaxValueExtensionValue(props.item);
  const minValue = getMinValueExtensionValue(props.item);
  const validationMessage = getValidationTextExtension(props.item) ?? '';
  return (
    <div className="page_refero__component page_refero__component_integer">
      {props.renderHelpElement()}
      <FormGroup error={error?.message}>
        <Input
          {...register(getId(props.item.linkId), {
            required: isRequired(props.item),
            max: maxValue && { value: maxValue, message: validationMessage },
            min: minValue && { value: minValue, message: validationMessage },
            valueAsNumber: true,
            onChange: handleChange,
          })}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={props.renderHelpButton()}
            />
          }
          type="number"
          inputId={inputId}
          defaultValue={value !== undefined && value !== null ? value + '' : ''}
          placeholder={getPlaceholder(props.item)}
          errorText={error?.message}
          error={invalid}
          className="page_refero__input"
          width={25}
        />
      </FormGroup>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Integer);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
