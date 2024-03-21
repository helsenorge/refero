import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import moment from 'moment';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import TimeInput from '@helsenorge/date-time/components/time-input';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';
import * as DateTimeConstants from '@helsenorge/date-time/constants/datetime';

import ExtensionConstants from '../../../constants/extensions';
import { NewValueAction, newTimeValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText } from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';

export interface TimeProps extends WithCommonFunctionsProps {
  value?: string;
  answer: QuestionnaireResponseItemAnswer;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  resources?: Resources;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  renderFieldset?: boolean;
  className?: string;
  enable?: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const Time = (props: TimeProps): JSX.Element => {
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const convertAnswerToString = (answer: QuestionnaireResponseItemAnswer): string => {
    if (answer && answer.valueTime) {
      return answer.valueTime;
    }
    if (answer && answer.valueDate) {
      return getTimeStringFromDate(parseDate(String(answer.valueDate)));
    }
    if (answer && answer.valueDateTime) {
      return getTimeStringFromDate(parseDate(String(answer.valueDateTime)));
    }
    return '';
  };

  const getValue = (): string | undefined => {
    const { value, answer } = props;
    if (value) {
      return value;
    }
    if (Array.isArray(answer)) {
      return answer.map(m => convertAnswerToString(m)).join(', ');
    }
    return convertAnswerToString(answer);
  };

  const getPDFValue = (): string => {
    const value = getValue();
    if (!value) {
      let text = '';
      if (props.resources && props.resources.ikkeBesvart) {
        text = props.resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  };

  const getTimeStringFromDate = (date: Date): string => {
    const momentDate = moment(date);
    return `${momentDate.hours()}${DateTimeConstants.TIME_SEPARATOR}${momentDate.minutes()}`;
  };

  const getMaxHour = (): number => {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, props.item);
    if (!maxTime) {
      return 23;
    }
    const maxTimeString = String(maxTime.valueTime);
    const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  };

  const getMaxMinute = (): number => {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, props.item);
    if (!maxTime) {
      return 59;
    }
    const maxTimeString = String(maxTime.valueTime);
    const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  };

  const getMinHour = (): number => {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  };

  const getMinMinute = (): number => {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  };

  const dispatchNewTime = (newTime: string): void => {
    const { item, path, onAnswerChange } = props;
    if (dispatch) {
      dispatch(newTimeValueAsync(path, newTime, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueTime: newTime } as QuestionnaireResponseItemAnswer)
      );
    }
  };

  const onTimeChange = (newTime: string = ''): void => {
    const validTime = makeValidTime(newTime);

    dispatchNewTime(validTime);
    if (props.promptLoginMessage) {
      props.promptLoginMessage();
    }
  };

  const makeValidTime = (time: string): string => {
    const values = time.split(':');
    const hours = values[0] || '00';
    const minutes = values[1] || '00';
    return addSeconds(`${hours.slice(-2)}:${minutes.slice(-2)}`);
  };

  const addSeconds = (time: string): string => {
    if (time !== '' && time.split(':').length === 2) {
      return (time += ':00');
    }
    return time;
  };

  const padNumber = (value?: string): string => {
    if (value) {
      const values = value.split(':');
      let retVal = '';
      for (let i = 0; i < values.length; i++) {
        let timeString = '';
        if (parseInt(values[i], 10) < 10 && values[i].length === 1) {
          timeString += '0';
        }
        timeString += values[i];
        if (i !== values.length - 1) {
          timeString += ':';
        }
        retVal += timeString;
      }
      return retVal;
    }
    return '';
  };

  const getResetButtonText = (): string => {
    if (props.resources && props.resources.resetTime) {
      return props.resources.resetTime;
    }
    return '';
  };

  const { pdf, item, renderFieldset, id, onRenderMarkdown } = props;
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(props.id));
  if (pdf || isReadOnly(props.item)) {
    const value = getPDFValue();
    if (renderFieldset) {
      return (
        <TextView
          id={id}
          item={props.item}
          value={padNumber(value)}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={props.renderHelpButton()}
          helpElement={props.renderHelpElement()}
        >
          {props.children}
        </TextView>
      );
    } else if (value) {
      return (
        <span>
          {', kl. '} {padNumber(value)}
        </span>
      );
    }
    return <span />;
  }

  return (
    <div className="page_refero__component page_refero__component_time">
      <TimeInput
        {...register(getId(props.item.linkId), {
          required: { value: isRequired(props.item), message: props.resources?.dateRequired || '' },
          onChange: onTimeChange,
          onBlur: onTimeChange,
          value: getValue(),
          validate: {
            maxHour: (value: string) => {
              return (getMaxHour() && parseInt(value.split(':')[0], 10) <= getMaxHour()) || getValidationTextExtension(props.item) || '';
            },
            minHour: (value: string) => {
              return (getMinHour() && parseInt(value.split(':')[0], 10) >= getMinHour()) || getValidationTextExtension(props.item) || '';
            },
            maxMinute: (value: string) => {
              return (
                (getMaxMinute() && parseInt(value.split(':')[1], 10) <= getMaxMinute()) || getValidationTextExtension(props.item) || ''
              );
            },
            minMinute: (value: string) => {
              return (
                (getMinMinute() && parseInt(value.split(':')[1], 10) >= getMinMinute()) || getValidationTextExtension(props.item) || ''
              );
            },
          },
        })}
        id={getId(id)}
        value={getValue()}
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
        maxHour={getMaxHour()}
        minHour={getMinHour()}
        maxMinute={getMaxMinute()}
        minMinute={getMinMinute()}
        onBlur={onTimeChange}
        className={props.className + ' page_refero__input'}
        renderFieldset={props.renderFieldset}
        errorMessage={getValidationTextExtension(item)}
        resetButton={{
          resetButtonText: getResetButtonText(),
          onReset: onTimeChange,
        }}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      />
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(Time);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
