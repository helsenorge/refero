import React, { useState } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { newDecimalValueAsync } from '@/actions/newValue';
import { GlobalState, useAppDispatch } from '@/reducers';
import { getMaxValueExtensionValue, getPlaceholder } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { decimalPattern, getErrorMessage, maxValue, minValue, required } from '@/components/validation/rules';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';

export type Props = QuestionnaireComponentItemProps;

const Decimal = (props: Props): JSX.Element | null => {
  const { id, linkId, pdf, children, idWithLinkIdAndItemIndex, path, index } = props;
  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex || '', formState);
  const { error } = fieldState;
  const dispatch = useAppDispatch();
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const answer = useGetAnswer(linkId, path);

  const getValue = (
    item?: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDecimal).filter(f => f !== undefined);
    }
    if (answer && answer.valueDecimal !== undefined && answer.valueDecimal !== null) {
      return answer.valueDecimal;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDecimal) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue(item, answer);
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (item) {
      dispatch(newDecimalValueAsync(path || [], value, item))?.then(newState => {
        return onAnswerChange(newState, item, { valueDecimal: value });
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const value = getValue(item, answer);
  const maxCharacters = getMaxValueExtensionValue(item) ? getMaxValueExtensionValue(item)?.toString().length : undefined;
  const width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters + 2) : 7;
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    max: maxValue({ item, resources }),
    min: minValue({ item, resources }),
    pattern: decimalPattern({ item, resources }),
    shouldUnregister: true,
  };

  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, pdf ? undefined : validationRules);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={value}
        pdfValue={getPDFValue()}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_decimal">
      <FormGroup error={errorMessage} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label-decimal`}
          testId={`${getId(id)}-decimal-label`}
          sublabelId={`${getId(id)}-decimal-sublabel`}
        >
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </ReferoLabel>
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        <Input
          {...rest}
          type="number"
          inputId={getId(id)}
          value={value ? value + '' : ''}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
          onChange={(e): void => {
            handleChange(e);
            onChange(e);
          }}
          width={width}
        />
      </FormGroup>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Decimal;
