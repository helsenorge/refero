import React from 'react';

import { getHours, getMinutes } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';

import TimeInput from '@helsenorge/date-time/components/time-input';
import * as DateTimeConstants from '@helsenorge/date-time/constants/datetime';

import { newTimeValueAsync, NewValueAction } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
import { safeParseJSON } from '../../../util/date-fns-utils';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { DateTime } from '@helsenorge/datepicker/components/DatePicker';
import { FieldValues, useFormContext } from 'react-hook-form';
import { validateHours, validateMinutes } from '@/util/date-utils';

export type Props = QuestionnaireComponentItemProps;

export const Time = ({
  index,
  item,
  responseItem,
  responseItems,
  resources,
  path,
  pdf,
  id,
  idWithLinkIdAndItemIndex,
  onAnswerChange,
  children,
}: Props) => {
  const { promptLoginMessage } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { register } = useFormContext<FieldValues>();

  const answer = useGetAnswer(responseItem, item);

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

  const getMaxHour = (): number => {
    const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
    if (!maxTime) {
      return 23;
    }
    const maxTimeString = String(maxTime.valueTime);
    const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  };

  const getMaxMinute = (): number => {
    const maxTime = getExtension(Extensions.MAX_VALUE_URL, item);
    if (!maxTime) {
      return 59;
    }
    const maxTimeString = String(maxTime.valueTime);
    const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  };

  const getMinHour = (): number => {
    const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  };

  const getMinMinute = (): number => {
    const minTime = getExtension(Extensions.MIN_VALUE_URL, item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  };

  const dispatchNewTime = (newTime: string): void => {
    if (dispatch && onAnswerChange && path) {
      dispatch(newTimeValueAsync(path, newTime, item))?.then(newState => onAnswerChange(newState, path, item, { valueTime: newTime }));
    }
  };

  const onTimeChange = (newTime: string = ''): void => {
    const validTime = makeValidTime(newTime);

    dispatchNewTime(validTime);
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const makeValidTime = (time: string): string => {
    const values = time.split(':');
    const hours = values[0] || '00';
    const minutes = values[1] || '00';
    return addSeconds(`${hours.slice(-2)}:${minutes.slice(-2)}`);
  };

  const addSeconds = (time: string): string => {
    if (time !== '' && time.split(':').length === 2) {
      return (time += ':00');
    }
    return time;
  };

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

  const getResetButtonText = (): string => {
    if (resources && resources.resetTime) {
      return resources.resetTime;
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
      <TimeInput
        {...register(item.linkId, {
          required: isRequired(item),
        })}
        id={getId(id)}
        value={getValue()}
        isRequired={isRequired(item)}
        maxHour={getMaxHour()}
        minHour={getMinHour()}
        maxMinute={getMaxMinute()}
        minMinute={getMinMinute()}
        onBlur={onTimeChange}
        errorMessage={getValidationTextExtension(item)}
        resetButton={{
          resetButtonText: getResetButtonText(),
          onReset: onTimeChange,
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
