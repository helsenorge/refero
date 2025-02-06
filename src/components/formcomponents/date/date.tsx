import { useCallback, useMemo } from 'react';

import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { newDateValueAsync } from '../../../actions/newValue';
import itemControlConstants from '../../../constants/itemcontrol';
import { getItemControlExtensionValue } from '../../../util/extension';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';

export type DateProps = QuestionnaireComponentItemProps;

const DateComponent = (props: DateProps): JSX.Element | null => {
  const { language, linkId, path, index, children } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const answer = useGetAnswer(linkId, path);
  const { promptLoginMessage, globalOnChange } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const dispatch = useAppDispatch();
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
  const isYearMonth = itemControls?.some(control => control.code === YEARMONTH);
  const isYear = itemControls?.some(control => control.code === YEAR);

  const element = useMemo(() => {
    if (isYear) {
      return <DateYearInput {...props} onDateValueChange={onDateValueChange} />;
    } else if (isYearMonth) {
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
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};
export default DateComponent;
