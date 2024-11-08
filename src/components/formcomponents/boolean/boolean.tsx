import React, { useState } from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import styles from '../common-styles.module.css';
import Pdf from './pdf';
import { newBooleanValueAsync } from '@/actions/newValue';
import { GlobalState, useAppDispatch } from '@/reducers';
import { isReadOnly, getId, getSublabelText, getLabelText } from '@/util/index';
import SafeText from '../../referoLabel/SafeText';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getFormDefinition } from '@/reducers/form';
import { getErrorMessage, required } from '@/components/validation/rules';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { QuestionnaireItem } from 'fhir/r4';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { shouldValidate } from '@/components/validation/utils';
import { useResetFormField } from '@/hooks/useResetFormField';

export type Props = QuestionnaireComponentItemProps & {
  children?: React.ReactNode;
};

const Boolean = (props: Props): JSX.Element | null => {
  const { path, pdf, id, index, idWithLinkIdAndItemIndex, linkId, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const dispatch = useAppDispatch();
  const { onRenderMarkdown, promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(linkId, path);
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
  const value = getValue();

  useResetFormField(props.idWithLinkIdAndItemIndex, value);

  const handleChange = (): void => {
    const newValue = !getValue();
    if (dispatch && item) {
      path &&
        dispatch(newBooleanValueAsync(path, newValue, item))?.then(
          newState => onAnswerChange && onAnswerChange(newState, item, { valueBoolean: newValue })
        );
    }

    promptLoginMessage?.();
  };

  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf) {
    return <Pdf item={item} checked={getValue()} />;
  } else if (isReadOnly(item)) {
    return (
      <FormGroup error={getErrorMessage(item, error)}>
        <Checkbox
          testId={`${getId(id)}-readonly`}
          label={
            <Label
              testId={`${getId(id)}-label-readonly`}
              labelTexts={[{ text: item?.text || '' }]}
              afterLabelChildren={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
            />
          }
          checked={getValue()}
          disabled={true}
          onChange={(): void => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_refero__input"
        />
      </FormGroup>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_boolean">
      <FormGroup error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <Checkbox
          {...rest}
          testId={`${getId(id)}-boolean`}
          inputId={getId(id)}
          label={
            <Label
              labelId={`${getId(id)}-label-boolean`}
              testId={`${getId(id)}-label-boolean`}
              labelTexts={[{ text: item?.text || '', type: 'normal' }]}
              htmlFor={getId(id)}
              className="page_refero__label label_helpButton_align"
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
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />

      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Boolean;
