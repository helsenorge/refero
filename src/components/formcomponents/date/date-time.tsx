import React from 'react';

import { format } from 'date-fns';
import { isValid } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { DateTimeUnit } from '../../../types/dateTypes';

import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
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
  formatDateToStringDDMMYYYY,
} from '../../../util/date-utils';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isRequired, getId, isReadOnly, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';
export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  language?: string;
  promptLoginMessage?: () => void;
  id?: string;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DateTimeInput: React.FC<Props> = ({
  item,
  questionnaire,
  answer,
  resources,
  dispatch,
  path,
  pdf,
  promptLoginMessage,
  id,
  renderDeleteButton,
  repeatButton,
  renderHelpButton,
  renderHelpElement,
  onAnswerChange,
  onRenderMarkdown,
  idWithLinkIdAndItemIndex,
  children,
}) => {
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const dateField = getFieldState(`${idWithLinkIdAndItemIndex}-date`, formState);
  const hoursField = getFieldState(`${idWithLinkIdAndItemIndex}-hours`, formState);
  const minutesField = getFieldState(`${idWithLinkIdAndItemIndex}-minutes`, formState);

  const getDefaultDate = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): Date | undefined => {
    if (answer && answer.valueDateTime) {
      return safeParseJSON(String(answer.valueDateTime));
    }
    if (answer && answer.valueDate) {
      return safeParseJSON(String(answer.valueDate));
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return safeParseJSON(String(item.initial[0].valueDateTime));
    }
    return safeParseJSON(String(item.initial[0].valueDate));
  };

  const getMaxDate = (): Date | undefined => {
    const maxDate = getExtension(Extensions.DATE_MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueString) return evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
    return getMaxDateWithExtension();
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(Extensions.MAX_VALUE_URL, item);
    if (!maxDate) {
      return;
    }
    if (maxDate.valueDate) {
      return safeParseJSON(String(maxDate.valueDate));
    } else if (maxDate.valueDateTime) {
      return safeParseJSON(String(maxDate.valueDateTime));
    }
    return undefined;
  };

  const getMinDate = (): Date | undefined => {
    const minDate = getExtension(Extensions.DATE_MIN_VALUE_URL, item);
    if (minDate && minDate.valueString) return evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
    return getMinDateWithExtension();
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(Extensions.MIN_VALUE_URL, item);
    if (!minDate) {
      return;
    }
    if (minDate.valueDate) {
      return safeParseJSON(String(minDate.valueDate));
    } else if (minDate.valueDateTime) {
      return safeParseJSON(String(minDate.valueDateTime));
    }
    return undefined;
  };

  const convertDateToString = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): string | undefined => {
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
    const date = convertDateToString(item, answer);
    let text = '';
    if (resources && resources.ikkeBesvart) {
      text = resources.ikkeBesvart;
    }
    return date ?? text;
  };

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getStringValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
        {children}
      </TextView>
    );
  }

  const defaultDate: Date | undefined = getDefaultDate(item, answer);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [hours, setHours] = React.useState(getHoursOrMinutesFromDate(defaultDate, DateTimeUnit.Hours));
  const [minutes, setMinutes] = React.useState(getHoursOrMinutesFromDate(defaultDate, DateTimeUnit.Minutes));

  const maxDateTime = getMaxDate();
  const minDateTime = getMinDate();
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    const validationTextExtension = getValidationTextExtension(item);
    if (validationTextExtension) {
      return validationTextExtension;
    }
    if (error) {
      return error.message;
    }
  };

  function getCombinedFieldError(dateField: FieldValues, hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const error = dateField.error || hoursField.error || minutesField.error || undefined;
    return error;
  }

  const handleDateChange = (newDate: Date | string | undefined): void => {
    let dateString: Date | string | undefined = '';
    if (newDate && typeof newDate !== 'string') {
      dateString = formatDateToStringDDMMYYYY(newDate);
      setDate(newDate);
    } else if (newDate) {
      dateString = newDate;
      const newDateParsed = parseStringToDateDDMMYYYY(newDate);
      isValid(newDateParsed) && setDate(newDateParsed);
    }

    setValue(`${idWithLinkIdAndItemIndex}-date`, dateString);
    updateQuestionnaireResponse(dateString, hours, minutes);
  };
  const handleHoursChange = (newHours: string | undefined): void => {
    setHours(newHours);
    setValue(`${idWithLinkIdAndItemIndex}-hours`, newHours);
    updateQuestionnaireResponse(date, newHours, minutes);
  };
  const handleMinutesChange = (newMinutes: string | undefined): void => {
    setMinutes(newMinutes);
    setValue(`${idWithLinkIdAndItemIndex}-minutes`, newMinutes);
    updateQuestionnaireResponse(date, hours, newMinutes);
  };

  initialize();

  const updateQuestionnaireResponse = (date: Date | string | undefined, hours: string | undefined, minutes: string | undefined): void => {
    const fullDate = getFullFnsDate(date, hours, minutes);

    if (fullDate) {
      const existingAnswer = answer?.valueDateTime || '';
      if (dispatch && existingAnswer !== fullDate) {
        dispatch(newDateTimeValueAsync(path, fullDate, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueDateTime: fullDate } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  return (
    <div className="page_refero__component page_refero__component_datetime">
      {renderHelpElement()}
      <DateTimePickerWrapper errorText={getErrorText(getCombinedFieldError(dateField, hoursField, minutesField))}>
        <DatePicker
          {...register(idWithLinkIdAndItemIndex + '-date', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validDate: value => {
                return validateDate(parseStringToDateDDMMYYYY(value), resources);
              },
              validMinDate: value => {
                return validateMinDate(minDateTime, parseStringToDateDDMMYYYY(value), resources);
              },
              validMaxDate: value => {
                return validateMaxDate(maxDateTime, parseStringToDateDDMMYYYY(value), resources);
              },
            },
          })}
          testId={getId(id)}
          autoComplete=""
          dateButtonAriaLabel="Open datepicker"
          dateFormat={'dd.MM.yyyy'}
          label={
            <Label
              labelId={`${getId(id)}-label-dateTime`}
              labelTexts={[{ text: labelText }]}
              sublabel={<Sublabel id={`${getId(id)}-sublabel-dateTime`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          dateValue={date ? undefined : defaultDate}
          minDate={minDateTime}
          maxDate={maxDateTime}
          onChange={(_e, newDate) => {
            handleDateChange(newDate);
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
          defaultValue={Number(minutes)}
          timeUnit="minutes"
          onChange={e => {
            handleMinutesChange(e.target.value);
          }}
        />
      </DateTimePickerWrapper>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(DateTimeInput);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
