import { QuestionnaireResponseItemAnswer, Quantity as QuantityType, QuestionnaireItem } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles2 from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import styles from './quantity.module.css';
import { newQuantityValueAsync } from '@/actions/newValue';
import { GlobalState, useAppDispatch } from '@/reducers';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getPlaceholder, getQuestionnaireUnitExtensionValue } from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { decimalPattern, getErrorMessage, getInputWidth, isNumber, maxValue, minValue, required } from '@/components/validation/rules';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';
import { useResetFormField } from '@/hooks/useResetFormField';

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
  const answerValue = getValue(answer);
  const value = isNumber(answerValue) ? answerValue : '';

  useResetFormField(idWithLinkIdAndItemIndex, value);
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

    const newValue = parseFloat(event.target.value);
    quantity.value = isNumber(newValue) ? newValue : undefined;

    if (value !== null && !isNaN(newValue) && isFinite(newValue)) {
      quantity.value = newValue;
    }

    if (dispatch && path && item) {
      dispatch(newQuantityValueAsync(path || [], quantity, item))?.then(newState =>
        onAnswerChange(newState, item, { valueQuantity: quantity })
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

  const maxCharacters = getMaxValueExtensionValue(item) ? getMaxValueExtensionValue(item)?.toString().length : undefined;
  const baseIncrementValue = getMinValueExtensionValue(item);
  const width = getInputWidth(maxCharacters);
  const errorMessage = getErrorMessage(item, error);
  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    max: maxValue({ item, resources }),
    min: minValue({ item, resources }),
    pattern: decimalPattern({ item, resources }),
    shouldUnregister: true,
  };

  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

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
      <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles2.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-quantity-label`}
          testId={`${getId(id)}-quantity-label`}
          sublabelId={`${getId(id)}-quantity-sublabel`}
        />

        <div className={styles.inputWrapper}>
          <Input
            {...rest}
            value={value}
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
            baseIncrementValue={baseIncrementValue}
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
