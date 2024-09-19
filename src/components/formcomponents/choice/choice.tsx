import { Coding } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import SliderView from './slider-view';
import { NewValueAction, newCodingValueAsync, removeCodingValueAsync } from '@/actions/newValue';
import itemControlConstants from '@/constants/itemcontrol';
import { GlobalState } from '@/reducers';
import {
  getOptions,
  getSystem,
  getDisplay,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '@/util/choice';
import { isReadOnly } from '@/util/index';

import AutosuggestView from '../choice-common/autosuggest-view';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';
import TextView from '../textview';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useEffect } from 'react';

export type ChoiceProps = QuestionnaireComponentItemProps;

export const Choice = (props: ChoiceProps): JSX.Element | null => {
  const { resources, containedResources, item, path, id, pdf, responseItem, children } = props;
  const { promptLoginMessage, onAnswerChange } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);
  useEffect(() => {
    if (!Array.isArray(answer) && answer?.valueCoding?.code && !answer?.valueCoding?.display) {
      if (answer?.valueCoding?.code === item.initial?.[0]?.valueCoding?.code) {
        resetInitialAnswer(answer?.valueCoding?.code);
      }
    }
  }, [answer]);

  const getAnswerValue = (): string[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(el => el?.valueCoding?.code).filter(Boolean) as string[];
    } else if (answer?.valueCoding?.code) {
      return [answer.valueCoding.code];
    }
    return undefined;
  };

  const getInitialValue = (): string[] | undefined => {
    const initialSelectedCode = item.answerOption?.find(option => option.initialSelected)?.valueCoding?.code;

    if (initialSelectedCode) {
      return [initialSelectedCode];
    }
    const code = item.initial?.[0]?.valueCoding?.code;
    return code ? [code] : undefined;
  };

  const getValue = (): string[] | undefined => {
    return getAnswerValue() || getInitialValue();
  };

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

  const resetInitialAnswer = (code?: string): void => {
    if (code && onAnswerChange && path) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (answerContainsCode(code)) {
        dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
      }
      dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange(newState, item, responseAnswer));
      promptLoginMessage?.();
    }
  };

  const handleCheckboxChange = (code?: string): void => {
    if (code && onAnswerChange && path) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (answerContainsCode(code)) {
        dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
      } else {
        dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange(newState, item, responseAnswer));
      }
      promptLoginMessage?.();
    }
  };

  const clearCodingAnswer = (coding: Coding): void => {
    if (onAnswerChange && path) {
      const responseAnswer = { valueCoding: coding };
      dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
      promptLoginMessage?.();
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    if (code && onAnswerChange && path) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };
      dispatch(newCodingValueAsync(path, coding, item)).then(newState => onAnswerChange(newState, item, responseAnswer));
      promptLoginMessage?.();
    }
  };

  const answerContainsCode = (code: string): boolean => {
    const codes = getAnswerValue();
    return codes ? codes.includes(code) : false;
  };

  const renderComponentBasedOnType = (): JSX.Element | null => {
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
        return <DropdownView options={options} {...commonProps} />;
      case itemControlConstants.CHECKBOX:
        return <CheckboxView options={options} {...commonProps} handleChange={handleCheckboxChange} />;
      case itemControlConstants.RADIOBUTTON:
        return <RadioView options={options} {...commonProps} />;
      case itemControlConstants.SLIDER:
        return <SliderView {...commonProps} />;
      default:
        return null;
    }
  };

  if (!enable) return null;

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue()}>
        {children}
      </TextView>
    );
  }

  const options = getOptions(resources, item, containedResources);
  const itemControlValue = getItemControlValue(item);
  const value = getValue();

  const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE;
  const isReceiverComponent = itemControlValue === itemControlConstants.RECEIVERCOMPONENT;

  const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
  const aboveDropdownThreshold = isAboveDropdownThreshold(options);

  return (
    <>
      {hasOptionsAndNoCanonicalValueSet ? (
        itemControlValue ? (
          renderComponentBasedOnType()
        ) : aboveDropdownThreshold ? (
          <DropdownView options={options} handleChange={handleChange} selected={value} {...props}>
            {children}
          </DropdownView>
        ) : (
          <RadioView options={options} handleChange={handleChange} selected={value} {...props}>
            {children}
          </RadioView>
        )
      ) : shouldRenderAutosuggest ? (
        <AutosuggestView handleChange={handleChange} clearCodingAnswer={clearCodingAnswer} {...props}>
          {children}
        </AutosuggestView>
      ) : isReceiverComponent ? (
        <ReceiverComponentWrapper {...props} handleChange={handleChange} selected={value} clearCodingAnswer={clearCodingAnswer}>
          {children}
        </ReceiverComponentWrapper>
      ) : null}
    </>
  );
};

export default Choice;
