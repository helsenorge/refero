import React, { useEffect } from 'react';

import { newTimeValueAsync } from '../../../actions/newValue';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useSelector } from 'react-redux';

import { GlobalState, useAppDispatch } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { DateTime, DateTimePickerWrapper } from '@helsenorge/datepicker/components/DatePicker';
import styles from '../common-styles.module.css';
import { FieldError, FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import {
  extractHoursAndMinutesFromAnswer,
  getPDFValueForTime,
  validateHours,
  validateMaxTime,
  validateMinTime,
  validateMinutes,
} from '@/util/date-utils';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';

export type Props = QuestionnaireComponentItemProps;

const Time = ({ id, index, path, linkId, pdf, idWithLinkIdAndItemIndex, children }: Props): JSX.Element | null => {
  initialize();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const dispatch = useAppDispatch();
  const { formState, getFieldState, setValue, getValues, trigger, register } = useFormContext<FieldValues>();
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const answer = useGetAnswer(linkId, path);
  const hoursAndMinutesFromAnswer = extractHoursAndMinutesFromAnswer(answer, item);
  const hours = hoursAndMinutesFromAnswer?.hours;
  const minutes = hoursAndMinutesFromAnswer?.minutes;

  const getTimeValueFromAnswer = (): string | undefined => {
    if (!answer) return undefined;

    const answerItem = Array.isArray(answer) ? answer[0] : answer;
    return answerItem ? answerItem.valueTime : '';
  };

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

  const validationRulesHours: RegisterOptions<FieldValues, string> | undefined = {
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
    shouldUnregister: true,
  };

  const validationRulesMinutes: RegisterOptions<FieldValues, string> | undefined = {
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
    shouldUnregister: true,
  };

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
        value={getTimeValueFromAnswer()}
        pdfValue={getPDFValueForTime(answer, item, resources)}
        errors={getCombinedFieldError(hoursField, minutesField)}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_time">
      <FormGroup error={getErrorText(getCombinedFieldError(hoursField, minutesField))} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-datetime-hours`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label-test`}
          sublabelId={`${getId(id)}-sublabel`}
        />
        <DateTimePickerWrapper>
          <DateTime
            {...restHours}
            inputId={`${getId(id)}-datetime-hours`}
            testId={`time-1`}
            defaultValue={Number(hours)}
            timeUnit="hours"
            onChange={e => {
              handleHoursChange(e.target.value);
              onChangeHours(e);
            }}
          />

          <DateTime
            {...restMinutes}
            testId={`time-2`}
            defaultValue={Number(minutes)}
            timeUnit="minutes"
            onChange={e => {
              handleMinutesChange(e.target.value);
              onChangeMinutes(e);
            }}
          />
        </DateTimePickerWrapper>
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default Time;
