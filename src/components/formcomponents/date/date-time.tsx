import { useEffect, useState } from 'react';

import { isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldError, FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';


import { DateFormat, DateTimeUnit, defaultMaxDate, defaultMinDate, TimeUnit } from '../../../types/dateTypes';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label from '@helsenorge/designsystem-react/components/Label';

import { DatePicker } from '@helsenorge/datepicker/components/DatePicker';


import { useMinMaxDate } from './useMinMaxDate';
import { newDateTimeValueAsync } from '../../../actions/newValue';
import { GlobalState, useAppDispatch } from '../../../reducers';
import { initialize } from '../../../util/date-fns-utils';
import {
  getFullFnsDate,
  getHoursOrMinutesFromDate,
  validateDate,
  validateMinDate,
  validateMaxDate,
  validateHours,
  validateMinutes,
  parseStringToDate,
  getPDFValueForDate,
  validateTimeDigits,
} from '../../../util/date-utils';
import { isRequired, getId, isReadOnly } from '../../../util/index';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import dateStyles from './date.module.css';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import SafeText from '@/components/referoLabel/SafeText';
import { getErrorMessage } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { findQuestionnaireItem } from '@/reducers/selectors';

export type Props = QuestionnaireComponentItemProps;

const DateTimeInput = ({ linkId, path, pdf, id, idWithLinkIdAndItemIndex, children, index }: Props): JSX.Element | null => {
  initialize();

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const dispatch = useAppDispatch();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const answer = useGetAnswer(linkId, path);
  const { formState, getFieldState, getValues, register } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

  const getDateAnswerValue = (
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined
  ): string | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    if (answerValue && answerValue.valueDate) {
      return answerValue.valueDate;
    }
    if (answerValue && answerValue.valueDateTime) {
      return answerValue.valueDateTime;
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return item.initial[0].valueDateTime;
    }
    return item.initial[0].valueDate;
  };

  const dateAnswerValue = getDateAnswerValue(answer);
  const dateAnswerValueParsed = parseStringToDate(dateAnswerValue);
  const [dateValue, setDateValue] = useState<Date | undefined>(dateAnswerValueParsed);
  const [dateValueContainer, setDateValueContainer] = useState<Date | string | undefined>(dateAnswerValueParsed);
  const [hours, setHours] = useState(getHoursOrMinutesFromDate(dateValue, DateTimeUnit.Hours));
  const [minutes, setMinutes] = useState(getHoursOrMinutesFromDate(dateValue, DateTimeUnit.Minutes));
  const pdfValue = getPDFValueForDate(dateAnswerValue, resources?.ikkeBesvart, DateFormat.yyyyMMddHHmmssXXX, DateFormat.ddMMyyyyHHmm);

  useResetFormField(`${idWithLinkIdAndItemIndex}-date`, dateAnswerValue);
  useResetFormField(`${idWithLinkIdAndItemIndex}-hours`, hours);
  useResetFormField(`${idWithLinkIdAndItemIndex}-minutes`, minutes);

  useEffect(() => {
    if (isValid(dateAnswerValueParsed)) {
      setDateValue(dateAnswerValueParsed);
    }
  }, [dateAnswerValue]);

  function getCombinedFieldError(dateField: FieldValues, hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = dateField.error || hoursField.error || minutesField.error || undefined;
    return error;
  }

  const handleDateChange = (newDate: string | Date | undefined): void => {
    setDateValueContainer(newDate);
    if (typeof newDate === 'string') {
      const parsedDate = parseStringToDate(newDate);
      if (isValid(parsedDate)) {
        setDateValue(parsedDate);
        setDateValueContainer(parsedDate);
      }
      updateQuestionnaireResponse(parsedDate, hours, minutes);
    } else {
      if (isValid(newDate)) {
        setDateValue(newDate);
        setDateValueContainer(newDate);
      }
      updateQuestionnaireResponse(newDate, hours, minutes);
    }
  };

  const handleHoursChange = (newHours: string | undefined): void => {
    let newString = newHours === '' ? undefined : newHours;
    if (newHours && Number(newHours) >= 0 && Number(newHours) < 24) {
      newString = newHours;
    }
    setHours(newString);
    const newDate = dateValueContainer;
    updateQuestionnaireResponse(newDate, newString, minutes);
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
    let newString = newMinutes === '' ? undefined : newMinutes;
    if (newMinutes && Number(newMinutes) >= 0 && Number(newMinutes) < 60) {
      newString = newMinutes;
    }
    setMinutes(newString);
    const newDate = dateValueContainer;
    updateQuestionnaireResponse(newDate, hours, newString);
  };

  const updateQuestionnaireResponse = (
    newDate: Date | string | undefined,
    newHours: string | undefined,
    newMinutes: string | undefined
  ): void => {
    let fullDate: string | undefined = undefined;

    if (isValid(newDate) && newHours && newMinutes) {
      fullDate = getFullFnsDate(newDate, newHours, newMinutes);
    }

    if (dispatch && onAnswerChange && path && item) {
      dispatch(newDateTimeValueAsync(path, fullDate ?? '', item))?.then(newState =>
        onAnswerChange(newState, item, { valueDateTime: fullDate })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const doesAnyFieldsHaveValue = (): boolean => {
    const dateValue = getValues(idWithLinkIdAndItemIndex + '-date');
    const hoursValue = getValues(idWithLinkIdAndItemIndex + '-hours');
    const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
    return dateValue || hoursValue || minutesValue;
  };

  const validationRulesDate: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validDate: value => {
        return doesAnyFieldsHaveValue() ? validateDate(parseStringToDate(value) ?? value, resources) : true;
      },
      validMinDate: value => {
        return doesAnyFieldsHaveValue() ? validateMinDate(minDateTime, parseStringToDate(value), resources) : true;
      },
      validMaxDate: value => {
        return doesAnyFieldsHaveValue() ? validateMaxDate(maxDateTime, parseStringToDate(value), resources) : true;
      },
    },
    shouldUnregister: true,
  };

  const validationRulesHours: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Hours, resources) : true;
      },
      validHours: value => {
        return doesAnyFieldsHaveValue() ? validateHours(Number(value), resources) : true;
      },
    },
    shouldUnregister: true,
  };

  const validationRulesMinutes: RegisterOptions<FieldValues, string> | undefined = {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Minutes, resources) : true;
      },
      validMinutes: value => {
        return doesAnyFieldsHaveValue() ? validateMinutes(Number(value), resources) : true;
      },
    },
    shouldUnregister: true,
  };

  const { onChange: onChangeDate, ...restDate } = register(
    `${idWithLinkIdAndItemIndex}-date`,
    shouldValidate(item, pdf) ? validationRulesDate : undefined
  );
  const { onChange: onChangeHours, ...restHours } = register(
    `${idWithLinkIdAndItemIndex}-hours`,
    shouldValidate(item, pdf) ? validationRulesHours : undefined
  );
  const { onChange: onChangeMinutes, ...restMinutes } = register(
    `${idWithLinkIdAndItemIndex}-minutes`,
    shouldValidate(item, pdf) ? validationRulesMinutes : undefined
  );

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={dateAnswerValue}
        pdfValue={pdfValue}
        errors={getCombinedFieldError(dateField, hoursField, minutesField)}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_datetime" data-testid={`${getId(id)}-container`}>
      <FormGroup
        error={getErrorMessage(item, getCombinedFieldError(dateField, hoursField, minutesField))}
        errorWrapperClassName={styles.paddingBottom}
      >
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-datepicker`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-datetime-label`}
          sublabelId={`${getId(id)}-sublabel`}
          dateLabel={resources?.dateFormat_ddmmyyyy}
        />
        <div className={dateStyles.dateTimeWrapper}>
          <div>
            <DatePicker
              {...restDate}
              inputId={`${getId(id)}-datepicker`}
              testId={`${getId(id)}-datetime`}
              autoComplete=""
              dateButtonAriaLabel="Open datepicker"
              dateFormat={'dd.MM.yyyy'}
              dateValue={isValid(dateValue) ? dateValue : undefined}
              minDate={minDateTime ?? defaultMinDate}
              maxDate={maxDateTime ?? defaultMaxDate}
              onChange={(e, newDate) => {
                handleDateChange(newDate);
                onChangeDate(e);
              }}
            />
          </div>

          <div className={dateStyles.timeWrapper}>
            <Input
              {...restHours}
              type="number"
              testId={`hours-test`}
              onChange={e => {
                handleHoursChange(e.target.value);
                onChangeHours(e);
              }}
              min={0}
              max={23}
              inputMode="numeric"
              width={4}
              value={hours}
            />
            <Label labelTexts={[]} className={dateStyles.timeColon}>
              <SafeText as="span" text={':'}></SafeText>
            </Label>
            <Input
              {...restMinutes}
              type="number"
              min={0}
              max={59}
              testId={`minutes-test`}
              inputMode="numeric"
              onChange={e => {
                handleMinutesChange(e.target.value);
                onChangeMinutes(e);
              }}
              width={4}
              value={minutes}
            />
          </div>
        </div>
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default DateTimeInput;
