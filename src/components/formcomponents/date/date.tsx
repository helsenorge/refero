import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { DatePicker, DatePickerResources } from '@helsenorge/toolkit/components/molecules/datepicker';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import ExtensionConstants from '../../../constants/extensions';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import Constants from '../../../constants/index';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import withCommonFunctions from '../../with-common-functions';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getExtension } from '../../../util/extension';
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
  renderLabel?: boolean;
  className?: string;
  id?: string;
  validationErrorRenderer?: JSX.Element;
  renderDeleteButton: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
}

class DateComponent extends React.Component<Props & ValidationProps> {
  static defaultProps: Partial<Props> = {
    renderLabel: true,
    path: [],
  };
  datepicker: React.RefObject<DatePicker>;
  constructor(props: Props) {
    super(props);
    this.datepicker = React.createRef();
  }

  createDatePickerResources(): DatePickerResources {
    const { resources, item } = this.props;
    if (!resources || !resources) {
      return {
        calendarButton: '',
        navigateForward: '',
        navigateBackward: '',
        errorInvalidDate: '',
        errorAfterMaxDate: '',
        errorBeforeMinDate: '',
      };
    }
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      calendarButton: resources.filterDateCalendarButton,
      navigateForward: resources.filterDateNavigateForward,
      navigateBackward: resources.filterDateNavigateBackward,
      errorInvalidDate: validationErrorText ? validationErrorText : resources.filterDateErrorDateFormat,
      errorAfterMaxDate: validationErrorText ? validationErrorText : resources.errorAfterMaxDate,
      errorBeforeMinDate: validationErrorText ? validationErrorText : resources.errorBeforeMinDate,
      dateRequired: validationErrorText ? validationErrorText : resources.dateRequired,
    };
  }

  getValue(): Date | undefined {
    const { item, answer } = this.props;
    if (answer && answer.valueDate) {
      return parseDate(String(answer.valueDate));
    }
    if (answer && answer.valueDateTime) {
      return parseDate(String(answer.valueDateTime));
    }
    if (!item) {
      return undefined;
    }
    if (!item.initialDate && !item.initialDateTime) {
      return undefined;
    }
    if (item.initialDate) {
      return parseDate(String(item.initialDate));
    }
    return parseDate(String(item.initialDateTime));
  }

  getMaxDate(): Date | undefined {
    const maxDate = getExtension(ExtensionConstants.MAX_VALUE_URL, this.props.item);
    if (maxDate && maxDate.valueDate) {
      return parseDate(String(maxDate.valueDate));
    } else if (maxDate && maxDate.valueDateTime) {
      return parseDate(String(maxDate.valueDateTime));
    } else if (maxDate && maxDate.valueInstant) {
      return parseDate(String(maxDate.valueInstant));
    }
    return undefined;
  }

  getMinDate(): Date | undefined {
    const minDate = getExtension(ExtensionConstants.MIN_VALUE_URL, this.props.item);
    if (minDate && minDate.valueDate) {
      return parseDate(String(minDate.valueDate));
    } else if (minDate && minDate.valueDateTime) {
      return parseDate(String(minDate.valueDateTime));
    } else if (minDate && minDate.valueInstant) {
      return parseDate(String(minDate.valueInstant));
    }
    return undefined;
  }

  onDateChange = (value?: Date): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const newValue = value ? moment(value).format(Constants.DATE_FORMAT) : '';
    if (dispatch) {
      dispatch(newDateValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getPdfValue = () => {
    const date = this.getValue();
    let text = '';
    if (this.props.resources && this.props.resources.ikkeBesvart) {
      text = this.props.resources.ikkeBesvart;
    }

    return date ? moment(date).format('D. MMMM YYYY') : text;
  };

  render(): JSX.Element | null {
    const date = this.getValue();
    if (this.props.pdf || isReadOnly(this.props.item)) {
      if (this.props.renderLabel) {
        return (
          <TextView item={this.props.item} value={this.getPdfValue()}>
            {this.props.children}
          </TextView>
        );
      } else {
        return <span>{this.getPdfValue()}</span>;
      }
    }
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_date">
        <Validation {...this.props}>
          <DatePicker
            id={getId(this.props.id)}
            datepickerId={`${getId(this.props.id)}-datepicker`}
            resources={this.createDatePickerResources()}
            label={
              this.props.renderLabel ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${renderPrefix(this.props.item)} ${getText(this.props.item)}`,
                  }}
                />
              ) : (
                undefined
              )
            }
            isNullable={true}
            isRequired={isRequired(this.props.item)}
            placeholder={getPlaceholder(this.props.item)}
            ref={this.datepicker}
            maxDate={this.getMaxDate()}
            minDate={this.getMinDate()}
            defaultDate={date}
            value={date}
            returnInvalidDate
            className={this.props.className}
            inputClassName="page_skjemautfyller__input"
            onDateChange={this.onDateChange}
            validationErrorRenderer={this.props.validationErrorRenderer}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
          >
            {this.props.renderDeleteButton()}
          </DatePicker>
        </Validation>
        <div>{this.props.repeatButton}</div>
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(DateComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
