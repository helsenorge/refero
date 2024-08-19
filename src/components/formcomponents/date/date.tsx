import { QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';

import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';

import { getItemControlExtensionValue } from '../../../util/extension';

import { getLabelText, getSublabelText } from '../../../util/index';
import { useDispatch, useSelector } from 'react-redux';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { FormDefinition, getFormDefinition } from '@/reducers/form';
import { useMinMaxDate } from './useMinMaxDate';

export type DateProps = QuestionnaireComponentItemProps;

const DateComponent = (props: DateProps): JSX.Element | null => {
  const { item, resources, language, responseItems, responseItem, path, index, children } = props;
  const answer = useGetAnswer(responseItem, item);
  const questionnaire = useSelector<GlobalState, FormDefinition | undefined | null>(state => getFormDefinition(state))?.Content;
  const { onRenderMarkdown, promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const { minDateTime, maxDateTime } = useMinMaxDate(item);
  const onDateValueChange = (newValue: string): void => {
    const existingAnswer = Array.isArray(answer) ? answer[0].valueDate : answer?.valueDate || '';
    if (dispatch && newValue !== existingAnswer && path) {
      dispatch(newDateValueAsync(path, newValue, item))?.then(
        newState => onAnswerChange && onAnswerChange(newState, item, { valueDate: newValue } as QuestionnaireResponseItemAnswer)
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
        maxDate={maxDateTime}
        minDate={minDateTime}
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
        maxDate={maxDateTime}
        minDate={minDateTime}
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
        maxDate={maxDateTime}
        minDate={minDateTime}
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
