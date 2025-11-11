import { useCallback, useMemo } from 'react';

import { DateDayInput } from './date-day-input';
import { DateYearMonthInput } from './date-month-input';
import { DateYearInput } from './date-year-input';
import { newDateValueAsync } from '../../../actions/newValue';
import itemControlConstants from '../../../constants/itemcontrol';
import { getItemControlExtensionValue } from '../../../util/extension';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { initialize } from '@/util/date-fns-utils';
export type DateProps = QuestionnaireComponentItemProps;

const DateComponent = (props: DateProps): JSX.Element | null => {
  initialize();

  const { linkId, path, index, children } = props;
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

  const isYearMonth = itemControls?.some(control => control.code === YEARMONTH);
  const isYear = itemControls?.some(control => control.code === YEAR);

  const element = useMemo(() => {
    if (isYear) {
      return <DateYearInput {...props} onDateValueChange={onDateValueChange} />;
    } else if (isYearMonth) {
      return <DateYearMonthInput {...props} onDateValueChange={onDateValueChange} />;
    } else {
      return <DateDayInput {...props} onDateValueChange={onDateValueChange} />;
    }
  }, [onDateValueChange, props, isYear, isYearMonth]);

  if (!element) {
    return null;
  }

  return (
    <div className="page_refero__date_component">
      {element}
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};
export default DateComponent;
