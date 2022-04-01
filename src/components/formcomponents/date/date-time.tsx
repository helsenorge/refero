import * as React from 'react';

import moment, { Moment } from 'moment';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import DateTimePicker from '@helsenorge/toolkit/components/molecules/date-time-picker';
import { getFullMomentDate } from '@helsenorge/toolkit/components/molecules/date-time-picker/date-time-picker-utils';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { parseDate } from '@helsenorge/toolkit/components/molecules/time-input/date-core';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDateTimeValueAsync } from '../../../actions/newValue';
import ExtensionConstants from '../../../constants/extensions';
import Constants from '../../../constants/index';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getExtension } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { isRequired, getId, isReadOnly, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';
import withCommonFunctions from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';

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
  id?: string;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
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
    if (!item || !item.initial || item.initial.length === 0) {
      return undefined;
    }
    if (!item.initial[0].valueDate && !item.initial[0].valueDateTime) {
      return undefined;
    }
    if (item.initial[0].valueDateTime) {
      return parseDate(String(item.initial[0].valueDateTime));
    }
    return parseDate(String(item.initial[0].valueDate));
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

  dispatchNewDate = (date: Moment | undefined, time: string | undefined): void => {
    const { dispatch, promptLoginMessage, onAnswerChange, answer, path, item } = this.props;
    const momentDate = getFullMomentDate(date, time);
    const dateTimeString = momentDate ? momentDate.locale('nb').utc().format(Constants.DATE_TIME_FORMAT) : '';
    const existingAnswer = answer?.valueDateTime || '';
    if (dispatch && existingAnswer !== dateTimeString) {
      dispatch(newDateTimeValueAsync(this.props.path, dateTimeString, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDateTime: dateTimeString } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  promptLogin = (): void => {
    if (this.props.promptLoginMessage) {
      this.props.promptLoginMessage();
    }
  };

  onBlur = (): boolean => {
    return true;
  };

  getStringValue = (): string => {
    const date = this.getDefaultDate(this.props);
    let text = '';
    if (this.props.resources && this.props.resources.ikkeBesvart) {
      text = this.props.resources.ikkeBesvart;
    }
    return date ? moment(date).locale('nb').format('LLL') : text;
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  getLocaleFromLanguage = (): LanguageLocales.NORWEGIAN | LanguageLocales.ENGLISH => {
    if (this.props.language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  toLocaleDate(moment: Moment | undefined): Moment | undefined {
    return moment ? moment.locale(this.getLocaleFromLanguage()) : undefined;
  }

  render(): JSX.Element | null {
    const { item, pdf, id, onRenderMarkdown, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView id={id} item={item} value={this.getStringValue()} onRenderMarkdown={onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    }
    const valueDateTime = this.getDefaultDate(this.props);
    const maxDateTime = this.getMaxDate();
    const minDateTime = this.getMinDate();
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire);

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_datetime">
        <Validation {...other}>
          <DateTimePicker
            id={getId(id)}
            resources={{ dateResources: this.props.resources }}
            locale={this.getLocaleFromLanguage()}
            dateValue={valueDateTime ? this.toLocaleDate(moment(valueDateTime)) : undefined}
            timeValue={valueDateTime ? moment(valueDateTime).format('HH:mm') : undefined}
            maximumDateTime={maxDateTime ? this.toLocaleDate(moment(maxDateTime)) : undefined}
            minimumDateTime={minDateTime ? this.toLocaleDate(moment(minDateTime)) : undefined}
            initialDate={this.toLocaleDate(moment(new Date()))}
            onChange={this.dispatchNewDate}
            onBlur={this.onBlur}
            legend={
              <Label item={this.props.item} onRenderMarkdown={this.props.onRenderMarkdown} questionnaire={this.props.questionnaire} />
            }
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            isRequired={isRequired(item)}
            errorMessage={getValidationTextExtension(item)}
            timeClassName="page_skjemautfyller__input"
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

const withCommonFunctionsComponent = withCommonFunctions(DateTime);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
