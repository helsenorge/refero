import * as React from 'react';

import moment from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Validation from '@helsenorge/designsystem-react/components/Validation';

import TimeInput from '@helsenorge/date-time/components/time-input';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';
import * as DateTimeConstants from '@helsenorge/date-time/constants/datetime';

import { NewValueAction, newTimeValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import { GlobalState } from '../../../reducers';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../types/resources';
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
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
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
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Time: React.FC<TimeProps & ValidationProps> = props => {
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
    const { dispatch, item, path, onAnswerChange } = props;
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

  // React.useMemo(() => {
  //   const responseItemHasChanged = props.responseItem !== props.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
  //   const answerHasChanged = props.answer !== props.answer;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
  //   const repeats = props.item.repeats ?? false;

  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  // }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const { pdf, item, renderFieldset, id, onRenderMarkdown } = props;
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);

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
      <Validation {...props}>
        <TimeInput
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
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(Time);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
