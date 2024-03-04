import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import moment, { Moment } from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import { DateRangePicker } from '@helsenorge/date-time/components/date-range-picker';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';
import { ValidationProps } from '@helsenorge/form/components/form/validation';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { getExtension, getItemControlExtensionValue } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';

export interface DateProps extends WithCommonFunctionsProps {
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
  className?: string;
  id?: string;
  validationErrorRenderer?: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DateComponent = (props: DateProps & ValidationProps): JSX.Element | null => {
  const [datepicker, setDatepicker] = React.useState<React.RefObject<DateRangePicker>>(React.createRef());

  const getMaxDate = (): Moment | undefined => {
    const maxDate = getExtension(ExtensionConstants.DATE_MAX_VALUE_URL, props.item);
    if (maxDate && maxDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(props.item, maxDate.valueString);
      return fhirPathExpression ? moment(fhirPathExpression) : undefined;
    }
    const maxDateWithExtension = getMaxDateWithExtension();
    return maxDateWithExtension ? moment(maxDateWithExtension) : undefined;
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(ExtensionConstants.MAX_VALUE_URL, props.item);
    if (maxDate && maxDate.valueDate) {
      return parseDate(String(maxDate.valueDate));
    } else if (maxDate && maxDate.valueDateTime) {
      return parseDate(String(maxDate.valueDateTime));
    } else if (maxDate && maxDate.valueInstant) {
      return parseDate(String(maxDate.valueInstant));
    }
    return undefined;
  };

  const getMinDate = (): Moment | undefined => {
    const minDate = getExtension(ExtensionConstants.DATE_MIN_VALUE_URL, props.item);
    if (minDate && minDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(props.item, minDate.valueString);
      return fhirPathExpression ? moment(fhirPathExpression) : undefined;
    }
    const minDateWithExtension = getMinDateWithExtension();
    return minDateWithExtension ? moment(minDateWithExtension) : undefined;
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(ExtensionConstants.MIN_VALUE_URL, props.item);
    if (minDate && minDate.valueDate) {
      return parseDate(String(minDate.valueDate));
    } else if (minDate && minDate.valueDateTime) {
      return parseDate(String(minDate.valueDateTime));
    } else if (minDate && minDate.valueInstant) {
      return parseDate(String(minDate.valueInstant));
    }
    return undefined;
  };

  const onDateValueChange = (newValue: string): void => {
    const { dispatch, promptLoginMessage, path, item, answer, onAnswerChange } = props;
    const existingAnswer = answer?.valueDate || '';
    if (dispatch && newValue !== existingAnswer) {
      dispatch(newDateValueAsync(props.path, newValue, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getLocaleFromLanguage = (): LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN => {
    if (props.language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);

  const itemControls = getItemControlExtensionValue(props.item);

  let element: JSX.Element | undefined = undefined;

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEAR)) {
    element = (
      <DateYearInput
        label={
          <Label
            item={props.item}
            onRenderMarkdown={props.onRenderMarkdown}
            questionnaire={props.questionnaire}
            resources={props.resources}
          />
        }
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
        {...props}
      />
    );
  } else if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
    element = (
      <DateYearMonthInput
        label={
          <Label
            item={props.item}
            onRenderMarkdown={props.onRenderMarkdown}
            questionnaire={props.questionnaire}
            resources={props.resources}
          />
        }
        locale={getLocaleFromLanguage()}
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
        {...props}
      />
    );
  } else {
    element = (
      <DateDayInput
        locale={getLocaleFromLanguage()}
        label={
          <Label
            item={props.item}
            onRenderMarkdown={props.onRenderMarkdown}
            questionnaire={props.questionnaire}
            resources={props.resources}
          />
        }
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        datepickerRef={datepicker}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
        {...props}
      />
    );
  }

  return (
    <div className="page_refero__component page_refero__component_date">
      {element}
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(DateComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
