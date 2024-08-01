import React from 'react';

import { ValueSet, QuestionnaireItem, Questionnaire, Coding } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { AutoSuggestProps } from '@/types/autoSuggestProps';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Autosuggest, { Suggestion } from '@helsenorge/autosuggest/components/autosuggest';
import { debounce } from '@helsenorge/core-utils/debounce';

import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '@/constants';
import ItemType from '@/constants/itemType';
import { isRequired, getId } from '@/util/index';
import { getStringAnswer, hasStringAnswer, getCodingAnswer } from '@/util/refero-core';
import { Resources } from '@/util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';

export interface AutosuggestProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;

  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  children?: React.ReactNode;
  handleStringChange?: (value: string) => void;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const AutosuggestView = ({
  control,
  resources,
  item,
  onRenderMarkdown,
  questionnaire,
  id,
  renderHelpButton,
  renderHelpElement,
  idWithLinkIdAndItemIndex,
  clearCodingAnswer,
  autoSuggestProps,
  fetchValueSet,
  handleChange,
  handleStringChange,
  renderDeleteButton,
  repeatButton,
  children,
  error,
  responseItem,
}: AutosuggestProps): JSX.Element | null => {
  const answer = useGetAnswer(responseItem) || [];
  const codingAnswer = getCodingAnswer(answer);
  const initialInputValue =
    codingAnswer?.code === OPEN_CHOICE_ID && codingAnswer?.system === OPEN_CHOICE_SYSTEM ? getStringAnswer(answer) : codingAnswer?.display;

  const [inputValue, setInputValue] = React.useState(initialInputValue || '');
  const [lastSearchValue, setLastSearchValue] = React.useState('');
  const [system, setSystem] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [noSuggestionsToShow, setNoSuggestionsToShow] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  const isOpenChoice = (): boolean => {
    return item.type === ItemType.OPENCHOICE;
  };

  const successCallback = (valueSet: ValueSet): void => {
    if (
      !valueSet.compose ||
      !valueSet.compose.include ||
      valueSet.compose.include.length === 0 ||
      !valueSet.compose.include[0].concept ||
      !valueSet.compose.include[0].system
    ) {
      setIsLoading(false);
      setNoSuggestionsToShow(!isOpenChoice());
      setSuggestions([]);

      return;
    }
    setIsLoading(false);
    setSystem(valueSet.compose.include[0].system || '');
    setSuggestions(
      valueSet.compose.include[0].concept.map(x => {
        return { label: x.display || '', value: x.code };
      })
    );
  };

  const errorCallback = (): void => {
    setIsLoading(false);
    setHasLoadError(true);
  };

  const clearCodingAnswerIfExists = (): void => {
    const codingAnswer = getCodingAnswer(answer);
    const stringAnswer = hasStringAnswer(answer);
    if (codingAnswer && !stringAnswer) {
      clearCodingAnswer(codingAnswer);
    }
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }): void => {
    if (value.length < (autoSuggestProps?.minSearchCharacters || 0)) {
      setSuggestions([]);

      return;
    }
    if (value === lastSearchValue) {
      return;
    }
    if (fetchValueSet) {
      setIsLoading(true);
      setSuggestions([]);
      setLastSearchValue(value);

      clearCodingAnswerIfExists();
      fetchValueSet(value, item, successCallback, errorCallback);
    }
  };

  const onChangeInput = (_event: React.FormEvent<HTMLElement>, { newValue }: { newValue: string; method: string }): void => {
    if (newValue === '') {
      clearCodingAnswerIfExists();
    }
    setInputValue(newValue);
    setIsDirty(true);
    setNoSuggestionsToShow(false);
    setHasLoadError(hasLoadError && !newValue);
  };

  const debouncedOnSuggestionsFetchRequested: ({ value }: { value: string }) => void = debounce(
    onSuggestionsFetchRequested,
    autoSuggestProps?.typingSearchDelay || 500,
    false
  );

  const onSuggestionSelected = (_event: React.FormEvent<HTMLInputElement>, { suggestion }: { suggestion: Suggestion }): void => {
    setLastSearchValue(suggestion.label);
    setIsDirty(false);

    handleChange(suggestion.value, system, suggestion.label);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onBlur = (_e: React.ChangeEvent<HTMLElement>, { highlightedSuggestion }: any | undefined): void => {
    if (isDirty && highlightedSuggestion) {
      setLastSearchValue(highlightedSuggestion.label);
      setIsDirty(false);
      setNoSuggestionsToShow(false);

      handleChange(highlightedSuggestion.value, system, highlightedSuggestion.label);
    } else if (isDirty && isOpenChoice() && handleStringChange) {
      setIsDirty(false);
      setNoSuggestionsToShow(false);

      const codingAnswer = getCodingAnswer(answer);

      if (inputValue) {
        handleChange(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, resources?.openChoiceOption);
        handleStringChange(inputValue);
      } else if (codingAnswer) {
        clearCodingAnswer(codingAnswer);
        handleStringChange('');
      }
    } else {
      setNoSuggestionsToShow(false);
    }
  };

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_autosuggest">
      <FormGroup error={error?.message}>
        {renderHelpElement()}

        <ReferoLabel
          item={item}
          onRenderMarkdown={onRenderMarkdown}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-autosuggest-label`}
          testId={`${getId(id)}-label`}
          sublabelId={`${getId(id)}-sublabel`}
          renderHelpButton={renderHelpButton}
        />
        <Controller
          name={idWithLinkIdAndItemIndex}
          control={control}
          shouldUnregister={true}
          defaultValue={inputValue}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
            },
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Autosuggest
              inputProps={{
                ...rest,
                id: getId(id),
                onChange: (e: React.FormEvent<HTMLElement>, AutosuggestChangeEvent): void => {
                  onChange('');
                  onChangeInput(e, AutosuggestChangeEvent);
                },
                value: inputValue,
                type: 'search',
                onBlur: (e: React.ChangeEvent<HTMLElement>, AutosuggestChangeEvent): void => {
                  onBlur(e, AutosuggestChangeEvent);
                },
              }}
              className="page_refero__autosuggest"
              suggestions={suggestions}
              onSuggestionsFetchRequested={debouncedOnSuggestionsFetchRequested}
              onSuggestionsClearRequested={(): void => {
                // vis samme resultatsett neste gang feltet får fokus
              }}
              renderSuggestion={(suggestion: Suggestion): JSX.Element => <div>{suggestion.label}</div>}
              onSuggestionSelected={(e, data): void => {
                onChange([data.suggestion.value]);
                onSuggestionSelected(e, data);
              }}
              focusInputOnSuggestionClick={true}
            />
          )}
        />

        {isLoading && (
          <div>
            <Loader size={'tiny'} />
          </div>
        )}
        {noSuggestionsToShow && (
          <div className="page_refero__no-suggestions">{resources?.autosuggestNoSuggestions?.replace('{0}', inputValue)}</div>
        )}
        {hasLoadError && <NotificationPanel variant="alert">{resources?.autoSuggestLoadError}</NotificationPanel>}
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default ReactHookFormHoc(AutosuggestView);
