import React from 'react';

import { parseISO } from 'date-fns';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { safeParseJSON } from '../../../util/date-fns-utils';
import { getExtension, getItemControlExtensionValue } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { getLabelText, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface DateProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  language?: string;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DateComponent = (props: React.PropsWithChildren<DateProps>): JSX.Element => {
  const {
    item,
    questionnaire,
    answer,
    resources,
    dispatch,
    path,
    language,
    promptLoginMessage,
    renderDeleteButton,
    repeatButton,
    renderHelpButton,
    renderHelpElement,
    onAnswerChange,
    onRenderMarkdown,
    children,
  } = props;

  const getMaxDate = (): Date | undefined => {
    const maxDate = getExtension(Extensions.DATE_MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
      return fhirPathExpression ? safeParseJSON(fhirPathExpression) : undefined;
    }
    const maxDateWithExtension = getMaxDateWithExtension();
    return maxDateWithExtension ? safeParseJSON(maxDateWithExtension) : undefined;
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(Extensions.MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueDate) {
      return parseISO(maxDate.valueDate);
    } else if (maxDate && maxDate.valueDateTime) {
      return parseISO(maxDate.valueDateTime);
    } else if (maxDate && maxDate.valueInstant) {
      return parseISO(maxDate.valueInstant);
    }
    return undefined;
  };

  const getMinDate = (): Date | undefined => {
    const minDate = getExtension(Extensions.DATE_MIN_VALUE_URL, item);
    if (minDate && minDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
      return fhirPathExpression ? safeParseJSON(fhirPathExpression) : undefined;
    }
    const minDateWithExtension = getMinDateWithExtension();
    return minDateWithExtension ? safeParseJSON(minDateWithExtension) : undefined;
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(Extensions.MIN_VALUE_URL, item);
    if (minDate && minDate.valueDate) {
      return parseISO(minDate.valueDate);
    } else if (minDate && minDate.valueDateTime) {
      return parseISO(minDate.valueDateTime);
    } else if (minDate && minDate.valueInstant) {
      return parseISO(minDate.valueInstant);
    }
    return undefined;
  };

  const onDateValueChange = (newValue: string): void => {
    const existingAnswer = answer?.valueDate || '';
    if (dispatch && newValue !== existingAnswer) {
      dispatch(newDateValueAsync(path, newValue, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getLocaleFromLanguage = (): LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN => {
    if (language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  // console.log(maxDate);

  const itemControls = getItemControlExtensionValue(item);
  let element: JSX.Element | undefined = undefined;

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEAR)) {
    element = (
      <DateYearInput
        {...props}
        label={labelText}
        subLabel={subLabelText}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  } else if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
    element = (
      <DateYearMonthInput
        {...props}
        label={labelText}
        locale={getLocaleFromLanguage()}
        subLabel={subLabelText}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  } else {
    element = (
      <DateDayInput
        {...props}
        locale={getLocaleFromLanguage()}
        label={labelText}
        subLabel={subLabelText}
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  }

  return (
    <div className="page_refero__component page_refero__component_date">
      {element}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};
const withFormProps = ReactHookFormHoc(DateComponent);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;

// const shouldComponentUpdate = (nextProps: DateProps): boolean => {
//   const responseItemHasChanged = responseItem !== nextProps.responseItem;
//   const helpItemHasChanged = isHelpOpen !== nextProps.isHelpOpen;
//   const answerHasChanged = answer !== nextProps.answer;
//   const resourcesHasChanged = JSON.stringify(resources) !== JSON.stringify(nextProps.resources);
//   const repeats = item.repeats ?? false;
//   const error = error !== nextProps.error;

//   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || error;
// };
