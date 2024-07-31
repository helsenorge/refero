import React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { isReadOnly, getId, getSublabelText, isRequired, getLabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import SafeText from '../../referoLabel/SafeText';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onValidated?: (valid: boolean | undefined) => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Boolean = ({
  item,
  answer,
  dispatch,
  promptLoginMessage,
  onAnswerChange,
  path,
  pdf,
  onRenderMarkdown,
  questionnaire,
  id,
  resources,
  renderHelpButton,
  renderHelpElement,
  renderDeleteButton,
  repeatButton,
  error,
  children,
  control,
  idWithLinkIdAndItemIndex,
}: Props): JSX.Element | null => {
  const getValue = (): boolean => {
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
      return false;
    }
    return item.initial[0].valueBoolean;
  };

  const handleChange = (): void => {
    const newValue = !getValue();
    if (dispatch) {
      path &&
        dispatch(newBooleanValueAsync(path, newValue, item))?.then(
          newState => onAnswerChange && onAnswerChange(newState, path, item, { valueBoolean: newValue })
        );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  if (pdf) {
    return <Pdf item={item} checked={getValue()} onRenderMarkdown={onRenderMarkdown} />;
  } else if (isReadOnly(item)) {
    return (
      <Checkbox
        testId={`${getId(id)}-readonly`}
        label={<Label testId={`${getId(id)}-label-readonly`} labelTexts={[{ text: labelText }]} />}
        checked={getValue()}
        disabled={true}
        onChange={(): void => {
          /*kan ikke endres, er alltid disabled*/
        }}
        className="page_refero__input"
      />
    );
  }

  const value = getValue();
  return (
    // Dette er en hack for FHI-skjema. TODO: fjern hack
    <div className="page_refero__component page_refero__component_boolean">
      <FormGroup error={error?.message}>
        {renderHelpElement()}

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
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Checkbox
              {...rest}
              testId={`${getId(id)}-boolean`}
              inputId={getId(id)}
              label={
                <Label
                  labelId={`${getId(id)}-label-boolean`}
                  testId={`${getId(id)}-label-boolean`}
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  htmlFor={getId(id)}
                  className="page_refero__label"
                  sublabel={
                    <Sublabel
                      testId={`${getId(id)}-sublabel-boolean`}
                      id={`${getId(id)}-sublabel-boolean`}
                      sublabelTexts={[{ text: subLabelText, type: 'normal' }]}
                    />
                  }
                  afterLabelChildren={renderHelpButton()}
                >
                  <SafeText text={labelText} />
                </Label>
              }
              checked={value}
              onChange={(): void => {
                handleChange();
                onChange(!value);
              }}
              className="page_refero__input"
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
const withFormProps = ReactHookFormHoc(Boolean);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
