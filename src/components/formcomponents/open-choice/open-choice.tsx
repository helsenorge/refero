import { FocusEvent, useCallback, useMemo } from 'react';

import { QuestionnaireResponseItemAnswer, Coding, QuestionnaireItem } from 'fhir/r4';
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
import { isDataReceiver } from '@/util';
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
import { useDispatch, useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { findQuestionnaireItem } from '@/reducers/selectors';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';

export type OpenChoiceProps = QuestionnaireComponentItemProps;

export const OpenChoice = (props: OpenChoiceProps): JSX.Element | null => {
  const { linkId, containedResources, path } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const answer = useGetAnswer(linkId, path);
  const itemControlValue = useMemo(() => getItemControlValue(item), [item]);
  const options = useMemo(() => getOptions(resources, item, containedResources), [resources, item, containedResources]);
  const getDataReceiverValue = useCallback((answerList: QuestionnaireResponseItemAnswer[]): string[] | undefined => {
    return answerList
      .filter(f => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map(el => el?.valueCoding?.display || el?.valueString)
      .filter((it): it is string => it !== undefined);
  }, []);

  const getOpenValue = useCallback(
    (answerList?: QuestionnaireResponseItemAnswer[] | QuestionnaireResponseItemAnswer): string | undefined => {
      if (Array.isArray(answerList)) {
        for (const el of answerList) {
          if (el.valueString) {
            return el.valueString;
          }
        }
      }
      return undefined;
    },
    []
  );
  const getValue = useCallback((): (string | undefined)[] | undefined => {
    if (Array.isArray(answer)) {
      return answer.map(el => el?.valueCoding?.code).filter(Boolean);
    } else if (answer?.valueCoding?.code) {
      if (answer.valueCoding.code === item?.initial?.[0]?.valueCoding?.code && !answer.valueCoding.display) {
        resetInitialAnswer(answer.valueCoding.code);
      }
      return [answer.valueCoding.code];
    }
    const initialSelectedOption = item?.answerOption?.find(x => x.initialSelected);
    if (initialSelectedOption?.valueCoding?.code) {
      return [initialSelectedOption.valueCoding.code];
    }
    if (item?.initial?.[0]?.valueCoding?.code) {
      return [String(item.initial[0].valueCoding.code)];
    }
    return undefined;
  }, [answer, item]);

  const value = useMemo(() => getValue(), [getValue]);

  const getPDFValue = useCallback((): string => {
    if (isDataReceiver(item) && Array.isArray(answer)) {
      return getDataReceiverValue(answer)?.join(', ') || '';
    }
    if (!value) {
      return resources?.ikkeBesvart || '';
    }

    const displayValues = value
      .filter(el => el !== OPEN_CHOICE_ID)
      .map(el => getDisplay(options, el!))
      .filter((it): it is string => it !== undefined);

    const openValue = getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  }, [answer, getDataReceiverValue, getOpenValue, isDataReceiver, item, options, resources, value]);

  const handleStringChange = useCallback(
    (value: string): void => {
      if (path && item) {
        if (value.length > 0) {
          dispatch(newCodingStringValueAsync(path, value, item)).then(newState => onAnswerChange?.(newState, item, { valueString: value }));
        } else {
          dispatch(removeCodingStringValueAsync(path, item)).then(newState => onAnswerChange?.(newState, item, { valueString: '' }));
        }
        promptLoginMessage?.();
      }
    },
    [dispatch, item, onAnswerChange, path, promptLoginMessage]
  );

  const handleStringChangeEvent = useCallback(
    (event: FocusEvent<HTMLInputElement>): void => {
      handleStringChange(event.target.value);
    },
    [handleStringChange]
  );

  const getAnswerValueCoding = useCallback(
    (code: string, systemArg?: string, displayArg?: string): Coding => {
      const display = displayArg || getDisplay(options, code);
      const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(item, code, containedResources);
      const system = systemArg || valueSetSystem;
      return { code, display, system };
    },
    [containedResources, item, options]
  );

  const resetInitialAnswer = useCallback(
    (code: string): void => {
      if (path) {
        const coding = getAnswerValueCoding(code);
        const responseAnswer = { valueCoding: coding };
        if (getIndexOfAnswer(code, answer) > -1 && item) {
          dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        }
        if (item) {
          dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        }
        promptLoginMessage?.();
      }
    },
    [answer, dispatch, getAnswerValueCoding, item, onAnswerChange, path, promptLoginMessage]
  );
  const singleValueHandler = useCallback(
    (coding: Coding): void => {
      if (path && coding.code !== OPEN_CHOICE_ID && item) {
        dispatch(removeCodingStringValueAsync(path, item)).then(newState => onAnswerChange?.(newState, item, { valueString: '' }));
      }
    },
    [dispatch, item, onAnswerChange, path]
  );

  const multiValueHandler = useCallback(
    (coding: Coding): void => {
      if (path) {
        const isShown = shouldShowExtraChoice(answer);
        if (isShown && coding.code === OPEN_CHOICE_ID && item) {
          dispatch(removeCodingStringValueAsync(path, item)).then(newState => onAnswerChange?.(newState, item, { valueString: '' }));
        }
      }
    },
    [answer, dispatch, item, onAnswerChange, path]
  );
  const interceptHandler = useCallback(
    (coding: Coding): void => {
      if (itemControlValue === ItemControlConstants.CHECKBOX) {
        multiValueHandler(coding);
      } else {
        singleValueHandler(coding);
      }
    },
    [itemControlValue, multiValueHandler, singleValueHandler]
  );
  const handleCheckboxChange = useCallback(
    (code?: string): void => {
      if (code && path && item) {
        const coding = getAnswerValueCoding(code);
        const responseAnswer = { valueCoding: coding };
        if (getIndexOfAnswer(code, answer) > -1) {
          dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        } else {
          dispatch(newCodingValueAsync(path, coding, item, true)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        }
        promptLoginMessage?.();
        interceptHandler(coding);
      }
    },
    [answer, dispatch, getAnswerValueCoding, interceptHandler, item, onAnswerChange, path, promptLoginMessage]
  );

  const clearCodingAnswer = useCallback(
    (coding: Coding): void => {
      if (path && item) {
        const responseAnswer = { valueCoding: coding };
        dispatch(removeCodingValueAsync(path, coding, item)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        promptLoginMessage?.();
      }
    },
    [dispatch, item, onAnswerChange, path, promptLoginMessage]
  );
  const handleChange = useCallback(
    (code?: string, systemArg?: string, displayArg?: string): void => {
      if (code && path && item) {
        const coding = getAnswerValueCoding(code, systemArg, displayArg);
        const responseAnswer = { valueCoding: coding };
        dispatch(newCodingValueAsync(path, coding, item)).then(newState => onAnswerChange?.(newState, item, responseAnswer));
        promptLoginMessage?.();
        interceptHandler(coding);
      }
    },
    [dispatch, getAnswerValueCoding, interceptHandler, item, onAnswerChange, path, promptLoginMessage]
  );

  const renderTextField = (): JSX.Element => {
    return <TextField {...props} handleStringChange={handleStringChangeEvent} handleChange={handleStringChange} />;
  };

  const hasOptionsAndNoCanonicalValueSet = useMemo(
    () => hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item),
    [resources, item, containedResources]
  );
  const aboveDropdownThreshold = useMemo(() => isAboveDropdownThreshold(options), [options]);

  const shouldRenderAutosuggest = useMemo(
    () => hasCanonicalValueSet(item) && itemControlValue === ItemControlConstants.AUTOCOMPLETE,
    [item, itemControlValue]
  );

  const renderComponentBasedOnType = (): JSX.Element | null => {
    if (!itemControlValue) {
      return null;
    }

    const commonProps = {
      handleChange: handleChange,
      selected: value,
      renderOpenField: renderTextField,
      ...props,
    };

    const pdfValue = getPDFValue();

    switch (itemControlValue) {
      case ItemControlConstants.DROPDOWN:
        return <DropdownView options={options} pdfValue={pdfValue} {...commonProps} />;
      case ItemControlConstants.CHECKBOX:
        return <CheckboxView options={options} pdfValue={pdfValue} {...commonProps} handleChange={handleCheckboxChange} />;
      case ItemControlConstants.RADIOBUTTON:
        return <RadioView options={options} pdfValue={pdfValue} {...commonProps} />;
      case ItemControlConstants.SLIDER:
        return <SliderView {...commonProps} />;
      default:
        return null;
    }
  };

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
            renderOpenField={renderTextField}
            pdfValue={getPDFValue()}
            {...props}
          />
        ) : (
          <RadioView
            options={options}
            handleChange={handleChange}
            selected={value}
            renderOpenField={renderTextField}
            pdfValue={getPDFValue()}
            {...props}
          />
        )
      ) : shouldRenderAutosuggest ? (
        <AutosuggestView
          handleChange={handleChange}
          clearCodingAnswer={clearCodingAnswer}
          handleStringChange={handleStringChange}
          pdfValue={getPDFValue()}
          {...props}
        />
      ) : null}
    </>
  );
};
export default OpenChoice;
