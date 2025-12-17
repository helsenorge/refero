import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { QuestionnaireResponseItemAnswer, Quantity as QuantityType } from 'fhir/r4';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import styles2 from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import styles from './quantity.module.css';

import { newQuantityValueAsync } from '@/actions/newValue';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import {
  createMaxDecimalPlacesValidator,
  createRegexpValidator,
  getErrorMessage,
  getInputWidth,
  isNumber,
  maxValue,
  minValue,
  required,
} from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import {
  getMaxDecimalPlacesExtensionValue,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getPlaceholder,
  getQuestionnaireUnitExtensionValue,
} from '@/util/extension';
import { isReadOnly, getId } from '@/util/index';

export type Props = QuestionnaireComponentItemProps;

const Quantity = (props: Props): JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, index, children, linkId } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

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

  const getUnitSubLabel = (): string => {
    const unit = getUnit();
    if (unit) {
      return `${resources?.quantity_unit_sublabel} ${unit}`;
    }
    return '';
  };

  const maxCharacters = getMaxValueExtensionValue(item) ? getMaxValueExtensionValue(item)?.toString().length : undefined;
  const maxDecimals = getMaxDecimalPlacesExtensionValue(item) ? getMaxDecimalPlacesExtensionValue(item) : undefined;
  const baseIncrementValue = getMinValueExtensionValue(item);
  const width = getInputWidth(maxCharacters, true, maxDecimals);
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> = {
    required: required({ item, resources }),
    max: maxValue({ item, resources }),
    min: minValue({ item, resources }),
    validate: {
      'max-decimal-places': createMaxDecimalPlacesValidator({ item, resources }),
      'regexp-pattern': createRegexpValidator({ item, resources }),
    },
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
          quantityUnitSubLabel={getUnitSubLabel()}
          formFieldTagId={`${getId(id)}-quantity-formfieldtag`}
        />

        <div className={styles.inputWrapper}>
          <Input
            {...rest}
            aria-describedby={`${getId(id)}-quantity-formfieldtag`}
            value={value}
            type="number"
            inputId={getId(id)}
            testId={`test-quantity-${getId(id)}`}
            placeholder={getPlaceholder(item)}
            className="page_refero__quantity"
            onChange={(e): void => {
              onChange(e);
              handleChange(e);
            }}
            width={width}
            inputMode="decimal"
            baseIncrementValue={baseIncrementValue}
          />
        </div>

        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Quantity;
