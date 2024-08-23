import { useState } from 'react';

import { format, parseISO, isValid, formatISO, parse } from 'date-fns';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import { DateTimeUnit } from '../../../types/dateTypes';

import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
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
} from '../../../util/date-utils';
import { getValidationTextExtension } from '../../../util/extension';
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
import { useMinMaxDate } from './useMinMaxDate';
import { useIsEnabled } from '@/hooks/useIsEnabled';

export type Props = QuestionnaireComponentItemProps;
initialize();

const DateTimeInput = ({
  item,
  resources,
  path,
  pdf,
  id,
  idWithLinkIdAndItemIndex,
  children,
  responseItem,
  index,
  responseItems,
}: Props): JSX.Element | null => {
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(responseItem, item);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState, register, setValue, trigger } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);
  const enable = useIsEnabled(item);
  const getDefaultDate = (
    item: QuestionnaireItem,
    answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]
  ): Date | undefined => {
    const answerValue = Array.isArray(answer) ? answer[0] : answer;

    if (answerValue && answerValue.valueDateTime) {
      return parseISO(answerValue.valueDateTime) ?? safeParseJSON(answerValue.valueDateTime);
    }
    if (answerValue && answerValue.valueDate) {
      return parseISO(answerValue.valueDate) ?? safeParseJSON(answerValue.valueDate);
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return parseISO(item.initial[0].valueDateTime) ?? safeParseJSON(item.initial[0].valueDateTime);
    }
    if (item.initial[0].valueDate) {
      return parseISO(item.initial[0].valueDate) ?? safeParseJSON(item.initial[0].valueDate);
    }
    return undefined;
  };

  const date = getDefaultDate(item, answer);
  const hours = getHoursOrMinutesFromDate(date, DateTimeUnit.Hours);
  const minutes = getHoursOrMinutesFromDate(date, DateTimeUnit.Minutes);

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
    let text = '';
    if (resources && resources.ikkeBesvart) {
      text = resources.ikkeBesvart;
    }
    return convertDateToString(item, answer) ?? text;
  };

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
      return error.message;
    }
  };

  function getCombinedFieldError(dateField: FieldValues, hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = dateField.error || hoursField.error || minutesField.error || undefined;
    return error;
  }

  const handleDateChange = (newDate: Date | string | undefined): void => {
    let dateString: Date | string | undefined = '';
    if (typeof newDate === 'object') {
      dateString = formatISO(newDate);
    } else if (typeof newDate === 'string') {
      if (newDate === '') {
        dateString = undefined;
      } else if (isValid(parseISO(newDate))) {
        dateString = parseISO(newDate);
      } else if (isValid(parse(newDate, 'dd.MM.yyyy', new Date()))) {
        dateString = parse(newDate, 'dd.MM.yyyy', new Date());
      } else {
        dateString = '';
      }
    } else if (newDate) {
      dateString = newDate;
    }

    setValue(`${idWithLinkIdAndItemIndex}-date`, dateString);
    trigger(`${idWithLinkIdAndItemIndex}-date`);
    updateQuestionnaireResponse(dateString, hours, minutes);
  };
  const handleHoursChange = (newHours: string | undefined): void => {
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    if (newHours && Number(newHours) >= 0 && Number(newHours) < 24) {
      trigger(`${idWithLinkIdAndItemIndex}-hours`);

      updateQuestionnaireResponse(date, newHours, minutes);
    }
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    trigger(`${idWithLinkIdAndItemIndex}-minutes`);
    if (newMinutes && Number(newMinutes) >= 0 && Number(newMinutes) < 60) {
      updateQuestionnaireResponse(date, hours, newMinutes);
    }
  };

  const updateQuestionnaireResponse = (date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): void => {
    const fullDate = getFullFnsDate(date, hours, minutes);
    const existingAnswer = !Array.isArray(answer) ? answer?.valueDateTime : answer?.map(m => m.valueDateTime).join(', ');

    if (dispatch && existingAnswer !== fullDate && onAnswerChange && path) {
      dispatch(newDateTimeValueAsync(path, fullDate ?? '', item))?.then(newState =>
        onAnswerChange(newState, item, { valueDateTime: fullDate })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };
  if (!enable) {
    return null;
  }
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getStringValue()}>
        {children}
      </TextView>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_datetime" data-testid={`${getId(id)}-container`}>
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
      <DateTimePickerWrapper
        testId={`${getId(id)}-datetime-wrapper`}
        errorText={getErrorText(getCombinedFieldError(dateField, hoursField, minutesField))}
      >
        <DatePicker
          {...register(`${idWithLinkIdAndItemIndex}-date`, {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validDate: value => {
                return validateDate(value ? parseStringToDateDDMMYYYY(value) : undefined, resources);
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
          {...register(`${idWithLinkIdAndItemIndex}-hours`, {
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
          testId={`${getId(id)}-datetime-1`}
          defaultValue={hours ? Number(hours) : 0}
          timeUnit="hours"
          onChange={e => {
            handleHoursChange(e.target.value);
          }}
        />
        <DateTime
          {...register(`${idWithLinkIdAndItemIndex}-minutes`, {
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
          testId={`${getId(id)}-datetime-2`}
          defaultValue={minutes ? Number(minutes) : 0}
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
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default DateTimeInput;
