import * as React from 'react';

import moment, { Moment } from 'moment';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireItemInitial } from '../../../types/fhir';

import Validation from '@helsenorge/designsystem-react/components/Validation';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import { DateRangePicker } from '@helsenorge/date-time/components/date-range-picker';
import { DatePickerErrorPhrases } from '@helsenorge/date-time/components/date-range-picker/date-range-picker-types';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';

import Constants from '../../../constants/index';
import { getId, isRequired } from '../../../util';
import { getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly } from '../../../util/index';
import { Resources } from '../../../types/resources';
import TextView from '../textview';

interface DateDayInputProps {
  id?: string;
  pdf?: boolean;
  item: QuestionnaireItem;
  resources?: Resources;
  locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
  label?: JSX.Element;
  subLabel?: JSX.Element;
  datepickerRef: React.RefObject<DateRangePicker>;
  helpButton?: JSX.Element;
  helpElement?: JSX.Element;
  onDateValueChange: (newValue: string) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  validationErrorRenderer?: JSX.Element;
  className?: string;
  maxDate?: Moment;
  minDate?: Moment;
  answer: QuestionnaireResponseItemAnswer;
}

export const DateDayInput: React.FC<DateDayInputProps> = props => {
  const getDatepickerErrorPhrases = (): DatePickerErrorPhrases => {
    const { resources, item } = props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidDate: validationErrorText ? validationErrorText : resources?.filterDateErrorDateFormat || '',
      errorAfterMaxDate: resources?.errorAfterMaxDate || '',
      errorBeforeMinDate: resources?.errorBeforeMinDate || '',
      errorInvalidDateRange: '',
      errorRequiredDate: resources?.dateRequired || '',
      errorRequiredDateRange: '',
      errorInvalidMinimumNights: '',
    };
  };

  const getDateAnswerValue = (answer: QuestionnaireResponseItemAnswer | QuestionnaireItemInitial): string | undefined => {
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  };

  const getValue = (): Date[] | undefined => {
    const { item, answer } = props;

    if (answer && Array.isArray(answer)) {
      return answer.map(m => parseDate(String(getDateAnswerValue(m))));
    }

    if (Array.isArray(item.initial)) {
      return item.initial.map(m => parseDate(String(getDateAnswerValue(m))));
    }

    if (answer) {
      const parsedDate = [parseDate(String(getDateAnswerValue(answer)))];
      if (isValidDate(parsedDate[0]) === true) {
        return parsedDate;
      } else {
        return undefined;
      }
    }
  };

  const isValidDate = (date: Date): boolean => {
    if (date instanceof Date) {
      const text = Date.prototype.toString.call(date);
      return text !== 'Invalid Date';
    }
    return false;
  };

  const toLocaleDate = (moment: Moment | undefined): Moment | undefined => {
    return moment ? moment.locale(props.locale) : undefined;
  };

  const onDateChange = (value: Moment | null): void => {
    const newValue = value ? moment(value).format(Constants.DATE_FORMAT) : '';
    props.onDateValueChange(newValue);
  };

  const getPDFValue = (): string => {
    const date = getValue();
    const ikkeBesvartText = props.resources?.ikkeBesvart || '';

    return date ? date.map(m => moment(m).format('D. MMMM YYYY')).join(', ') : ikkeBesvartText;
  };

  const getSingleDateValue = (): moment.Moment | undefined => {
    const date = getValue();
    return date ? toLocaleDate(moment(date[0])) : undefined;
  };

  if (props.pdf || isReadOnly(props.item)) {
    return (
      <TextView
        id={props.id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={props.onRenderMarkdown}
        helpButton={props.helpButton}
        helpElement={props.helpElement}
      >
        {props.children}
      </TextView>
    );
  }

  return (
    <Validation {...props}>
      <DateRangePicker
        type="single"
        id={`${getId(props.id)}-datepicker_input`}
        locale={props.locale} // TODO: må støtte nynorsk og samisk også
        errorResources={getDatepickerErrorPhrases()}
        resources={props.resources}
        label={props.label}
        subLabel={props.subLabel}
        isRequired={isRequired(props.item)}
        placeholder={getPlaceholder(props.item)}
        ref={props.datepickerRef}
        maximumDate={toLocaleDate(props.maxDate)}
        minimumDate={toLocaleDate(props.minDate)}
        singleDateValue={getSingleDateValue()}
        className={props.className}
        onDateChange={onDateChange}
        validationErrorRenderer={props.validationErrorRenderer}
        helpButton={props.helpButton}
        helpElement={props.helpElement}
      />
    </Validation>
  );
};
