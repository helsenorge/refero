import { parseISO } from 'date-fns';
import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';
import { Extensions } from '../../../constants/extensions';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { safeParseJSON } from '../../../util/date-fns-utils';
import { getExtension, getItemControlExtensionValue } from '../../../util/extension';
import { evaluateFhirpathExpressionToGetDate } from '../../../util/fhirpathHelper';
import { getLabelText, getSublabelText } from '../../../util/index';
import { useDispatch, useSelector } from 'react-redux';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { FormDefinition, getFormDefinition } from '@/reducers/form';

export type DateProps = QuestionnaireComponentItemProps;

const DateComponent = (props: DateProps): JSX.Element | null => {
  const { item, resources, language, onAnswerChange, responseItems, responseItem, path, index, children } = props;
  const answer = useGetAnswer(responseItem, item);
  const questionnaire = useSelector<GlobalState, FormDefinition | undefined | null>(state => getFormDefinition(state))?.Content;
  const { onRenderMarkdown, promptLoginMessage } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const getMaxDate = (): Date | undefined => {
    const maxDate = getExtension(Extensions.DATE_MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
      return fhirPathExpression ? safeParseJSON(fhirPathExpression) : undefined;
    }
    const maxDateWithExtension = getMaxDateWithExtension();
    return maxDateWithExtension ? safeParseJSON(maxDateWithExtension) : undefined;
  };

  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(Extensions.MAX_VALUE_URL, item);
    if (maxDate && maxDate.valueDate) {
      return parseISO(maxDate.valueDate);
    } else if (maxDate && maxDate.valueDateTime) {
      return parseISO(maxDate.valueDateTime);
    } else if (maxDate && maxDate.valueInstant) {
      return parseISO(maxDate.valueInstant);
    }
    return undefined;
  };

  const getMinDate = (): Date | undefined => {
    const minDate = getExtension(Extensions.DATE_MIN_VALUE_URL, item);
    if (minDate && minDate.valueString) {
      const fhirPathExpression = evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
      return fhirPathExpression ? safeParseJSON(fhirPathExpression) : undefined;
    }
    const minDateWithExtension = getMinDateWithExtension();
    return minDateWithExtension ? safeParseJSON(minDateWithExtension) : undefined;
  };

  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(Extensions.MIN_VALUE_URL, item);
    if (minDate && minDate.valueDate) {
      return parseISO(minDate.valueDate);
    } else if (minDate && minDate.valueDateTime) {
      return parseISO(minDate.valueDateTime);
    } else if (minDate && minDate.valueInstant) {
      return parseISO(minDate.valueInstant);
    }
    return undefined;
  };

  const onDateValueChange = (newValue: string): void => {
    const existingAnswer = Array.isArray(answer) ? answer.join(', ') : answer?.valueDate || '';
    if (dispatch && newValue !== existingAnswer && path) {
      dispatch(newDateValueAsync(path, newValue, item))?.then(
        newState => onAnswerChange && onAnswerChange(newState, path, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
      );

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const getLocaleFromLanguage = (): LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN => {
    if (language?.toLowerCase() === 'en-gb') {
      return LanguageLocales.ENGLISH;
    }

    return LanguageLocales.NORWEGIAN;
  };

  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const itemControls = getItemControlExtensionValue(item);
  let element: JSX.Element | undefined = undefined;

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEAR)) {
    element = (
      <DateYearInput
        {...props}
        label={labelText}
        subLabel={subLabelText}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  } else if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.YEARMONTH)) {
    element = (
      <DateYearMonthInput
        {...props}
        label={labelText}
        locale={getLocaleFromLanguage()}
        subLabel={subLabelText}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  } else {
    element = (
      <DateDayInput
        {...props}
        locale={getLocaleFromLanguage()}
        label={labelText}
        subLabel={subLabelText}
        onDateValueChange={onDateValueChange}
        maxDate={getMaxDate()}
        minDate={getMinDate()}
      />
    );
  }

  return (
    <div className="page_refero__component page_refero__component_date">
      {element}
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};
export default DateComponent;
