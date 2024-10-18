import { useState } from 'react';

import { QuestionnaireResponseItemAnswer, Quantity as QuantityType, QuestionnaireItem } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles2 from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import styles from './quantity.module.css';
import { newQuantityValueAsync } from '@/actions/newValue';
import { GlobalState, useAppDispatch } from '@/reducers';
import { getMaxValueExtensionValue, getPlaceholder, getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { decimalPattern, getErrorMessage, maxValue, minValue, required } from '@/components/validation/rules';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';

export type Props = QuestionnaireComponentItemProps;

const Quantity = (props: Props): JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, index, children, linkId } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const dispatch = useAppDispatch();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(linkId, path);

  const getValue = (
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): number | number[] | undefined | string => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueQuantity?.value).filter(f => f !== undefined);
    }
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  };

  const getPDFValue = (): string => {
    const value = getValue(answer);
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const extension = getQuestionnaireUnitExtensionValue(item);
    const quantity: QuantityType = {
      unit: extension?.display,
      system: extension?.system,
      code: extension?.code,
    };

    const value = Number(parseFloat(event.target.value));
    if (value !== null && !isNaN(value) && isFinite(value)) {
      quantity.value = value;
    }
    if (dispatch && path && item) {
      dispatch(newQuantityValueAsync(path || [], quantity, item))?.then(newState =>
        onAnswerChange(newState, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  const value = getValue(answer);
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
    <div className="page_refero__component page_refero__component_quantity">
      <FormGroup error={errorMessage} mode="ongrey" errorWrapperClassName={styles2.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-quantity-label`}
          testId={`${getId(id)}-quantity-label`}
          sublabelId={`${getId(id)}-quantity-sublabel`}
        >
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </ReferoLabel>
        <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />

        <div className={styles.inputWrapper}>
          <Input
            {...rest}
            value={value !== undefined ? value + '' : ''}
            type="number"
            inputId={getId(id)}
            testId={getId(id)}
            placeholder={getPlaceholder(item)}
            className="page_refero__quantity"
            onChange={(e): void => {
              onChange(e);
              handleChange(e);
            }}
            width={width}
          />
          <span className={`${styles.pageReferoUnit} page_refero__unit`}>{getUnit()}</span>
        </div>

        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Quantity;
