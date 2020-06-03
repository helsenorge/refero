import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import 'moment/locale/nb';
import withCommonFunctions from '../../with-common-functions';
import DateTimeInput from '@helsenorge/toolkit/components/molecules/date-time-input';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import layoutChange from '@helsenorge/core-utils/hoc/layoutChange';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';
import Constants from '../../../constants/index';
import ExtensionConstants from '../../../constants/extensions';
import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import { isRequired, getId, renderPrefix, getText, isReadOnly } from '../../../util/index';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';

export interface Props {
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
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
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
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
    const maxDate = getExtension(ExtensionConstants.DATE_MAX_VALUE_URL, this.props.item);
    if (maxDate && maxDate.valueString) return evaluateFhirpathExpressionToGetDate(this.props.item, maxDate.valueString);
    return this.getMaxDateWithExtension();
  }

  getMaxDateWithExtension(): Date | undefined {
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
    const minDate = getExtension(ExtensionConstants.DATE_MIN_VALUE_URL, this.props.item);
    if (minDate && minDate.valueString) return evaluateFhirpathExpressionToGetDate(this.props.item, minDate.valueString);
    return this.getMinDateWithExtension();
  }

  getMinDateWithExtension(): Date | undefined {
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
    const { dispatch, promptLoginMessage, onAnswerChange, path, item } = this.props;
    if (dispatch) {
      const momentDate = moment(date)
        .locale('nb')
        .utc()
        .format(Constants.DATE_TIME_FORMAT);
      dispatch(newDateTimeValueAsync(this.props.path, momentDate, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDateTime: momentDate } as QuestionnaireResponseAnswer)
      );
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

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { item, pdf, id, onRenderMarkdown, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView item={item} value={this.getStringValue()} onRenderMarkdown={onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
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
                  __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            errorMessage={getValidationTextExtension(item)}
            timeClassName="page_skjemautfyller__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
          />
        </Validation>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(DateTime);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
