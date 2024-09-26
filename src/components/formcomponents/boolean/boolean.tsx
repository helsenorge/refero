import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import styles from '../common-styles.module.css';
import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { isReadOnly, getId, getSublabelText, getLabelText } from '@/util/index';
import SafeText from '../../referoLabel/SafeText';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getFormDefinition } from '@/reducers/form';
import { required } from '@/components/validation/rules';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

export type Props = QuestionnaireComponentItemProps & {
  children?: React.ReactNode;
};

const Boolean = (props: Props): JSX.Element | null => {
  const { path, pdf, id, index, idWithLinkIdAndItemIndex, linkId, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { onRenderMarkdown, promptLoginMessage, onAnswerChange, resources } = useExternalRenderContext();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem, item);
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
    if (dispatch && item) {
      path &&
        dispatch(newBooleanValueAsync(path, newValue, item))?.then(
          newState => onAnswerChange && onAnswerChange(newState, item, { valueBoolean: newValue })
        );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const value = getValue();

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
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    shouldUnregister: true,
  });
  return (
    // Dette er en hack for FHI-skjema. TODO: fjern hack
    <div className="page_refero__component page_refero__component_boolean">
      <FormGroup error={error?.message} errorWrapperClassName={styles.paddingBottom}>
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
          onChange={(e): void => {
            handleChange();
            onChange(e);
          }}
          className="page_refero__input"
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      </FormGroup>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Boolean;
