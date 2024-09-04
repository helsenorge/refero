import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Coding } from 'fhir/r4';
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
  getIndexOfAnswer,
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
    if (
      !Array.isArray(answer) &&
      answer?.valueCoding?.code &&
      answer?.valueCoding?.code === item.initial?.[0]?.valueCoding?.code &&
      answer?.valueCoding?.display === undefined
    ) {
      resetInitialAnswer(answer?.valueCoding?.code);
    }
  }, [answer]);

  const getAnswerValue = (answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string[] | undefined => {
    if (Array.isArray(answer)) {
      return answer
        .map((el: QuestionnaireResponseItemAnswer) => {
          if (el && el.valueCoding && el.valueCoding.code) {
            return el.valueCoding.code;
          }
        })
        .filter(x => x !== undefined);
    } else if (answer?.valueCoding?.code) {
      return [answer.valueCoding.code];
    }
    return undefined;
  };

  const getInitialValue = (item: QuestionnaireItem): string[] | undefined => {
    const code = item?.initial?.[0]?.valueCoding?.code;
    const initialSelectedOption = item.answerOption?.filter(x => x.initialSelected);

    if (initialSelectedOption && initialSelectedOption.length > 0) {
      const initialSelectedCode = initialSelectedOption[0].valueCoding?.code;
      return initialSelectedCode ? [initialSelectedCode] : undefined;
    }
    return code ? [code] : undefined;
  };

  const getValue = (
    item: QuestionnaireItem,
    answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): string[] | undefined => {
    const answerValue = getAnswerValue(answer);
    if (answerValue) {
      return answerValue;
    } else {
      const initialValue = getInitialValue(item);
      if (initialValue) return initialValue;
    }
    return undefined;
  };

  const getPDFValue = (item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string => {
    const value = getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    return Array.isArray(value) ? value.map(el => getDisplay(getOptions(props.resources, item, containedResources), el)).join(', ') : value;
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(props.resources, props.item, props.containedResources), code);
    const system = systemArg ? systemArg : getSystem(props.item, code, props.containedResources);
    return { code, display, system };
  };

  const resetInitialAnswer = (code?: string): void => {
    if (code && onAnswerChange && path) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, item, responseAnswer));
      } else {
        dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, item, responseAnswer));
      }
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleCheckboxChange = (code?: string): void => {
    resetInitialAnswer(code);
  };

  const clearCodingAnswer = (coding: Coding): void => {
    if (onAnswerChange && path) {
      const responseAnswer = { valueCoding: coding };

      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    if (code && onAnswerChange && path) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };

      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const renderComponentBasedOnType = (): JSX.Element | null => {
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) {
      return null;
    }
    const options = getOptions(resources, item, containedResources);

    const commonProps = {
      handleChange: handleChange,
      selected: getValue(item, answer),
      ...props,
    };

    const componentMap = {
      [itemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [itemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} handleChange={handleCheckboxChange} />,
      [itemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [itemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };

  const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
  const options = getOptions(resources, item, containedResources);
  const aboveDropdownThreshold = isAboveDropdownThreshold(options);
  const itemControlValue = getItemControlValue(item);
  const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === itemControlConstants.AUTOCOMPLETE;
  const isReceiverComponent = itemControlValue === itemControlConstants.RECEIVERCOMPONENT;
  const value = getValue(item, answer);

  if (!enable) {
    return null;
  }

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue(item, answer)}>
        {children}
      </TextView>
    );
  }

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
