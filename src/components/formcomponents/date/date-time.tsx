import React, { useState } from 'react';

import { format } from 'date-fns';
import { isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import { DateTimeUnit } from '../../../types/dateTypes';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
import { GlobalState } from '../../../reducers';
import { initialize, safeParseJSON } from '../../../util/date-fns-utils';
import {
  getFullFnsDate,
  getHoursOrMinutesFromDate,
  validateDate,
  validateMinDate,
  validateMaxDate,
  validateHours,
  validateMinutes,
  parseStringToDateDDMMYYYY,
  formatDateToStringDDMMYYYY,
} from '../../../util/date-utils';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isRequired, getId, isReadOnly } from '../../../util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useDispatch } from 'react-redux';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type Props = QuestionnaireComponentItemProps;

const DateTimeInput = ({
  item,
  resources,
  path,
  pdf,
  id,
  onAnswerChange,
  idWithLinkIdAndItemIndex,
  children,
  responseItem,
  index,
  responseItems,
}: Props): JSX.Element | null => {
  const { promptLoginMessage } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(responseItem, item);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);

  const getDefaultDate = (
    item: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): Date | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;
    if (answerValue && answerValue.valueDateTime) {
      return safeParseJSON(answerValue.valueDateTime);
    }
    if (answerValue && answerValue.valueDate) {
      return safeParseJSON(answerValue.valueDate);
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return safeParseJSON(item.initial[0].valueDateTime);
    }
    return safeParseJSON(item.initial[0].valueDate);
  };

  const getMaxDate = (): Date | undefined => {
    const maxDate = getExtension(Extensions.DATE_MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueString) return evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
    return getMaxDateWithExtension();
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(Extensions.MAX_VALUE_URL, item);
    if (!maxDate) {
      return;
    }
    if (maxDate.valueDate) {
      return safeParseJSON(String(maxDate.valueDate));
    } else if (maxDate.valueDateTime) {
      return safeParseJSON(String(maxDate.valueDateTime));
    }
    return undefined;
  };

  const getMinDate = (): Date | undefined => {
    const minDate = getExtension(Extensions.DATE_MIN_VALUE_URL, item);
    if (minDate && minDate.valueString) return evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
    return getMinDateWithExtension();
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(Extensions.MIN_VALUE_URL, item);
    if (!minDate) {
      return;
    }
    if (minDate.valueDate) {
      return safeParseJSON(String(minDate.valueDate));
    } else if (minDate.valueDateTime) {
      return safeParseJSON(String(minDate.valueDateTime));
    }
    return undefined;
  };

  const convertDateToString = (item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer): string | undefined => {
    const date = getDefaultDate(item, answer);
    if (date) {
      return format(date, 'dd.MM.yyyy HH:mm');
    }
    return undefined;
  };

  const getStringValue = (): string => {
    if (Array.isArray(answer)) {
      return answer.map(m => convertDateToString(item, m)).join(', ');
    }
    const date = convertDateToString(item, answer);
    let text = '';
    if (resources && resources.ikkeBesvart) {
      text = resources.ikkeBesvart;
    }
    return date ?? text;
  };

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getStringValue()}>
        {children}
      </TextView>
    );
  }

  const [date, setDate] = React.useState<Date | undefined>(getDefaultDate(item, answer));
  const [hours, setHours] = React.useState(getHoursOrMinutesFromDate(date, DateTimeUnit.Hours));
  const [minutes, setMinutes] = React.useState(getHoursOrMinutesFromDate(date, DateTimeUnit.Minutes));

  const maxDateTime = getMaxDate();
  const minDateTime = getMinDate();

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    const validationTextExtension = getValidationTextExtension(item);
    if (validationTextExtension) {
      return validationTextExtension;
    }
    if (error) {
      return error.message;
    }
  };

  function getCombinedFieldError(dateField: FieldValues, hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = dateField.error || hoursField.error || minutesField.error || undefined;
    return error;
  }

  const handleDateChange = (newDate: Date | string | undefined): void => {
    let dateString: Date | string | undefined = '';
    if (newDate && typeof newDate !== 'string') {
      dateString = formatDateToStringDDMMYYYY(newDate);
      setDate(newDate);
    } else if (newDate) {
      dateString = newDate;
      const newDateParsed = parseStringToDateDDMMYYYY(newDate);
      isValid(newDateParsed) && setDate(newDateParsed);
    }

    setValue(`${idWithLinkIdAndItemIndex}-date`, dateString);
    updateQuestionnaireResponse(dateString, hours, minutes);
  };
  const handleHoursChange = (newHours: string | undefined): void => {
    setHours(newHours);
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    updateQuestionnaireResponse(date, newHours, minutes);
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
    setMinutes(newMinutes);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    updateQuestionnaireResponse(date, hours, newMinutes);
  };

  initialize();

  const updateQuestionnaireResponse = (date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): void => {
    const fullDate = getFullFnsDate(date, hours, minutes);
    const existingAnswer = !Array.isArray(answer) ? answer?.valueDateTime : answer?.map(m => m.valueDateTime).join(', ');

    if (fullDate) {
      if (dispatch && existingAnswer !== fullDate && onAnswerChange && path) {
        dispatch(newDateTimeValueAsync(path, fullDate, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueDateTime: fullDate } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  return (
    <div className="page_refero__component page_refero__component_datetime">
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-datepicker`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
      />
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
      <DateTimePickerWrapper errorText={getErrorText(getCombinedFieldError(dateField, hoursField, minutesField))}>
        <DatePicker
          {...register(idWithLinkIdAndItemIndex + '-date', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validDate: value => {
                return validateDate(parseStringToDateDDMMYYYY(value), resources);
              },
              validMinDate: value => {
                return validateMinDate(minDateTime, parseStringToDateDDMMYYYY(value), resources);
              },
              validMaxDate: value => {
                return validateMaxDate(maxDateTime, parseStringToDateDDMMYYYY(value), resources);
              },
            },
          })}
          inputId={`${getId(id)}-datepicker`}
          testId={`${getId(id)}-datepicker-test`}
          autoComplete=""
          dateButtonAriaLabel="Open datepicker"
          dateFormat={'dd.MM.yyyy'}
          dateValue={date}
          minDate={minDateTime}
          maxDate={maxDateTime}
          onChange={(_e, newDate) => {
            handleDateChange(newDate);
          }}
        />
        <DateTime
          {...register(idWithLinkIdAndItemIndex + '-hours', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validHours: value => {
                return validateHours(Number(value), resources);
              },
            },
          })}
          testId={`datetime-1`}
          defaultValue={Number(hours)}
          timeUnit="hours"
          onChange={e => {
            handleHoursChange(e.target.value);
          }}
        />
        <DateTime
          {...register(idWithLinkIdAndItemIndex + '-minutes', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validMinutes: value => {
                return validateMinutes(Number(value), resources);
              },
            },
          })}
          testId={`datetime-2`}
          defaultValue={Number(minutes)}
          timeUnit="minutes"
          onChange={e => {
            handleMinutesChange(e.target.value);
          }}
        />
      </DateTimePickerWrapper>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DateTimeInput);
