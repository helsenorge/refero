import * as React from 'react';

import moment, { Moment } from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { DateRangePicker } from '@helsenorge/toolkit/components/molecules/date-range-picker';
import { DatePickerErrorPhrases } from '@helsenorge/toolkit/components/molecules/date-range-picker/date-range-picker-types';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import Constants from '../../../constants/index';
import { GlobalState } from '../../../reducers';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import { getValidationTextExtension, getPlaceholder, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';

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

  getDatepickerErrorPhrases(): DatePickerErrorPhrases {
    const { resources, item } = this.props;
    // Vi får maks én valideringstekst, derfor settes alle til denne.
    const validationErrorText = getValidationTextExtension(item);

    return {
      errorInvalidDate: validationErrorText ? validationErrorText : resources?.filterDateErrorDateFormat || '',
      errorAfterMaxDate: resources?.errorAfterMaxDate || '',
      errorBeforeMinDate: resources?.errorBeforeMinDate || '',
      errorInvalidDateRange: '',
      errorRequiredDate: resources?.dateRequired || '',
      errorRequiredDateRange: '',
      errorInvalidMinimumNights: '',
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

  onDateChange = (value: Moment | null): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const newValue = value ? moment(value).format(Constants.DATE_FORMAT) : '';
    if (dispatch) {
      dispatch(newDateValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getPdfValue = (): string => {
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

  toLocaleDate(moment: Moment | undefined): Moment | undefined {
    return moment ? moment.locale(this.getLocaleFromLanguage()) : undefined;
  }

  render(): JSX.Element | null {
    const date = this.getValue();
    if (this.props.pdf || isReadOnly(this.props.item)) {
      if (this.props.renderLabel) {
        return (
          <TextView id={this.props.id} item={this.props.item} value={this.getPdfValue()} onRenderMarkdown={this.props.onRenderMarkdown}>
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
          <DateRangePicker
            type="single"
            id={`${getId(this.props.id)}-datepicker_input`}
            locale={this.getLocaleFromLanguage()} // TODO: må støtte nynorsk og samisk også
            errorResources={this.getDatepickerErrorPhrases()}
            resources={this.props.resources}
            label={
              this.props.renderLabel ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${renderPrefix(this.props.item)} ${getText(this.props.item, this.props.onRenderMarkdown)}`,
                  }}
                />
              ) : (
                undefined
              )
            }
            isRequired={isRequired(this.props.item)}
            placeholder={getPlaceholder(this.props.item)}
            ref={this.datepicker}
            maximumDate={this.toLocaleDate(this.getMaxDate())}
            minimumDate={this.toLocaleDate(this.getMinDate())}
            initialDate={this.toLocaleDate(moment(new Date()))}
            singleDateValue={date ? this.toLocaleDate(moment(date)) : undefined}
            className={this.props.className}
            onDateChange={this.onDateChange}
            validationErrorRenderer={this.props.validationErrorRenderer}
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

const withCommonFunctionsComponent = withCommonFunctions(DateComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
