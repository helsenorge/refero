import * as React from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment';
import 'moment/locale/nb';
import withCommonFunctions, { Props as CommonProps } from '../../with-common-functions';
import DateTimeInput from '@helsenorge/toolkit/components/atoms/date-time-input';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { parseDate } from '@helsenorge/toolkit/components/atoms/time-input/date-core';
import Constants from '../../../constants/index';
import ExtensionConstants from '../../../constants/extensions';
import { newDateTimeValue, NewValueAction } from '../../../actions/newValue';
import { isRequired, getId, renderPrefix, getText, isReadOnly } from '../../../util/index';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
}

class DateTime extends React.Component<Props & ValidationProps> {
  getDefaultDate(props: Props): Date | undefined {
    const { item, answer } = props;
    if (answer && answer.valueDateTime) {
      return parseDate(String(answer.valueDateTime));
    }
    if (answer && answer.valueDate) {
      return parseDate(String(answer.valueDate));
    }
    if (!item) {
      return undefined;
    }
    if (!item.initialDate && !item.initialDateTime) {
      return undefined;
    }
    if (item.initialDateTime) {
      return parseDate(String(item.initialDateTime));
    }
    return parseDate(String(item.initialDate));
  }

  getMaxDate(): Date | undefined {
    const maxDate = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (!maxDate) {
      return;
    }
    if (maxDate.valueDate) {
      return parseDate(String(maxDate.valueDate));
    } else if (maxDate.valueDateTime) {
      return parseDate(String(maxDate.valueDateTime));
    }
    return undefined;
  }

  getMinDate(): Date | undefined {
    const minDate = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (!minDate) {
      return;
    }
    if (minDate.valueDate) {
      return parseDate(String(minDate.valueDate));
    } else if (minDate.valueDateTime) {
      return parseDate(String(minDate.valueDateTime));
    }
    return undefined;
  }

  dispatchNewDate = (date: Date) => {
    const { dispatch, promptLoginMessage } = this.props;
    if (dispatch) {
      const momentDate = moment(date)
        .locale('nb')
        .utc()
        .format(Constants.DATE_TIME_FORMAT);
      dispatch(newDateTimeValue(this.props.path, momentDate, this.props.item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  promptLogin = () => {
    if (this.props.promptLoginMessage) {
      this.props.promptLoginMessage();
    }
  };

  onBlur = () => {
    return true;
  };

  getStringValue = () => {
    const date = this.getDefaultDate(this.props);
    let text = '';
    if (this.props.resources && this.props.resources.ikkeBesvart) {
      text = this.props.resources.ikkeBesvart;
    }
    return date
      ? moment(date)
          .locale('nb')
          .format('LLL')
      : text;
  };

  render(): JSX.Element | null {
    const { item, pdf, id, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={this.getStringValue()} children={this.props.children} />;
    }
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_datetime">
        <Validation {...other}>
          <DateTimeInput
            id={getId(id)}
            value={this.getDefaultDate(this.props)}
            maxDate={this.getMaxDate()}
            minDate={this.getMinDate()}
            onChange={this.dispatchNewDate}
            promptLogin={this.promptLogin}
            onBlur={this.onBlur}
            legend={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            errorMessage={getValidationTextExtension(item)}
            timeClassName="page_skjemautfyller__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
          >
            {!this.props.oneToTwoColumn ? this.props.renderDeleteButton('page_skjemautfyller__deletebutton--datetime') : null}
          </DateTimeInput>
        </Validation>
        {this.props.oneToTwoColumn ? (
          <div>
            {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
            {this.props.repeatButton}
          </div>
        ) : (
          <div>{this.props.repeatButton}</div>
        )}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(DateTime);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
