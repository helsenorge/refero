import { useState } from 'react';

import { format, isValid } from 'date-fns';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';

import { DateTimeUnit } from '../../../types/dateTypes';

import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';

import { newDateTimeValueAsync } from '../../../actions/newValue';
import { GlobalState, useAppDispatch } from '../../../reducers';
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
import styles from '../common-styles.module.css';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useSelector } from 'react-redux';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useMinMaxDate } from './useMinMaxDate';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { ReadOnly } from '../read-only/readOnly';

export type Props = QuestionnaireComponentItemProps;

const DateTimeInput = ({ linkId, path, pdf, id, idWithLinkIdAndItemIndex, children, index }: Props): JSX.Element | null => {
  initialize();

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const dispatch = useAppDispatch();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const answer = useGetAnswer(linkId, path);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const { formState, getFieldState, getValues, register } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);
  const { minDateTime, maxDateTime } = useMinMaxDate(item);

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

  const dateAnswerValue = getDateAnswerValue(answer);
  const date: Date | string | undefined = parseStringToDate(dateAnswerValue);
  const hours = getHoursOrMinutesFromDate(date, DateTimeUnit.Hours);
  const minutes = getHoursOrMinutesFromDate(date, DateTimeUnit.Minutes);

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
  };

  const handleHoursChange = (newHours: string | undefined): void => {
    if (newHours && Number(newHours) >= 0 && Number(newHours) < 24) {
      updateQuestionnaireResponse(date, newHours, minutes);
    }
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
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

    if (dispatch && onAnswerChange && path && item) {
      dispatch(newDateTimeValueAsync(path, fullDate ?? '', item))?.then(newState =>
        onAnswerChange(newState, item, { valueDateTime: fullDate })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const doesAnyFieldsHaveValue = (): boolean => {
    const dateValue = getValues(idWithLinkIdAndItemIndex + '-date');
    const hoursValue = getValues(idWithLinkIdAndItemIndex + '-hours');
    const minutesValue = getValues(idWithLinkIdAndItemIndex + '-minutes');
    return dateValue || hoursValue || minutesValue;
  };

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

  const registerDate = register(`${idWithLinkIdAndItemIndex}-date`, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validDate: value => {
        return doesAnyFieldsHaveValue() ? validateDate(parseStringToDate(value) ?? value, resources) : true;
      },
      validMinDate: value => {
        return doesAnyFieldsHaveValue() ? validateMinDate(minDateTime, parseStringToDate(value), resources) : true;
      },
      validMaxDate: value => {
        return doesAnyFieldsHaveValue() ? validateMaxDate(maxDateTime, parseStringToDate(value), resources) : true;
      },
    },
    shouldUnregister: true,
  });
  const registerHours = register(`${idWithLinkIdAndItemIndex}-hours`, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validHours: value => {
        return doesAnyFieldsHaveValue() ? validateHours(Number(value), resources) : true;
      },
    },
    shouldUnregister: true,
  });
  const registerMinutes = register(`${idWithLinkIdAndItemIndex}-minutes`, {
    required: {
      value: isRequired(item),
      message: resources?.formRequiredErrorMessage || '',
    },
    validate: {
      validMinutes: value => {
        return doesAnyFieldsHaveValue() ? validateMinutes(Number(value), resources) : true;
      },
    },
    shouldUnregister: true,
  });

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly pdf={pdf} id={id} item={item} pdfValue={getPDFValue()} errors={getCombinedFieldError(dateField, hoursField, minutesField)}>
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_datetime" data-testid={`${getId(id)}-container`}>
      <FormGroup
        error={getErrorText(getCombinedFieldError(dateField, hoursField, minutesField))}
        errorWrapperClassName={styles.paddingBottom}
      >
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-datepicker`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-datetime-label`}
          sublabelId={`${getId(id)}-sublabel`}
          dateLabel={resources?.dateFormat_ddmmyyyy}
        >
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </ReferoLabel>
        <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
        <DateTimePickerWrapper testId={`${getId(id)}-datetime-wrapper`}>
          <DatePicker
            {...registerDate}
            inputId={`${getId(id)}-datepicker`}
            testId={`${getId(id)}-datetime`}
            autoComplete=""
            dateButtonAriaLabel="Open datepicker"
            dateFormat={'dd.MM.yyyy'}
            dateValue={isValid(date) ? date : undefined}
            minDate={minDateTime}
            maxDate={maxDateTime}
            onChange={(e, newDate) => {
              handleDateChange(newDate);
              registerDate.onChange(e);
            }}
          />

          <DateTime
            {...registerHours}
            testId={`hours-test`}
            timeUnit="hours"
            onChange={e => {
              handleHoursChange(e.target.value);
              registerHours.onChange(e);
            }}
            defaultValue={Number(hours)}
          />

          <DateTime
            {...registerMinutes}
            testId={`minutes-test`}
            timeUnit="minutes"
            onChange={e => {
              handleMinutesChange(e.target.value);
              registerMinutes.onChange(e);
            }}
            defaultValue={Number(minutes)}
          />
        </DateTimePickerWrapper>
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default DateTimeInput;
