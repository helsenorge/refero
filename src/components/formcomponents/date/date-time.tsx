import { useState } from 'react';

import { format, isValid } from 'date-fns';

import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import { DateTimeUnit } from '../../../types/dateTypes';

import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
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
  initialize();

  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(responseItem, item);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);
  const enable = useIsEnabled(item);

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

  if (!enable) {
    return null;
  }
  const dateAnswerValue = getDateAnswerValue(answer);
  const date: Date | string | undefined = parseStringToDate(dateAnswerValue);

  if (pdf || isReadOnly(item)) {
    const getPDFValue = (): string | number | undefined => {
      if (dateAnswerValue === undefined || dateAnswerValue === null || dateAnswerValue === '') {
        let text = '';
        if (resources && resources.ikkeBesvart) {
          text = resources.ikkeBesvart;
        }
        return text;
      }
      if (date && isValid(date)) {
        return format(date, 'dd.MM.yyyy HH:mm');
      }
    };
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }

  const hours = getHoursOrMinutesFromDate(date, DateTimeUnit.Hours) || '00';
  const minutes = getHoursOrMinutesFromDate(date, DateTimeUnit.Minutes) || '00';

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

  const handleDateChange = (newDate: string | Date | undefined): void => {
    updateQuestionnaireResponse(newDate, hours, minutes);
    setValue(`${idWithLinkIdAndItemIndex}-date`, newDate);
  };

  const handleHoursChange = (newHours: string | undefined): void => {
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    if (newHours && Number(newHours) >= 0 && Number(newHours) < 24) {
      updateQuestionnaireResponse(date, newHours, minutes);
    }
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    if (newMinutes && Number(newMinutes) >= 0 && Number(newMinutes) < 60) {
      updateQuestionnaireResponse(date, hours, newMinutes);
    }
  };

  const updateQuestionnaireResponse = (
    newDate: Date | string | undefined,
    newHours: string | undefined,
    newMinutes: string | undefined
  ): void => {
    let fullDate: string | undefined = '';
    if (typeof newDate === 'string') {
      const parsedDate = parseStringToDate(newDate);
      if (isValid(parsedDate)) {
        if (parsedDate && isValid(parsedDate)) {
          const formatedDate = format(parsedDate, 'yyyy-MM-dd');
          fullDate = getFullFnsDate(formatedDate, newHours, newMinutes);
        }
      }
    } else if (isValid(newDate)) {
      fullDate = getFullFnsDate(newDate, newHours, newMinutes);
    }

    if (dispatch && onAnswerChange && path) {
      dispatch(newDateTimeValueAsync(path, fullDate ?? '', item))?.then(newState =>
        onAnswerChange(newState, item, { valueDateTime: fullDate })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  return (
    <div className="page_refero__component page_refero__component_datetime" data-testid={`${getId(id)}-container`}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-datepicker`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-datetime-label`}
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
                return validateDate(parseStringToDate(value) ? parseStringToDate(value) : value, resources);
              },
              validMinDate: value => {
                return validateMinDate(minDateTime, parseStringToDate(value), resources);
              },
              validMaxDate: value => {
                return validateMaxDate(maxDateTime, parseStringToDate(value), resources);
              },
            },
          })}
          inputId={`${getId(id)}-datepicker`}
          testId={`${getId(id)}-datetime`}
          autoComplete=""
          dateButtonAriaLabel="Open datepicker"
          dateFormat={'dd.MM.yyyy'}
          dateValue={isValid(date) ? date : undefined}
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
          testId={`hours-test`}
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
          testId={`minutes-test`}
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
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default DateTimeInput;
