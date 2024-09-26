import { ThunkDispatch } from 'redux-thunk';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { NewValueAction, newDateValueAsync } from '../../../actions/newValue';

import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';

import { getItemControlExtensionValue } from '../../../util/extension';

import { useDispatch, useSelector } from 'react-redux';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useCallback, useMemo } from 'react';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

export type DateProps = QuestionnaireComponentItemProps;

const DateComponent = (props: DateProps): JSX.Element | null => {
  const { language, linkId, path, index, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );

  const answer = useGetAnswer(linkId, path);
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const itemControls = useMemo(() => getItemControlExtensionValue(item), [item]);
  const { YEAR, YEARMONTH } = itemControlConstants;

  const onDateValueChange = useCallback(
    (newValue: string): void => {
      const existingAnswer = Array.isArray(answer) ? answer[0].valueDate : answer?.valueDate || '';
      if (newValue !== existingAnswer && path && item) {
        dispatch(newDateValueAsync(path, newValue, item)).then(newState => {
          onAnswerChange?.(newState, item, { valueDate: newValue });
        });

        promptLoginMessage?.();
      }
    },
    [answer, dispatch, item, onAnswerChange, path, promptLoginMessage]
  );

  const locale = useMemo(() => {
    return language?.toLowerCase() === 'en-gb' ? LanguageLocales.ENGLISH : LanguageLocales.NORWEGIAN;
  }, [language]);

  const element = useMemo(() => {
    if (itemControls?.some(control => control.code === YEAR)) {
      return <DateYearInput {...props} onDateValueChange={onDateValueChange} />;
    } else if (itemControls?.some(control => control.code === YEARMONTH)) {
      return <DateYearMonthInput {...props} locale={locale} onDateValueChange={onDateValueChange} />;
    } else {
      return <DateDayInput {...props} locale={locale} onDateValueChange={onDateValueChange} />;
    }
  }, [itemControls, locale, onDateValueChange, props]);

  if (!element) {
    return null;
  }

  return (
    <div className="page_refero__component page_refero__component_date">
      {element}
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};
export default DateComponent;
