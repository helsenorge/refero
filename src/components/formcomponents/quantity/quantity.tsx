import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity as QuantityType,
  QuestionnaireResponseItem,
  Questionnaire,
} from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newQuantityValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import {
  getValidationTextExtension,
  getPlaceholder,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getQuestionnaireUnitExtensionValue,
} from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';
import { useForm } from 'react-hook-form';

export interface QuantityProps extends WithCommonFunctionsProps {
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
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Quantity: React.FC<QuantityProps & ValidationProps> = props => {
  const getValue = (): number | number[] | undefined => {
    const { answer } = props;
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity.value);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  };

  const getPDFValue = (): string => {
    const value = getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (props.resources && props.resources.ikkeBesvart) {
        text = props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(m => `${m} ${getUnit()}`).join(', ');
    }
    return `${value} ${getUnit()}`;
  };

  const handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const extension = getQuestionnaireUnitExtensionValue(props.item);
    if (extension) {
      const quantity = {
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as QuantityType;

      const value = Number(parseFloat((event.target as HTMLInputElement).value));
      if (value != null && !isNaN(value) && isFinite(value)) {
        quantity.value = value;
      }

      if (dispatch) {
        dispatch(newQuantityValueAsync(props.path, quantity, props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(props.item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  React.useMemo(() => {
    const responseItemHasChanged = props.responseItem !== props.responseItem;
    const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
    const answerHasChanged = props.answer !== props.answer;
    const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
    const repeats = props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const { register } = useForm();
  const { id, item, questionnaire, onRenderMarkdown } = props;
  if (props.pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  const value = getValue();
  const inputId = getId(props.id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, props.resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, props.resources);

  // showLabel={true}
  // pattern={getDecimalPattern(item)}'
  // validateOnExternalUpdate={true}
  // <span className="page_refero__unit">{this.getUnit()}</span>

  return (
    <div className="page_refero__component page_refero__component_quantity">
      <Validation {...props}>
        <Label
          htmlFor={inputId}
          labelTexts={[{ text: labelText, type: 'semibold' }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={props.renderHelpButton()}
        />
        {props.renderHelpElement()}
        <Input
          {...register('quantity')}
          type="number"
          inputId={inputId}
          name={inputId}
          defaultValue={value !== undefined ? value + '' : ''}
          required={isRequired(item)}
          placeholder={getPlaceholder(item)}
          max={getMaxValueExtensionValue(item)}
          min={getMinValueExtensionValue(item)}
          onChange={handleChange}
          errorText={getValidationTextExtension(item)}
          className="page_refero__quantity"
          width={7}
        />
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      <div>{props.repeatButton}</div>
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Quantity);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
