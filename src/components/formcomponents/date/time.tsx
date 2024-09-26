import React, { useEffect } from 'react';

import { newTimeValueAsync, NewValueAction } from '../../../actions/newValue';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { DateTime, DateTimePickerWrapper } from '@helsenorge/datepicker/components/DatePicker';
import { Controller, FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { extractHoursAndMinutesFromAnswer, validateHours, validateMaxTime, validateMinTime, validateMinutes } from '@/util/date-utils';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import TextView from '../textview';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';

export type Props = QuestionnaireComponentItemProps;

const Time = ({ id, index, path, linkId, pdf, idWithLinkIdAndItemIndex, children }: Props): JSX.Element | null => {
  initialize();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const { promptLoginMessage, onAnswerChange, resources } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { formState, getFieldState, setValue, getValues, trigger } = useFormContext<FieldValues>();
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const answer = useGetAnswer(responseItem, item);
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const hoursAndMinutesFromAnswer = extractHoursAndMinutesFromAnswer(answer, item);
  const hours = hoursAndMinutesFromAnswer?.hours;
  const minutes = hoursAndMinutesFromAnswer?.minutes;

  useEffect(() => {
    setValue(`${idWithLinkIdAndItemIndex}-hours`, hours);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, minutes);
  }, []);

  const dispatchNewTime = (newTime: string): void => {
    if (dispatch && onAnswerChange && path && item) {
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
    updateQuestionnaireResponse(newHours?.toString(), newMinutes?.toString());
  };
  const handleMinutesChange = (newMinutes: number | string | undefined): void => {
    //trigger validations in the hour field as well, to validate if time is valid
    if (formState.isSubmitted) {
      trigger(idWithLinkIdAndItemIndex + '-hours');
    }
    let newHours: number | string | undefined = hours;
    if (!hours) {
      newHours = '00';
    }
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
        <Controller
          name={idWithLinkIdAndItemIndex + '-hours'}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validHours: value => {
                const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
                return value && minutesValue ? validateHours(Number(value), resources) : true;
              },
              validMinTime: value => {
                const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
                return value && minutesValue ? validateMinTime(value, minutesValue, resources, item) : true;
              },
              validMaxTime: value => {
                const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
                return value && minutesValue ? validateMaxTime(value, minutesValue, resources, item) : true;
              },
            },
          }}
          render={({ field: { onChange } }): JSX.Element => (
            <DateTime
              inputId={`${getId(id)}-datetime-hours`}
              testId={`time-1`}
              defaultValue={Number(hours)}
              timeUnit="hours"
              onChange={e => {
                handleHoursChange(e.target.value);
                onChange(e.target.value);
              }}
            />
          )}
        />
        <Controller
          name={idWithLinkIdAndItemIndex + '-minutes'}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validMinutes: value => {
                const hoursValue = getValues(idWithLinkIdAndItemIndex + '-hours');
                return value && hoursValue ? validateMinutes(Number(value), resources) : true;
              },
            },
          }}
          render={({ field: { onChange } }): JSX.Element => (
            <DateTime
              testId={`time-2`}
              defaultValue={Number(minutes)}
              timeUnit="minutes"
              onChange={e => {
                handleMinutesChange(e.target.value);
                onChange(e.target.value);
              }}
            />
          )}
        />
      </DateTimePickerWrapper>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default Time;
