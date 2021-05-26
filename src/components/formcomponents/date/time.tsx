import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import moment from 'moment';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';
import TimeInput from '@helsenorge/toolkit/components/molecules/time-input';
import DateTimeConstants from '@helsenorge/toolkit/constants/datetime';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import withCommonFunctions from '../../with-common-functions';
import ExtensionConstants from '../../../constants/extensions';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { NewValueAction, newTimeValueAsync } from '../../../actions/newValue';
import { getExtension, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText } from '../../../util/index';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { GlobalState } from '../../../reducers';
import SubLabel from '../sublabel';
import Label from '../label';

export interface Props {
  value?: string;
  answer: QuestionnaireResponseItemAnswer;
  item: QuestionnaireItem;
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

class Time extends React.Component<Props & ValidationProps> {
  static defaultProps: Partial<Props> = {
    renderFieldset: true,
    path: [],
  };

  constructor(props: Props) {
    super(props);

    this.onTimeChange = this.onTimeChange.bind(this);
    this.getValue = this.getValue.bind(this);
  }

  getValue(): string | undefined {
    const { value, answer } = this.props;
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
    const value = this.getValue();
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

  getMaxHour(): number {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (!maxTime) {
      return 23;
    }
    const maxTimeString = String(maxTime.valueTime);
    const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  }

  getMaxMinute(): number {
    const maxTime = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (!maxTime) {
      return 59;
    }
    const maxTimeString = String(maxTime.valueTime);
    const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  }

  getMinHour(): number {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
    return parseInt(hoursString, 10);
  }

  getMinMinute(): number {
    const minTime = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (!minTime) {
      return 0;
    }
    const minTimeString = String(minTime.valueTime);
    const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
    return parseInt(minuteString, 10);
  }

  dispatchNewTime(newTime: string): void {
    const { dispatch, item, path, onAnswerChange } = this.props;
    if (dispatch) {
      dispatch(newTimeValueAsync(path, newTime, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueTime: newTime } as QuestionnaireResponseItemAnswer)
      );
    }
  }

  onTimeChange(newTime: string = ''): void {
    const validTime = this.makeValidTime(newTime);

    this.dispatchNewTime(validTime);
    if (this.props.promptLoginMessage) {
      this.props.promptLoginMessage();
    }
  }

  makeValidTime(time: string) {
    const values = time.split(':');
    let hours = values[0] || '00';
    let minutes = values[1] || '00';
    return this.addSeconds(`${hours.slice(-2)}:${minutes.slice(-2)}`);
  }

  addSeconds(time: string): string {
    if (time !== '' && time.split(':').length === 2) {
      return (time += ':00');
    }
    return time;
  }

  padNumber(value?: string) {
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
    return;
  }

  getResetButtonText() {
    if (this.props.resources && this.props.resources.resetTime) {
      return this.props.resources.resetTime;
    }
    return '';
  }

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { pdf, item, renderFieldset, id, onRenderMarkdown } = this.props;
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown);

    if (pdf || isReadOnly(this.props.item)) {
      const value = this.getPDFValue();
      if (renderFieldset) {
        return (
          <TextView item={this.props.item} value={this.padNumber(value)} onRenderMarkdown={onRenderMarkdown}>
            {this.props.children}
          </TextView>
        );
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
            value={this.getValue()}
            legend={<Label item={this.props.item} onRenderMarkdown={this.props.onRenderMarkdown} />}
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            isRequired={isRequired(item)}
            maxHour={this.getMaxHour()}
            minHour={this.getMinHour()}
            maxMinute={this.getMaxMinute()}
            minMinute={this.getMinMinute()}
            onBlur={this.onTimeChange}
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
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Time);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
