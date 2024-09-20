import React from 'react';

import { newTimeValueAsync, NewValueAction } from '../../../actions/newValue';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { DateTime, DateTimePickerWrapper } from '@helsenorge/datepicker/components/DatePicker';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { extractHoursAndMinutesFromAnswer, validateHours, validateMaxTime, validateMinTime, validateMinutes } from '@/util/date-utils';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import TextView from '../textview';
import { useIsEnabled } from '@/hooks/useIsEnabled';

export type Props = QuestionnaireComponentItemProps;

const Time = ({
  id,
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
  const enable = useIsEnabled(item);
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const answer = useGetAnswer(responseItem, item);
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const hoursAndMinutesFromAnswer = extractHoursAndMinutesFromAnswer(answer, item);
  const hours = hoursAndMinutesFromAnswer?.hours;
  const minutes = hoursAndMinutesFromAnswer?.minutes;

  const dispatchNewTime = (newTime: string): void => {
    if (dispatch && onAnswerChange && path) {
      dispatch(newTimeValueAsync(path, newTime, item))?.then(newState => onAnswerChange(newState, item, { valueTime: newTime }));
    }
  };

  const updateQuestionnaireResponse = (newHours: string | undefined, newMinutes: string | undefined): void => {
    const validTime = makeValidTime(newHours, newMinutes);
    dispatchNewTime(validTime);
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const handleHoursChange = (newHours: number | string | undefined): void => {
    let newMinutes: number | string | undefined = minutes;
    if (!minutes) {
      newMinutes = '00';
    }
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    updateQuestionnaireResponse(newHours?.toString(), newMinutes?.toString());
  };
  const handleMinutesChange = (newMinutes: number | string | undefined): void => {
    let newHours: number | string | undefined = hours;
    if (!hours) {
      newHours = '00';
    }
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    updateQuestionnaireResponse(newHours?.toString(), newMinutes?.toString());
  };

  const makeValidTime = (hours: string | undefined, minutes: string | undefined): string => {
    const paddedHours = hours?.padStart(2, '0');
    const paddedMinutes = minutes?.padStart(2, '0');

    return addSeconds(`${paddedHours}:${paddedMinutes}`);
  };

  const addSeconds = (time: string): string => {
    if (time && time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
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

  const getPDFValue = (): string | undefined => {
    const hoursAndMinutesValue = extractHoursAndMinutesFromAnswer(answer, item);
    const hoursValue = hoursAndMinutesFromAnswer?.hours;
    const minutesValue = hoursAndMinutesFromAnswer?.minutes;
    if (hoursAndMinutesValue === null || hoursAndMinutesValue === undefined) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }
    return `${'kl. '} ${hoursValue}:${minutesValue}`;
  };

  if (!enable) {
    return null;
  }
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }

  return (
    <div className="page_refero__component page_refero__component_time">
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={`${getId(id)}-datetime-hours`}
        labelId={`${getId(id)}-label`}
        testId={`${getId(id)}-label-test`}
        sublabelId={`${getId(id)}-sublabel`}
        afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
      />
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
      <DateTimePickerWrapper errorText={getErrorText(getCombinedFieldError(hoursField, minutesField))}>
        <DateTime
          {...register(idWithLinkIdAndItemIndex + '-hours', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validHours: value => {
                return value ? validateHours(Number(value), resources) : true;
              },
              validMinTime: value => {
                return validateMinTime(value, minutes, resources, item);
              },
              validMaxTime: value => {
                return validateMaxTime(value, minutes, resources, item);
              },
            },
          })}
          inputId={`${getId(id)}-datetime-hours`}
          testId={`time-1`}
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
          testId={`time-2`}
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
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default Time;
