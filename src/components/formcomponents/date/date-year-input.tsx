import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { useMinMaxDate } from './useMinMaxDate';
import { getId, isReadOnly, isRequired } from '../../../util';
import { getPDFValueForDate, validateYearDigits, validateYearMax, validateYearMin } from '../../../util/date-utils';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useResetFormField } from '@/hooks/useResetFormField';
import { GlobalState } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';

type Props = QuestionnaireComponentItemProps & {
  onDateValueChange: (newValue: string) => void;
};

export const DateYearInput = (props: Props): JSX.Element | null => {
  const { id, pdf, linkId, onDateValueChange, idWithLinkIdAndItemIndex, children, path } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  initialize();

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const answer = useGetAnswer(linkId, path);
  const { resources } = useExternalRenderContext();
  const { error } = fieldState;
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getYearValue = (answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined): string | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    if (answerValue && answerValue.valueDate) {
      return answerValue.valueDate;
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate) {
      return undefined;
    }
    return item.initial[0].valueDate;
  };

  const onYearChange = (year: string | undefined): void => {
    onDateValueChange(year ?? '');
  };

  const yearValue: string | undefined = getYearValue(answer);
  useResetFormField(`${idWithLinkIdAndItemIndex}`, yearValue);
  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.year_field_required || '',
    },
    validate: {
      validYear: value => {
        return value ? validateYearDigits(value, resources) : true;
      },
      validMinDate: value => {
        return value ? validateYearMin(minDateTime, value, resources) : true;
      },
      validMaxDate: value => {
        return value ? validateYearMax(maxDateTime, value, resources) : true;
      },
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
        value={yearValue || ''}
        pdfValue={getPDFValueForDate(yearValue, resources?.ikkeBesvart)}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <FormGroup error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-input`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
      />
      <Input
        {...rest}
        inputId={`${getId(id)}-input`}
        type="number"
        testId={getId(id)}
        onChange={e => {
          onYearChange(e.target.value);
          onChange(e);
        }}
        value={yearValue || ''}
        width={10}
      />
    </FormGroup>
  );
};
