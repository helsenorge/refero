import React, { FocusEvent } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, Coding } from 'fhir/r4';
import { ThunkDispatch } from 'redux-thunk';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import TextField from './text-field';
import {
  NewValueAction,
  removeCodingValueAsync,
  newCodingValueAsync,
  newCodingStringValueAsync,
  removeCodingStringValueAsync,
} from '@/actions/newValue';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '@/constants';
import ItemControlConstants from '@/constants/itemcontrol';
import { GlobalState } from '@/reducers';
import { isReadOnly, isDataReceiver } from '@/util';
import {
  getOptions,
  shouldShowExtraChoice,
  getDisplay,
  getSystem,
  getIndexOfAnswer,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '@/util/choice';

import SliderView from '../choice/slider-view';
import AutosuggestView from '../choice-common/autosuggest-view';
import TextView from '../textview';
import { useDispatch } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export type OpenChoiceProps = RenderItemProps & {
  children?: React.ReactNode;
};

export const OpenChoice = (props: OpenChoiceProps): JSX.Element | null => {
  const { id, item, pdf, responseItem, containedResources, resources, path, onAnswerChange, children } = props;
  const { promptLoginMessage } = useExternalRenderContext();
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);
  const getDataReceiverValue = (answer: QuestionnaireResponseItemAnswer[]): string[] | undefined => {
    return answer
      .filter(f => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding) {
          return el.valueCoding.display;
        }
        if (el && el.valueString) {
          return el.valueString;
        }
      })
      .filter((it): it is string => it !== undefined);
  };

  const getPDFValue = (item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string => {
    if (isDataReceiver(item) && Array.isArray(answer)) {
      return getDataReceiverValue(answer)?.join(', ') || '';
    }
    const value = getValue(item, answer);

    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    const displayValues = value
      .filter(el => el !== OPEN_CHOICE_ID)
      .map(el => getDisplay(getOptions(resources, item, containedResources), el))
      .filter((it): it is string => it !== undefined);
    const openValue = getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  };

  const getOpenValue = (answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string | undefined => {
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i];
        if (el.valueString) {
          return el.valueString;
        }
      }
    }

    return;
  };

  const getValue = (
    item: QuestionnaireItem,
    answer?: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseItemAnswer) => {
        if (el) {
          if (el.valueCoding && el.valueCoding.code) {
            return el.valueCoding.code;
          }
        }
      });
    } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code) {
      if (answer.valueCoding?.code === item.initial?.[0].valueCoding?.code && answer.valueCoding?.display === undefined) {
        resetInitialAnswer(answer.valueCoding.code);
      }
      return [answer.valueCoding.code];
    }
    const initialSelectedOption = item.answerOption?.filter(x => x.initialSelected);
    if (initialSelectedOption && initialSelectedOption.length > 0) {
      return [initialSelectedOption[0].valueCoding?.code];
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueCoding || !item.initial[0].valueCoding.code) {
      return undefined;
    }
    return [String(item.initial[0].valueCoding.code)];
  };

  const handleStringChangeEvent = (event: FocusEvent<HTMLInputElement, Element>): void => {
    const value = event.target.value;
    handleStringChange(value);
  };

  const handleStringChange = (value: string): void => {
    if (dispatch && onAnswerChange && path) {
      if (value.length > 0) {
        dispatch(newCodingStringValueAsync(path, value, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: value })
        );
      } else {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg ? displayArg : getDisplay(getOptions(resources, item, containedResources), code);
    const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(item, code, containedResources);
    const system = systemArg ? systemArg : valueSetSystem;
    return { code, display, system };
  };

  const resetInitialAnswer = (code: string): void => {
    if (dispatch && code && path && onAnswerChange) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }
      dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleCheckboxChange = (code?: string): void => {
    if (dispatch && code && path && onAnswerChange) {
      const coding = getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding };
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      interceptHandler(coding, getItemControlValue(item));
    }
  };

  const clearCodingAnswer = (coding: Coding): void => {
    if (dispatch && onAnswerChange && path) {
      const responseAnswer = { valueCoding: coding };
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  const handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    if (dispatch && code && path && onAnswerChange) {
      const coding = getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding };
      dispatch(newCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }

      interceptHandler(coding, getItemControlValue(item));
    }
  };

  const interceptHandler = (coding: Coding, type: string | undefined): void => {
    switch (type) {
      case ItemControlConstants.CHECKBOX:
        return multiValueHandler(coding);
      default:
        return singleValueHandler(coding);
    }
  };

  const singleValueHandler = (coding: Coding): void => {
    if (dispatch && path && onAnswerChange) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }
  };

  const multiValueHandler = (coding: Coding): void => {
    if (dispatch && onAnswerChange && path) {
      const isShown = shouldShowExtraChoice(answer);

      if (isShown && coding.code === OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState => onAnswerChange(newState, path, item, { valueString: '' }));
      }
    }
  };

  const renderTextField = (): JSX.Element => {
    return <TextField {...props} handleStringChange={handleStringChangeEvent} handleChange={handleStringChange} resources={resources} />;
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
      renderOpenField: (): JSX.Element | undefined => renderTextField(),
      ...props,
    };

    const componentMap = {
      [ItemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [ItemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} handleChange={handleCheckboxChange} />,
      [ItemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [ItemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };

  const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
  const options = getOptions(resources, item, containedResources);
  const aboveDropdownThreshold = isAboveDropdownThreshold(options);
  const itemControlValue = getItemControlValue(item);
  const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === ItemControlConstants.AUTOCOMPLETE;
  const value = getValue(item, answer);

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFValue(item, answer)}>
        {children}
      </TextView>
    );
  }
  if (!enable) {
    return null;
  }
  return (
    <>
      {hasOptionsAndNoCanonicalValueSet ? (
        itemControlValue ? (
          renderComponentBasedOnType()
        ) : aboveDropdownThreshold ? (
          <DropdownView
            options={options}
            handleChange={handleChange}
            selected={value}
            renderOpenField={(): JSX.Element => renderTextField()}
            {...props}
          />
        ) : (
          <RadioView
            options={options}
            handleChange={handleChange}
            selected={value}
            renderOpenField={(): JSX.Element => renderTextField()}
            {...props}
          />
        )
      ) : shouldRenderAutosuggest ? (
        <AutosuggestView
          handleChange={handleChange}
          clearCodingAnswer={clearCodingAnswer}
          handleStringChange={handleStringChange}
          {...props}
        />
      ) : null}
    </>
  );
};
export default OpenChoice;
