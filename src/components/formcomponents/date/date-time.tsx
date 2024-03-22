import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import moment, { Moment } from 'moment';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import DateTimePicker from '@helsenorge/date-time/components/date-time-picker';
import { getFullMomentDate } from '@helsenorge/date-time/components/date-time-picker/date-time-picker-utils';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';

import ExtensionConstants from '../../../constants/extensions';
import Constants from '../../../constants/index';
import { NewValueAction, newDateTimeValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isRequired, getId, isReadOnly, getSublabelText } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';

export interface DateTimeProps extends WithFormComponentsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  language?: string;
  promptLoginMessage?: () => void;
  id?: string;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children: React.ReactNode;
}

const DateTime = (props: DateTimeProps): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getDefaultDate = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): Date | undefined => {
    if (answer && answer.valueDateTime) {
      return parseDate(String(answer.valueDateTime));
    }
    if (answer && answer.valueDate) {
      return parseDate(String(answer.valueDate));
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return parseDate(String(item.initial[0].valueDateTime));
    }
    return parseDate(String(item.initial[0].valueDate));
  };

  const getMaxDate = (): Date | undefined => {
    const maxDate = getExtension(ExtensionConstants.DATE_MAX_VALUE_URL, props.item);
    if (maxDate && maxDate.valueString) return evaluateFhirpathExpressionToGetDate(props.item, maxDate.valueString);
    return getMaxDateWithExtension();
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(ExtensionConstants.MAX_VALUE_URL, props.item);
    if (!maxDate) {
      return;
    }
    if (maxDate.valueDate) {
      return parseDate(String(maxDate.valueDate));
    } else if (maxDate.valueDateTime) {
      return parseDate(String(maxDate.valueDateTime));
    }
    return undefined;
  };

  const getMinDate = (): Date | undefined => {
    const minDate = getExtension(ExtensionConstants.DATE_MIN_VALUE_URL, props.item);
    if (minDate && minDate.valueString) return evaluateFhirpathExpressionToGetDate(props.item, minDate.valueString);
    return getMinDateWithExtension();
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(ExtensionConstants.MIN_VALUE_URL, props.item);
    if (!minDate) {
      return;
    }
    if (minDate.valueDate) {
      return parseDate(String(minDate.valueDate));
    } else if (minDate.valueDateTime) {
      return parseDate(String(minDate.valueDateTime));
    }
    return undefined;
  };

  const dispatchNewDate = (date: Moment | undefined, time: string | undefined): void => {
    const { promptLoginMessage, onAnswerChange, answer, path, item } = props;
    const momentDate = getFullMomentDate(date, time);
    const dateTimeString = momentDate ? momentDate.locale('nb').utc().format(Constants.DATE_TIME_FORMAT) : '';
    const existingAnswer = answer?.valueDateTime || '';
    if (existingAnswer !== dateTimeString) {
      dispatch(newDateTimeValueAsync(props.path, dateTimeString, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDateTime: dateTimeString } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const promptLogin = (): void => {
    if (props.promptLoginMessage) {
      props.promptLoginMessage();
    }
  };

  const onBlur = (): boolean => {
    return true;
  };

  const convertDateToString = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): string | undefined => {
    const date = getDefaultDate(item, answer);
    if (date) {
      return moment(date).locale('nb').format('LLL');
    }
    return undefined;
  };

  const getStringValue = (): string => {
    const { item, answer } = props;
    if (Array.isArray(answer)) {
      return answer.map(m => convertDateToString(item, m)).join(', ');
    }
    const date = convertDateToString(item, answer);
    let text = '';
    if (props.resources && props.resources.ikkeBesvart) {
      text = props.resources.ikkeBesvart;
    }
    return date ?? text;
  };

  const getLocaleFromLanguage = (): LanguageLocales.NORWEGIAN | LanguageLocales.ENGLISH => {
    if (props.language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  const toLocaleDate = (moment: Moment | undefined): Moment | undefined => {
    return moment ? moment.locale(getLocaleFromLanguage()) : undefined;
  };

  const { item, pdf, id, onRenderMarkdown } = props;
  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getStringValue()}
        onRenderMarkdown={onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  const valueDateTime = getDefaultDate(props.item, props.answer);
  const maxDateTime = getMaxDate();
  const minDateTime = getMinDate();
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);
  const formId = createFromIdFromPath(props.path);
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(formId);

  return (
    <div className="page_refero__component page_refero__component_datetime">
      <DateTimePicker
        {...(register(formId),
        {
          onChange: (value: Moment | undefined) => dispatchNewDate(value, ''),
          value: valueDateTime,
        })}
        id={getId(id)}
        resources={{ dateResources: props.resources }}
        locale={getLocaleFromLanguage()}
        dateValue={valueDateTime ? toLocaleDate(moment(valueDateTime)) : undefined}
        timeValue={valueDateTime ? moment(valueDateTime).format('HH:mm') : undefined}
        maximumDateTime={maxDateTime ? toLocaleDate(moment(maxDateTime)) : undefined}
        minimumDateTime={minDateTime ? toLocaleDate(moment(minDateTime)) : undefined}
        initialDate={toLocaleDate(moment(new Date()))}
        onChange={dispatchNewDate}
        onBlur={onBlur}
        legend={
          <Label
            item={props.item}
            onRenderMarkdown={props.onRenderMarkdown}
            questionnaire={props.questionnaire}
            resources={props.resources}
          />
        }
        subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
        isRequired={isRequired(item)}
        errorMessage={getValidationTextExtension(item)}
        timeClassName="page_refero__input"
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      />
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(DateTime);
const connectedComponent = connect(mapStateToProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
