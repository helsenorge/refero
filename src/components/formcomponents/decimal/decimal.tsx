import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDecimalValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getPlaceholder } from '../../../util/extension';
import { isReadOnly, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface DecimalProps extends WithFormComponentsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Decimal = ({
  item,
  answer,
  resources,
  path,
  promptLoginMessage,
  onAnswerChange,
  id,
  pdf,
  onRenderMarkdown,
  questionnaire,
  renderHelpButton,
  renderHelpElement,
  children,
  renderDeleteButton,
  repeatButton,
}: DecimalProps): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getValue = (): string | number | number[] | undefined => {
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

  const handleChange = (event: React.FormEvent): void => {
    const value = parseFloat((event.target as HTMLInputElement).value);
    dispatch(newDecimalValueAsync(path, value, item))?.then(newState =>
      onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseItemAnswer)
    );

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const value = getValue();
  const inputId = getId(id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const inputValue = value ? value + '' : '';
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

  // validateOnExternalUpdate={true}
  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_decimal">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Input
          {...register(formId, {
            onChange: handleChange,
          })}
          label={
            <Label
              htmlFor={inputId}
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
              statusDot={<div>{status}</div>}
            />
          }
          type="number"
          value={inputValue}
          inputId={inputId}
          defaultValue={inputValue}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
          width={25}
        />
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Decimal);
const connectedComponent = connect(mapStateToProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
