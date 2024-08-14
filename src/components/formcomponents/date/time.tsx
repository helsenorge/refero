import React from 'react';

import { getHours, getMinutes } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import * as DateTimeConstants from '../../../constants/dateTimeConstants';

import { newTimeValueAsync, NewValueAction } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
import { safeParseJSON } from '../../../util/date-fns-utils';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { DateTime, DateTimePickerWrapper } from '@helsenorge/datepicker/components/DatePicker';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { extractTimeFromAnswer, validateHours, validateMinutes } from '@/util/date-utils';

export type Props = QuestionnaireComponentItemProps;

const Time = ({
  index,
  item,
  responseItem,
  responseItems,
  resources,
  path,
  pdf,
  idWithLinkIdAndItemIndex,
  children,
}: Props): JSX.Element | null => {
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);

  const answer = useGetAnswer(responseItem, item);
  const [hours, setHours] = React.useState(extractTimeFromAnswer(answer)?.hours);
  const [minutes, setMinutes] = React.useState(extractTimeFromAnswer(answer)?.minutes);

  const convertAnswerToString = (answer: QuestionnaireResponseItemAnswer): string => {
    if (answer && answer.valueTime) {
      return answer.valueTime;
    }
    if (answer && answer.valueDate) {
      return getTimeStringFromDate(safeParseJSON(String(answer.valueDate)));
    }
    if (answer && answer.valueDateTime) {
      return getTimeStringFromDate(safeParseJSON(String(answer.valueDateTime)));
    }
    return '';
  };

  const getValue = (): string | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(m => convertAnswerToString(m)).join(', ');
    }
    if (answer) {
      return convertAnswerToString(answer);
    }
  };

  const getPDFValue = (): string => {
    const value = getValue();
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  };

  const getTimeStringFromDate = (date: Date | undefined): string => {
    if (!date) {
      return '';
    }
    const hours = getHours(date);
    const minutes = getMinutes(date);
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}${DateTimeConstants.TIME_SEPARATOR}${formattedMinutes}`;
  };

  // const getMaxHour = (): number => {
  //   const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
  //   if (!maxTime) {
  //     return 23;
  //   }
  //   const maxTimeString = String(maxTime.valueTime);
  //   const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
  //   return parseInt(hoursString, 10);
  // };

  // const getMaxMinute = (): number => {
  //   const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
  //   if (!maxTime) {
  //     return 59;
  //   }
  //   const maxTimeString = String(maxTime.valueTime);
  //   const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
  //   return parseInt(minuteString, 10);
  // };

  // const getMinHour = (): number => {
  //   const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
  //   if (!minTime) {
  //     return 0;
  //   }
  //   const minTimeString = String(minTime.valueTime);
  //   const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
  //   return parseInt(hoursString, 10);
  // };

  // const getMinMinute = (): number => {
  //   const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
  //   if (!minTime) {
  //     return 0;
  //   }
  //   const minTimeString = String(minTime.valueTime);
  //   const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
  //   return parseInt(minuteString, 10);
  // };

  const dispatchNewTime = (newTime: string): void => {
    if (dispatch && onAnswerChange && path) {
      dispatch(newTimeValueAsync(path, newTime, item))?.then(newState => onAnswerChange(newState, item, { valueTime: newTime }));
    }
  };

  const updateQuestionnaireResponse = (newHours: number | undefined, newMinutes: number | undefined): void => {
    const validTime = makeValidTime(newHours, newMinutes);

    dispatchNewTime(validTime);
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const handleHoursChange = (newHours: number | undefined): void => {
    if (!minutes) {
      setMinutes(Number('00'));
    }
    setHours(newHours);
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    updateQuestionnaireResponse(newHours, minutes);
  };
  const handleMinutesChange = (newMinutes: number | undefined): void => {
    if (!hours) {
      setHours(Number('00'));
    }
    setMinutes(newMinutes);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    updateQuestionnaireResponse(hours, newMinutes);
  };

  const makeValidTime = (hours: number | undefined, minutes: number | undefined): string => {
    const paddedHours = hours?.toString().padStart(2, '0');
    const paddedMinutes = minutes?.toString().padStart(2, '0');

    return addSeconds(`${paddedHours}:${paddedMinutes}`);
  };

  const addSeconds = (time: string): string => {
    if (time && time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
  };

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    const validationTextExtension = getValidationTextExtension(item);
    if (validationTextExtension) {
      return validationTextExtension;
    }
    if (error) {
      return error.message;
    }
  };

  function getCombinedFieldError(hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = hoursField.error || minutesField.error || undefined;
    return error;
  }

  // const getResetButtonText = (): string => {
  //   if (resources && resources.resetTime) {
  //     return resources.resetTime;
  //   }
  //   return '';
  // };

  const padNumber = (value?: string): string => {
    if (value) {
      const values = value.split(':');
      let retVal = '';
      for (let i = 0; i < values.length; i++) {
        let timeString = '';
        if (parseInt(values[i], 10) < 10 && values[i].length === 1) {
          timeString += '0';
        }
        timeString += values[i];
        if (i !== values.length - 1) {
          timeString += ':';
        }
        retVal += timeString;
      }
      return retVal;
    }
    return '';
  };

  if (pdf || isReadOnly(item)) {
    const value = getPDFValue();

    return (
      <span>
        {', kl. '} {padNumber(value)}
      </span>
    );
  }

  return (
    <div className="page_refero__component page_refero__component_time">
      <DateTimePickerWrapper errorText={getErrorText(getCombinedFieldError(hoursField, minutesField))}>
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
            handleHoursChange(Number(e.target.value));
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
            handleMinutesChange(Number(e.target.value));
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

export default Time;
