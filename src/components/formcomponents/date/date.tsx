import * as React from 'react';

import moment, { Moment } from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';

import { DateRangePicker } from '@helsenorge/toolkit/components/molecules/date-range-picker';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { getExtension, getItemControlExtensionValue } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isReadOnly, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';
import withCommonFunctions from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';
import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';

export interface Props {
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  language?: string;
  promptLoginMessage?: () => void;
  renderLabel?: boolean;
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
    renderLabel: true,
    path: [],
  };
  datepicker: React.RefObject<DateRangePicker>;
  constructor(props: Props) {
    super(props);
    this.datepicker = React.createRef();
  }

  getStringValue(): string | undefined {
    const { answer } = this.props;
    if (answer && answer.valueDate) {
      return answer.valueDate;
    }
    if (answer && answer.valueDateTime) {
      return answer.valueDateTime;
    }
  }

  getValue(): Date | undefined {
    const { item, answer } = this.props;
    if (answer && answer.valueDate) {
      return parseDate(String(answer.valueDate));
    }
    if (answer && answer.valueDateTime) {
      return parseDate(String(answer.valueDateTime));
    }
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDate) {
      return parseDate(String(item.initial[0].valueDate));
    }
    return parseDate(String(item.initial[0].valueDateTime));
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
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    if (dispatch) {
      dispatch(newDateValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getReadonlyValue = (): string => {
    const date = this.getValue();
    let text = '';
    if (this.props.resources && this.props.resources.ikkeBesvart) {
      text = this.props.resources.ikkeBesvart;
    }

    return date ? moment(date).format('D. MMMM YYYY') : text;
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
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const date = this.getValue();
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown);

    if (this.props.pdf || isReadOnly(this.props.item)) {
      if (this.props.renderLabel) {
        return (
          <TextView
            id={this.props.id}
            item={this.props.item}
            value={this.getReadonlyValue()}
            onRenderMarkdown={this.props.onRenderMarkdown}
          >
            {this.props.children}
          </TextView>
        );
      } else {
        return <span>{this.getReadonlyValue()}</span>;
      }
    }
    const itemControls = getItemControlExtensionValue(this.props.item);
    const labelEl = this.props.renderLabel ? <Label item={this.props.item} onRenderMarkdown={this.props.onRenderMarkdown} /> : undefined;
    const subLabelEl = subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined;

    let element: JSX.Element | undefined = undefined;

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEAR)) {
      element = (
        <DateYearInput
          id={this.props.id}
          resources={this.props.resources}
          label={labelEl}
          subLabel={subLabelEl}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          className={this.props.className}
          yearValue={date ? date.getFullYear() : undefined}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}
          {...this.props}
        />
      );
    } else if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
      const stringDate = this.getStringValue();
      element = (
        <DateYearMonthInput
          id={this.props.id}
          resources={this.props.resources}
          label={labelEl}
          locale={this.getLocaleFromLanguage()}
          subLabel={subLabelEl}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          className={this.props.className}
          yearMonthValue={stringDate}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}
          {...this.props}
        />
      );
    } else {
      element = (
        <DateDayInput
          id={this.props.id}
          resources={this.props.resources}
          locale={this.getLocaleFromLanguage()}
          label={labelEl}
          subLabel={subLabelEl}
          datepickerRef={this.datepicker}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
          onDateValueChange={this.onDateValueChange}
          validationErrorRenderer={this.props.validationErrorRenderer}
          className={this.props.className}
          dateValue={date}
          maxDate={this.getMaxDate()}
          minDate={this.getMinDate()}
          {...this.props}
        />
      );
    }

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_date">
        {element}
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(DateComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
