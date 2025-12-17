import { useEffect, useState } from 'react';

import { type FieldError, type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label from '@helsenorge/designsystem-react/components/Label';

import { newTimeValueAsync } from '../../../actions/newValue';
import { getId, isReadOnly } from '../../../util/index';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import dateStyles from './date.module.css';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import SafeText from '@/components/referoLabel/SafeText';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppSelector, useAppDispatch } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { TimeUnit } from '@/types/dateTypes';
import { initialize } from '@/util/date-fns-utils';
import {
  extractHoursAndMinutesFromAnswer,
  getPDFValueForTime,
  validateHours,
  validateMaxTime,
  validateMinTime,
  validateMinutes,
  validateTimeDigits,
} from '@/util/date-utils';

export type Props = QuestionnaireComponentItemProps;

const Time = ({ id, index, path, linkId, pdf, idWithLinkIdAndItemIndex, children }: Props): JSX.Element | null => {
  initialize();

  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const { formState, getFieldState, setValue, getValues, trigger, register } = useFormContext<FieldValues>();
  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const dispatch = useAppDispatch();

  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const answer = useGetAnswer(linkId, path);
  const hoursAndMinutesFromAnswer = extractHoursAndMinutesFromAnswer(answer, item);
  const hours = hoursAndMinutesFromAnswer?.hours;
  const minutes = hoursAndMinutesFromAnswer?.minutes;
  const [hoursValue, setHoursValue] = useState(hours);
  const [minutesValue, setMinutesValue] = useState(minutes);

  useResetFormField(`${idWithLinkIdAndItemIndex}-hours`, hours);
  useResetFormField(`${idWithLinkIdAndItemIndex}-minutes`, minutes);

  const getTimeValueFromAnswer = (): string | undefined => {
    if (!answer) return undefined;

    const answerItem = Array.isArray(answer) ? answer[0] : answer;
    return answerItem ? answerItem.valueTime : '';
  };

  useEffect(() => {
    setValue(`${idWithLinkIdAndItemIndex}-hours`, hours);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, minutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleHoursChange = (newHours: string | undefined): void => {
    let newMinutes: string | undefined = minutes;
    if (!minutes) {
      newMinutes = '00';
    }
    let newString = newHours === '' ? undefined : newHours;
    if (newHours && Number(newHours) >= 0 && Number(newHours) < 24) {
      newString = newHours;
    }
    setHoursValue(newString);
    updateQuestionnaireResponse(newHours, newMinutes);
  };

  const handleMinutesChange = (newMinutes: string | undefined): void => {
    //trigger validations in the hour field as well, to validate if time is valid
    if (formState.isSubmitted) {
      trigger(idWithLinkIdAndItemIndex + '-hours');
    }

    let newHours: string | undefined = hours;
    if (!hours) {
      newHours = '00';
    }
    let newString = newMinutes === '' ? undefined : newMinutes;
    if (newMinutes && Number(newMinutes) >= 0 && Number(newMinutes) < 60) {
      newString = newMinutes;
    }
    setMinutesValue(newString);
    updateQuestionnaireResponse(newHours, newMinutes);
  };

  const makeValidTime = (hours: string | undefined, minutes: string | undefined): string => {
    const paddedHours = hours?.padStart(2, '0');
    const paddedMinutes = minutes?.padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:00`;
  };

  function getCombinedFieldError(hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = hoursField.error || minutesField.error || undefined;
    return error;
  }

  const validationRulesHours: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    validate: {
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Hours, resources, item) : true;
      },
      validHours: value => {
        const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
        return value && minutesValue ? validateHours(Number(value), resources, item) : true;
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
    required: required({ item, resources }),
    validate: {
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Minutes, resources, item) : true;
      },
      validMinutes: value => {
        const hoursValue = getValues(idWithLinkIdAndItemIndex + '-hours');
        return value && hoursValue ? validateMinutes(Number(value), resources, item) : true;
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
      <FormGroup
        error={getErrorMessage(item, getCombinedFieldError(hoursField, minutesField))}
        errorWrapperClassName={styles.paddingBottom}
      >
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-datetime-hours`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label-test`}
          sublabelId={`${getId(id)}-sublabel`}
          formFieldTagId={`${getId(id)}-time-formfieldtag`}
        />
        <div className={dateStyles.timeWrapper}>
          <Input
            {...restHours}
            aria-describedby={`${getId(id)}-time-formfieldtag`}
            inputId={`${getId(id)}-datetime-hours`}
            type="number"
            min={0}
            max={23}
            testId={`test-hours-${getId(id)}`}
            onChange={e => {
              handleHoursChange(e.target.value);
              onChangeHours(e);
            }}
            width={4}
            value={hoursValue}
          />
          <Label labelTexts={[]} className={dateStyles.timeColon}>
            <SafeText as="span" text={':'}></SafeText>
          </Label>
          <Input
            {...restMinutes}
            type="number"
            min={0}
            max={59}
            testId={`test-minutes-${getId(id)}`}
            onChange={e => {
              handleMinutesChange(e.target.value);
              onChangeMinutes(e);
            }}
            width={4}
            value={minutesValue}
          />
        </div>

        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default Time;
