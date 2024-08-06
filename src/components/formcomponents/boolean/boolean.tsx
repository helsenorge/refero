import React, { useState } from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { isReadOnly, getId, getSublabelText, isRequired, getLabelText } from '@/util/index';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import SafeText from '../../referoLabel/SafeText';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onValidated?: (valid: boolean | undefined) => void;
  oneToTwoColumn: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  children?: React.ReactNode;
}

const Boolean = ({
  item,
  promptLoginMessage,
  onAnswerChange,
  path,
  pdf,
  questionnaire,
  id,
  resources,
  responseItems,
  index,
  error,
  children,
  control,
  idWithLinkIdAndItemIndex,
  responseItem,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { onRenderMarkdown } = useExternalRenderContext();
  const enable = useIsEnabled(item, path);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem) || [];
  const getValue = (): boolean => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueBoolean).filter(f => f !== undefined)[0] ?? false;
    }
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
  const value = getValue();
  if (!enable) {
    return null;
  }
  if (pdf) {
    return <Pdf item={item} checked={getValue()} />;
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

  return (
    // Dette er en hack for FHI-skjema. TODO: fjern hack
    <div className="page_refero__component page_refero__component_boolean">
      <FormGroup error={error?.message}>
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
                  afterLabelChildren={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
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

        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      </FormGroup>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(Boolean);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
export default layoutChangeComponent;
