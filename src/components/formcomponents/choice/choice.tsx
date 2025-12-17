import { useCallback, useEffect, useMemo } from 'react';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { Coding, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import SliderView from './slider-view';
import AutosuggestView from '../choice-common/autosuggest-view';
import { ReadOnly } from '../read-only/readOnly';
import ReceiverComponentWrapper from '../receiver-component/receiver-component-wrapper';

import { newCodingValueAsync, removeCodingValueAsync } from '@/actions/newValue';
import itemControlConstants, { type ItemControlValue } from '@/constants/itemcontrol';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { isDataReceiver } from '@/util';
import {
  getOptions,
  getSystem,
  getDisplay,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '@/util/choice';

export type ChoiceProps = QuestionnaireComponentItemProps;

export const Choice = (props: ChoiceProps): JSX.Element | null => {
  const { containedResources, path, linkId, children } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const answer = useGetAnswer(linkId, path);

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const dispatch = useAppDispatch();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const getAnswerValue = useCallback((): string[] | undefined => {
    const initialSelectedOption = item?.answerOption?.find(x => x.initialSelected);

    if (Array.isArray(answer)) {
      return answer
        .map(el => {
          if (el?.valueCoding?.code) {
            return el.valueCoding.code;
          } else if (el?.valueReference?.reference) {
            return el.valueReference.reference;
          } else {
            return undefined;
          }
        })
        .filter(Boolean) as string[];
    } else if (answer?.valueCoding?.code) {
      return [answer.valueCoding.code];
    } else if (answer?.valueReference?.reference) {
      return [answer.valueReference.reference];
    } else if (initialSelectedOption?.valueCoding?.code) {
      return [initialSelectedOption.valueCoding.code];
    } else if (
      !item ||
      !item.initial ||
      item.initial.length === 0 ||
      !item.initial[0].valueCoding?.code ||
      !item.initial[0].valueReference?.reference
    ) {
      return [];
    }
    return undefined;
  }, [answer, item]);
  const getAnswerValueCoding = useCallback(
    (code: string, systemArg?: string, displayArg?: string): Coding => {
      const display = displayArg || getDisplay(getOptions(resources, item, containedResources), code);
      const system = systemArg || getSystem(item, code, containedResources);
      return { code, display, system };
    },
    [resources, item, containedResources] // Add dependencies here
  );
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
  useEffect(() => {
    if (!Array.isArray(answer) && answer?.valueCoding?.code && !answer?.valueCoding?.display) {
      if (answer?.valueCoding?.code === item?.initial?.[0]?.valueCoding?.code) {
        resetInitialAnswer(answer?.valueCoding?.code);
      }
    }
  }, [answer, item, resetInitialAnswer]);

  const getPDFValue = (): string => {
    if (isDataReceiver(item)) {
      return Array.isArray(answer)
        ? answer
            .map((el: QuestionnaireResponseItemAnswer) => {
              if (el && el.valueCoding && el.valueCoding.display) {
                return el.valueCoding.display;
              }
            })
            ?.join(', ')
        : (answer && answer.valueCoding && answer.valueCoding.display) || resources?.ikkeBesvart || '';
    }
    const value = getAnswerValue();
    if (!value || value.length === 0) {
      return resources?.ikkeBesvart || '';
    }
    return value.map(code => getDisplay(getOptions(resources, item, containedResources), code)).join(', ');
  };

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

  const renderComponentBasedOnType = (itemControlValue: ItemControlValue | undefined): JSX.Element | null => {
    const pdfValue = getPDFValue();

    if (!itemControlValue) return null;

    const options = getOptions(resources, item, containedResources);
    const commonProps = {
      handleChange,
      selected: getAnswerValue(),
      pdfValue,
      options,
      ...props,
    };

    switch (itemControlValue) {
      case itemControlConstants.DROPDOWN:
        return <DropdownView {...commonProps} />;
      case itemControlConstants.CHECKBOX:
        return <CheckboxView {...commonProps} handleChange={handleCheckboxChange} />;
      case itemControlConstants.RADIOBUTTON:
        return <RadioView {...commonProps} />;
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

  const itemControlValue = getItemControlValue(item);

  const options = getOptions(resources, item, containedResources);
  const value = getAnswerValue();
  useResetFormField(props.idWithLinkIdAndItemIndex, value);
  const shouldRenderAutosuggest = useMemo(
    () => hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE,
    [item, itemControlValue]
  );

  const isReceiverComponent = itemControlValue === itemControlConstants.RECEIVERCOMPONENT;

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
          renderComponentBasedOnType(itemControlValue)
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
