import { useEffect, useState } from 'react';

import { newTimeValueAsync } from '../../../actions/newValue';
import { getId, isReadOnly, isRequired } from '../../../util/index';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useSelector } from 'react-redux';

import { GlobalState, useAppDispatch } from '@/reducers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import styles from '../common-styles.module.css';
import { FieldError, FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import {
  extractHoursAndMinutesFromAnswer,
  getPDFValueForTime,
  validateHours,
  validateMaxTime,
  validateMinTime,
  validateMinutes,
  validateTimeDigits,
} from '@/util/date-utils';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';
import { getErrorMessage } from '@/components/validation/rules';
import { TimeUnit } from '@/types/dateTypes';
import { useResetFormField } from '@/hooks/useResetFormField';
import dateStyles from './date.module.css';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label from '@helsenorge/designsystem-react/components/Label';
import SafeText from '@/components/referoLabel/SafeText';

export type Props = QuestionnaireComponentItemProps;

const Time = ({ id, index, path, linkId, pdf, idWithLinkIdAndItemIndex, children }: Props): JSX.Element | null => {
  initialize();

  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
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
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Hours, resources) : true;
      },
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
      validDigits: value => {
        return value ? validateTimeDigits(value, TimeUnit.Minutes, resources) : true;
      },
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
        />
        <div className={dateStyles.timeWrapper}>
          <Input
            {...restHours}
            inputId={`${getId(id)}-datetime-hours`}
            type="number"
            min={0}
            max={23}
            testId={`time-1`}
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
            testId={`time-2`}
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
