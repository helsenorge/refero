import * as React from 'react';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity as QuantityType,
  QuestionnaireResponseItem,
  Questionnaire,
} from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newQuantityValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getPlaceholder, getQuestionnaireUnitExtensionValue } from '../../../util/extension';
import { isReadOnly, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface QuantityProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Quantity = ({
  answer,
  resources,
  promptLoginMessage,
  path,
  item,
  onAnswerChange,
  id,
  questionnaire,
  onRenderMarkdown,
  pdf,
  renderHelpButton,
  renderHelpElement,
  children,
  renderDeleteButton,
  repeatButton,
}: QuantityProps): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();

  const getValue = (): number | number[] | undefined => {
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
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.map(m => `${m} ${getUnit()}`).join(', ');
    }
    return `${value} ${getUnit()}`;
  };

  const handleChange = (event: React.FormEvent): void => {
    const extension = getQuestionnaireUnitExtensionValue(item);
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
        dispatch(newQuantityValueAsync(path, quantity, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
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
  const inputId = getId(id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);

  return (
    <div className="page_refero__component page_refero__component_quantity">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Input
          {...register(formId, {
            valueAsNumber: true,
            onChange: handleChange,
          })}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          type="number"
          inputId={inputId}
          defaultValue={value !== undefined ? value + '' : ''}
          placeholder={getPlaceholder(item)}
          className="page_refero__quantity"
          width={7}
        />
        <span className="page_refero__unit">{getUnit()}</span>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        <div>{repeatButton}</div>
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Quantity);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
