import * as React from 'react';
import moment, { Moment } from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import { DateRangePicker } from '@helsenorge/date-time/components/date-range-picker';
import { parseDate } from '@helsenorge/date-time/components/time-input/date-core';
import { ValidationProps } from '@helsenorge/form/components/form/validation';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { getExtension, getItemControlExtensionValue } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';

export interface Props {
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

class DateComponent extends React.Component<Props & ValidationProps> {
  static defaultProps: Partial<Props> = {
    path: [],
  };
  datepicker: React.RefObject<DateRangePicker>;
  constructor(props: Props) {
    super(props);
    this.datepicker = React.createRef();
  }

  getMaxDate(): Moment | undefined {
    const maxDate = getExtension(ExtensionConstants.DATE_MAX_VALUE_URL, this.props.item);
    if (maxDate && maxDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(this.props.item, maxDate.valueString);
      return fhirPathExpression ? moment(fhirPathExpression) : undefined;
    }
    const maxDateWithExtension = this.getMaxDateWithExtension();
    return maxDateWithExtension ? moment(maxDateWithExtension) : undefined;
  }

  getMaxDateWithExtension(): Date | undefined {
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

  getMinDate(): Moment | undefined {
    const minDate = getExtension(ExtensionConstants.DATE_MIN_VALUE_URL, this.props.item);
    if (minDate && minDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(this.props.item, minDate.valueString);
      return fhirPathExpression ? moment(fhirPathExpression) : undefined;
    }
    const minDateWithExtension = this.getMinDateWithExtension();
    return minDateWithExtension ? moment(minDateWithExtension) : undefined;
  }

  getMinDateWithExtension(): Date | undefined {
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

  onDateValueChange = (newValue: string): void => {
    const { dispatch, promptLoginMessage, path, item, answer, onAnswerChange } = this.props;
    const existingAnswer = answer?.valueDate || '';
    if (dispatch && newValue !== existingAnswer) {
      dispatch(newDateValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getLocaleFromLanguage = (): LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN => {
    if (this.props.language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  render(): JSX.Element | null {   
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources);

    const itemControls = getItemControlExtensionValue(this.props.item);
    const labelEl = (
      <Label
        item={this.props.item}
        onRenderMarkdown={this.props.onRenderMarkdown}
        questionnaire={this.props.questionnaire}
        resources={this.props.resources}
      />
    );
    const subLabelEl = subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined;

    let element: JSX.Element | undefined = undefined;

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEAR)) {
      element = (
        <DateYearInput
          label={labelEl}
          subLabel={subLabelEl}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}
          {...this.props}
        />
      );
    } else if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
      element = (
        <DateYearMonthInput
          label={labelEl}
          locale={this.getLocaleFromLanguage()}
          subLabel={subLabelEl}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}          
          {...this.props}
        />
      );
    } else {
      element = (
        <DateDayInput
          locale={this.getLocaleFromLanguage()}
          label={labelEl}
          subLabel={subLabelEl}
          datepickerRef={this.datepicker}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}
          {...this.props}
        />
      );
    }

    return (
      <div className="page_refero__component page_refero__component_date">
        {element}
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(DateComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
