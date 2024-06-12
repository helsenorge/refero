import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import Constants from '../../../constants/index';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isRequired, getId, isReadOnly, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import TextView from '../textview';
import { initialize, safeParseJSON } from '../../../util/date-fns-utils';
import {
  getDateFromAnswer,
  getFullFnsDate,
  getHoursOrMinutesFromDate,
  validateDate,
  validateMinDate,
  validateMaxDate,
  validateHours,
  validateMinutes,
} from '../../../util/date-utils';
import { format, isValid } from 'date-fns';
import { DatePicker, DateTimePickerWrapper, DateTime } from '@helsenorge/datepicker/components/DatePicker';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { DateTimeUnit } from '../../../types/dateTypes';

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
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  register: FormProps['register'];
  error?: FieldError;
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
    // if (answer && answer.valueDateTime && !isValid(answer.valueDateTime)) {
    //   return undefined;
    // }
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
    const maxDate = getExtension(ExtensionConstants.DATE_MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueString) return evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
    return getMaxDateWithExtension();
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(ExtensionConstants.MAX_VALUE_URL, item);
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
    const minDate = getExtension(ExtensionConstants.DATE_MIN_VALUE_URL, item);
    if (minDate && minDate.valueString) return evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
    return getMinDateWithExtension();
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(ExtensionConstants.MIN_VALUE_URL, item);
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

  // const promptLogin = (): void => {
  //   if (promptLoginMessage) {
  //     promptLoginMessage();
  //   }
  // };

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

  // React.useEffect(() => {}, [responseItem, isHelpOpen, answer, resources, item.repeats, error]);

  // getLocaleFromLanguage = (): LanguageLocales.NORWEGIAN | LanguageLocales.ENGLISH => {
  //   if (props.language?.toLowerCase() === 'en-gb') {
  //     return LanguageLocales.ENGLISH;
  //   }

  //   return LanguageLocales.NORWEGIAN;
  // };

  // toLocaleDate(moment: Moment | undefined): Moment | undefined {
  //   return moment ? moment.locale(getLocaleFromLanguage()) : undefined;
  // }

  const handleDateChange = (date: Date | string | undefined): void => {
    // if (typeof date == 'string') {
    //   date = safeParseJSON(date);
    // }
    // date && setDate(date);
    // setValue(`${idWithLinkIdAndItemIndex}-date`, date);
  };
  const handleHoursChange = (hours: string | undefined): void => {
    // hours && setHours(hours);
    // setValue(`${idWithLinkIdAndItemIndex}-hours`, date);
  };
  const handleMinutesChange = (minutes: string | undefined): void => {
    // hours && setMinutes(minutes);
    // setValue(`${idWithLinkIdAndItemIndex}-minutes`, date);
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

  const [date, setDate] = React.useState(getDefaultDate(item, answer));
  const [hours, setHours] = React.useState(getHoursOrMinutesFromDate(date, DateTimeUnit.Hours));
  const [minutes, setMinutes] = React.useState(getHoursOrMinutesFromDate(date, DateTimeUnit.Minutes));

  const valueDateTime = getDefaultDate(item, answer);
  const maxDateTime = getMaxDate();
  const minDateTime = getMinDate();
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      return getValidationTextExtension(item) || error?.message;
    }
  };

  function getCombinedFieldError(dateField: FieldValues, hoursField: FieldValues, minutesField: FieldValues): FieldError | undefined {
    const test = dateField.error || hoursField.error || minutesField.error || undefined;
    return test;
  }

  initialize();

  return (
    <div className="page_refero__component page_refero__component_datetime">
      {/* <Controller
        name={idWithLinkIdAndItemIndex}
        control={control}
        shouldUnregister={true}
        rules={{
          required: {
            value: isRequired(item),
            message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
          },
          validate: {
            validDate: value => {
              return validateDate(safeParseJSON(value), resources);
            },
            validMinDate: value => {
              return validateMinDate(safeParseJSON(value), resources);
            },
            validMaxDate: value => {
              return validateMaxDate(safeParseJSON(value), resources);
            },
            validTime: value => {
              return validateTime(safeParseJSON(value), resources);
            },
          },
        }}> */}
      <DateTimePickerWrapper errorText={getErrorText(getCombinedFieldError(dateField, hoursField, minutesField))}>
        <DatePicker
          {...register(idWithLinkIdAndItemIndex + '-date', {
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage || '',
            },
            validate: {
              validDate: value => {
                return validateDate(value, resources);
              },
              validMinDate: value => {
                return validateMinDate(value, resources);
              },
              validMaxDate: value => {
                return validateMaxDate(value, resources);
              },
            },
          })}
          testId={getId(id)}
          autoComplete=""
          dateButtonAriaLabel="Open datepicker"
          dateFormat={'dd.MM.yyyy'}
          dateValue={valueDateTime}
          label={
            <Label
              labelId={`${getId(id)}-label-dateTime`}
              labelTexts={[{ text: labelText }]}
              sublabel={<Sublabel id={`${getId(id)}-sublabel-dateTime`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          minDate={minDateTime}
          maxDate={maxDateTime}
          onChange={(e, newDate) => {
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
                return validateHours(safeParseJSON(value), resources);
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
                return validateMinutes(safeParseJSON(value), resources);
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

// const handleChange = (date: Date | string | undefined, hours: string | undefined, minutes: string | undefined) => {
//   date && setDate(date);
//   hours && setHours(hours);
//   minutes && setMinutes(minutes);

//   const fullDate = getFullFnsDate(date, hours, minutes);

//   if (fullDate) {
//     let dateTimeString = fullDate.toString();

//     if (isValid(fullDate)) {
//       dateTimeString = format(fullDate, Constants.DATE_TIME_FORMAT);
//     }

//     const existingAnswer = answer?.valueDateTime || '';
//     if (dispatch && existingAnswer !== dateTimeString) {
//       dispatch(newDateTimeValueAsync(path, dateTimeString, item))?.then(newState =>
//         onAnswerChange(newState, path, item, { valueDateTime: dateTimeString } as QuestionnaireResponseItemAnswer)
//       );
//     }

//     if (promptLoginMessage) {
//       promptLoginMessage();
//     }
//   }
// };
