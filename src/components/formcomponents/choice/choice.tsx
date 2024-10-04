import { Coding, QuestionnaireItem } from 'fhir/r4';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import SliderView from './slider-view';
import { newCodingValueAsync, removeCodingValueAsync } from '@/actions/newValue';
import itemControlConstants from '@/constants/itemcontrol';
import { GlobalState, useAppDispatch } from '@/reducers';
import {
  getOptions,
  getSystem,
  getDisplay,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '@/util/choice';

import AutosuggestView from '../choice-common/autosuggest-view';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useCallback, useEffect, useMemo } from 'react';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';

export type ChoiceProps = QuestionnaireComponentItemProps;

export const Choice = (props: ChoiceProps): JSX.Element | null => {
  const { containedResources, path, linkId, children } = props;

  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const dispatch = useAppDispatch();
  const answer = useGetAnswer(linkId, path);
  useEffect(() => {
    if (!Array.isArray(answer) && answer?.valueCoding?.code && !answer?.valueCoding?.display) {
      if (answer?.valueCoding?.code === item?.initial?.[0]?.valueCoding?.code) {
        resetInitialAnswer(answer?.valueCoding?.code);
      }
    }
  }, [answer]);

  const getAnswerValue = useCallback((): string[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(el => el?.valueCoding?.code).filter(Boolean) as string[];
    } else if (answer?.valueCoding?.code) {
      return [answer.valueCoding.code];
    }
    return undefined;
  }, [answer]);

  const getInitialValue = useCallback((): string[] | undefined => {
    const initialSelectedCode = item?.answerOption?.find(option => option.initialSelected)?.valueCoding?.code;

    if (initialSelectedCode) {
      return [initialSelectedCode];
    }
    const code = item?.initial?.[0]?.valueCoding?.code;
    return code ? [code] : undefined;
  }, [item]);

  const getValue = useCallback((): string[] | undefined => {
    return getAnswerValue() || getInitialValue();
  }, [getAnswerValue, getInitialValue]);

  const getPDFValue = (): string => {
    const value = getValue();
    if (!value) {
      return resources?.ikkeBesvart || '';
    }
    return value.map(code => getDisplay(getOptions(resources, item, containedResources), code)).join(', ');
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg || getDisplay(getOptions(resources, item, containedResources), code);
    const system = systemArg || getSystem(item, code, containedResources);
    return { code, display, system };
  };
  const answerContainsCode = useCallback(
    (code: string): boolean => {
      const codes = getAnswerValue();
      return codes ? codes.includes(code) : false;
    },
    [getAnswerValue]
  );

  const resetInitialAnswer = useCallback(
    (code?: string): void => {
      if (code && onAnswerChange && path && item) {
        const coding = getAnswerValueCoding(code);
        const responseAnswer = { valueCoding: coding };
        if (answerContainsCode(code)) {
          dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
        }
        dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange(newState, item, responseAnswer));
        promptLoginMessage?.();
      }
    },
    [answerContainsCode, dispatch, getAnswerValueCoding, item, onAnswerChange, path, promptLoginMessage]
  );

  const handleCheckboxChange = useCallback(
    (code?: string): void => {
      if (code && onAnswerChange && path && item) {
        const coding = getAnswerValueCoding(code);
        const responseAnswer = { valueCoding: coding };
        if (answerContainsCode(code)) {
          dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
        } else {
          dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange(newState, item, responseAnswer));
        }
        promptLoginMessage?.();
      }
    },
    [answerContainsCode, dispatch, getAnswerValueCoding, item, onAnswerChange, path, promptLoginMessage]
  );

  const clearCodingAnswer = useCallback(
    (coding: Coding): void => {
      if (onAnswerChange && path && item) {
        const responseAnswer = { valueCoding: coding };
        dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
        promptLoginMessage?.();
      }
    },
    [dispatch, item, onAnswerChange, path, promptLoginMessage]
  );

  const handleChange = useCallback(
    (code?: string, systemArg?: string, displayArg?: string): void => {
      if (code && onAnswerChange && path && item) {
        const coding = getAnswerValueCoding(code, systemArg, displayArg);
        const responseAnswer = { valueCoding: coding };
        dispatch(newCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
        promptLoginMessage?.();
      }
    },
    [dispatch, getAnswerValueCoding, item, onAnswerChange, path, promptLoginMessage]
  );

  const renderComponentBasedOnType = (): JSX.Element | null => {
    const pdfValue = getPDFValue();
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) return null;

    const options = getOptions(resources, item, containedResources);
    const commonProps = {
      handleChange,
      selected: getValue(),
      ...props,
    };

    switch (itemControlValue) {
      case itemControlConstants.DROPDOWN:
        return <DropdownView options={options} pdfValue={pdfValue} {...commonProps} />;
      case itemControlConstants.CHECKBOX:
        return <CheckboxView options={options} pdfValue={pdfValue} {...commonProps} handleChange={handleCheckboxChange} />;
      case itemControlConstants.RADIOBUTTON:
        return <RadioView options={options} pdfValue={pdfValue} {...commonProps} />;
      case itemControlConstants.SLIDER:
        return <SliderView {...commonProps} />;
      case itemControlConstants.DATARECEIVER:
        return (
          <ReadOnly item={item} id={props.idWithLinkIdAndItemIndex} pdfValue={pdfValue}>
            {children}
          </ReadOnly>
        );
      default:
        return null;
    }
  };

  const itemControlValue = useMemo(() => getItemControlValue(item), [item]);

  const options = useMemo(() => getOptions(resources, item, containedResources), [resources, item, containedResources]);
  const value = useMemo(() => getValue(), [getAnswerValue, getInitialValue]);

  const shouldRenderAutosuggest = useMemo(
    () => hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE,
    [item, itemControlValue]
  );

  const isReceiverComponent = useMemo(() => itemControlValue === itemControlConstants.RECEIVERCOMPONENT, [itemControlValue]);

  const hasOptionsAndNoCanonicalValueSet = useMemo(
    () => hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item),
    [resources, item, containedResources]
  );

  const aboveDropdownThreshold = useMemo(() => isAboveDropdownThreshold(options), [options]);

  if (!hasOptionsAndNoCanonicalValueSet && !shouldRenderAutosuggest && !isReceiverComponent) {
    return null;
  }
  return (
    <>
      {hasOptionsAndNoCanonicalValueSet &&
        (itemControlValue ? (
          renderComponentBasedOnType()
        ) : aboveDropdownThreshold ? (
          <DropdownView options={options} handleChange={handleChange} selected={value} pdfValue={getPDFValue()} {...props}>
            {children}
          </DropdownView>
        ) : (
          <RadioView options={options} handleChange={handleChange} selected={value} pdfValue={getPDFValue()} {...props}>
            {children}
          </RadioView>
        ))}
      {shouldRenderAutosuggest && (
        <AutosuggestView handleChange={handleChange} clearCodingAnswer={clearCodingAnswer} pdfValue={getPDFValue()} {...props}>
          {children}
        </AutosuggestView>
      )}
      {isReceiverComponent && (
        <ReceiverComponentWrapper
          item={item}
          handleChange={handleChange}
          selected={value}
          clearCodingAnswer={clearCodingAnswer}
          pdfValue={getPDFValue()}
          {...props}
        >
          {children}
        </ReceiverComponentWrapper>
      )}
    </>
  );
};

export default Choice;
