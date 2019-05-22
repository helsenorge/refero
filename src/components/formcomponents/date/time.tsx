import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as moment from 'moment';
import { parseDate, getHoursFromTimeString, getMinutesFromTimeString } from '@helsenorge/toolkit/components/atoms/time-input/date-core';
import TimeInput from '@helsenorge/toolkit/components/atoms/time-input';
import DateTimeConstants from '@helsenorge/toolkit/constants/datetime';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import withCommonFunctions from '../../with-common-functions';
import ExtensionConstants from '../../../constants/extensions';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newTimeValue } from '../../../actions/newValue';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';

export interface Props {
  value?: string;
  answer: QuestionnaireResponseAnswer;
  item: QuestionnaireItem;
  resources?: Resources;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  onTimeChange?: (newTime: string) => void;
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
}

class Time extends React.Component<Props & ValidationProps> {
  static defaultProps: Partial<Props> = {
    renderFieldset: true,
    path: [],
  };

  getValue(props: Props): string | undefined {
    const { value, answer } = props;
    if (value) {
      return value;
    }
    if (answer && answer.valueTime) {
      return answer.valueTime;
    }
    if (answer && answer.valueDate) {
      return this.getTimeStringFromDate(parseDate(String(answer.valueDate)));
    }
    if (answer && answer.valueDateTime) {
      return this.getTimeStringFromDate(parseDate(String(answer.valueDateTime)));
    }
    return '';
  }

  getPDFValue() {
    const value = this.getValue(this.props);
    if (!value) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  }

  getTimeStringFromDate(date: Date): string {
    const momentDate = moment(date);
    return `${momentDate.hours()}${DateTimeConstants.TIME_SEPARATOR}${momentDate.minutes()}`;
  }

  getMaxTime(): Date {
    return moment(new Date())
      .hours(this.getMaxHour())
      .minutes(this.getMaxMinute())
      .toDate();
  }

  getMinTime(): Date {
    return moment(new Date())
      .hours(this.getMinHour())
      .minutes(this.getMinMinute())
      .toDate();
  }

  getMaxHour(): number {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (!maxTime) {
      return 23;
    }
    const maxTimeString = String(maxTime.valueTime);
    const hoursString = getHoursFromTimeString(maxTimeString);
    return parseInt(hoursString, 10);
  }

  getMaxMinute(): number {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (!maxTime) {
      return 59;
    }
    const maxTimeString = String(maxTime.valueTime);
    const minuteString = getMinutesFromTimeString(maxTimeString);
    return parseInt(minuteString, 10);
  }

  getMinHour(): number {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const hoursString = getHoursFromTimeString(minTimeString);
    return parseInt(hoursString, 10);
  }

  getMinMinute(): number {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const minuteString = getMinutesFromTimeString(minTimeString);
    return parseInt(minuteString, 10);
  }

  dispatchNewTime(newTime: string): void {
    const { dispatch, item, path } = this.props;
    if (dispatch) {
      dispatch(newTimeValue(path, newTime, item));
    }
  }

  onTimeChange = (newTime = '') => {
    const validTime = this.makeValidTime(newTime);
    const { promptLoginMessage } = this.props;
    if (this.props.onTimeChange) {
      this.props.onTimeChange(validTime);
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    } else {
      this.dispatchNewTime(validTime);
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  makeValidTime(time: string) {
    const values = time.split(':');
    if (values.length === 2 && values[1] === '' && values[0] !== '') {
      return `${values[0]}:00`;
    }
    if (values.length === 2 && values[0] === '' && values[1] !== '') {
      return `00:${values[1]}`;
    }
    return this.addSeconds(time);
  }

  addSeconds(time: string) {
    if (time !== '' && time.split(':').length === 2) {
      return (time += ':00');
    }
    return time;
  }

  padNumber(value?: string) {
    if (value) {
      const values = value.split(':');
      let retVal = '';
      for (var i = 0; i < values.length; i++) {
        var timeString = '';
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
    return;
  }

  getResetButtonText() {
    if (this.props.resources && this.props.resources.resetTime) {
      return this.props.resources.resetTime;
    }
    return '';
  }

  render(): JSX.Element | null {
    const { pdf, item, renderFieldset, id } = this.props;

    if (pdf || isReadOnly(this.props.item)) {
      const value = this.getPDFValue();
      if (renderFieldset) {
        return <TextView item={this.props.item} value={this.padNumber(value)} children={this.props.children} />;
      } else if (value) {
        return (
          <span>
            {', kl. '} {this.padNumber(value)}
          </span>
        );
      }
      return <span />;
    }

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_time">
        <Validation {...this.props}>
          <TimeInput
            id={getId(id)}
            value={this.getValue(this.props)}
            legend={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            msgInvalidTime={this.props.resources && this.props.resources.ugyldigTid ? this.props.resources.ugyldigTid : undefined}
            msgMissingTime={this.props.resources && this.props.resources.oppgiTid ? this.props.resources.oppgiTid : undefined}
            maxHour={this.getMaxHour()}
            minHour={this.getMinHour()}
            maxMinute={this.getMaxMinute()}
            minMinute={this.getMinMinute()}
            onBlur={this.onTimeChange}
            ref="timeInput"
            className={this.props.className + ' page_skjemautfyller__input'}
            renderFieldset={this.props.renderFieldset}
            errorMessage={getValidationTextExtension(item)}
            resetButton={{
              resetButtonText: this.getResetButtonText(),
              onReset: this.onTimeChange,
            }}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
          />
        </Validation>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Time);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedComponent;
