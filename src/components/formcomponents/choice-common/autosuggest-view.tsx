import * as React from 'react';

import { ValueSet, QuestionnaireItem, Questionnaire, Coding, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Autosuggest, { Suggestion } from '@helsenorge/autosuggest/components/autosuggest';
import { debounce } from '@helsenorge/core-utils/debounce';

import { OPEN_CHOICE_ID } from '../../../constants';
import { OPEN_CHOICE_SYSTEM } from '../../../constants/codingsystems';
import ItemType from '../../../constants/itemType';
import { isRequired, getId, getSublabelText } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import Label from '../label';
import SubLabel from '../sublabel';

interface AutosuggestViewProps {
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;

  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  path: Path[];
  handleStringChange?: (value: string) => void;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children: React.ReactNode;
}

const AutosuggestView = (props: AutosuggestViewProps): JSX.Element => {
  const getStringAnswer = (): string | undefined => {
    if (Array.isArray(props.answer)) {
      return props.answer.reduce((acc, x) => acc || x.valueString, undefined);
    } else if (props.answer) {
      return props.answer.valueString;
    }
  };

  const getCodingAnswer = (): Coding | undefined => {
    if (Array.isArray(props.answer)) {
      return props.answer.reduce((acc, x) => acc || x.valueCoding, undefined);
    } else if (props.answer) {
      return props.answer.valueCoding;
    }
    return undefined;
  };

  const hasStringAnswer = (): boolean => {
    return !!getStringAnswer();
  };

  const codingAnswer = getCodingAnswer();
  const initialInputValue =
    codingAnswer?.code === OPEN_CHOICE_ID && codingAnswer?.system === OPEN_CHOICE_SYSTEM ? getStringAnswer() : codingAnswer?.display;

  const [inputValue, setInputValue] = React.useState<string>(initialInputValue || '');
  const [lastSearchValue, setLastSearchValue] = React.useState<string>('');
  const [system, setSystem] = React.useState<string>('');
  const [suggestions, setSuggestions] = React.useState<Array<Suggestion>>([]);
  const [noSuggestionsToShow, setNoSuggestionsToShow] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasLoadError, setHasLoadError] = React.useState<boolean>(false);
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  const isOpenChoice = (): boolean => {
    return props.item.type === ItemType.OPENCHOICE;
  };

  const onSubmitValidator = (): boolean => {
    return isRequired(props.item) ? !!hasCodingAnswer() || !!hasStringAnswer() : true;
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
    const codingAnswer = getCodingAnswer();
    if (codingAnswer && !hasStringAnswer()) {
      props.clearCodingAnswer(codingAnswer);
    }
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }): void => {
    if (value.length < (props.autoSuggestProps?.minSearchCharacters || 0)) {
      setSuggestions([]);
      return;
    }
    if (value === lastSearchValue) {
      return;
    }

    if (props.fetchValueSet) {
      setIsLoading(true);
      setSuggestions([]);
      setLastSearchValue(value);
      clearCodingAnswerIfExists();
      props.fetchValueSet(value, props.item, successCallback, errorCallback);
    }
  };

  const onChangeInput = (_event: React.FormEvent<HTMLInputElement>, { newValue }: { newValue: string; method: string }): void => {
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
    props.autoSuggestProps?.typingSearchDelay || 500,
    false
  );

  const onSuggestionSelected = (_event: React.FormEvent<HTMLInputElement>, { suggestion }: { suggestion: Suggestion }): void => {
    setLastSearchValue(suggestion.label);
    setIsDirty(false);
    props.handleChange(suggestion.value, system, suggestion.label);
  };

  const onBlur = (_e: React.FormEvent, { highlightedSuggestion }: { highlightedSuggestion: Suggestion | null }): void => {
    if (isDirty && highlightedSuggestion) {
      setLastSearchValue(highlightedSuggestion.label);
      setIsDirty(false);
      setNoSuggestionsToShow(false);
      props.handleChange(highlightedSuggestion.value, system, highlightedSuggestion.label);
    } else if (isDirty && isOpenChoice() && props.handleStringChange) {
      setIsDirty(false);
      setNoSuggestionsToShow(false);

      const codingAnswer = getCodingAnswer();
      if (inputValue) {
        props.handleChange(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, props.resources?.openChoiceOption);
        props.handleStringChange(inputValue);
      } else if (codingAnswer) {
        props.clearCodingAnswer(codingAnswer);
        props.handleStringChange('');
      }
    } else {
      setNoSuggestionsToShow(false);
    }
  };

  const hasCodingAnswer = (): boolean => {
    return !!getCodingAnswer();
  };
  const formId = createFromIdFromPath(props.path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);

  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_autosuggest">
      <FormGroup mode="ongrey" error={error?.message}>
        <Autosuggest
          {...register(formId)}
          id={getId(props.id)}
          label={
            <Label
              item={props.item}
              onRenderMarkdown={props.onRenderMarkdown}
              questionnaire={props.questionnaire}
              resources={props.resources}
            />
          }
          subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
          className="page_refero__autosuggest"
          type="search"
          isRequired={isRequired(props.item)}
          errorMessage={error ? error.message : undefined}
          helpButton={props.renderHelpButton()}
          helpElement={props.renderHelpElement()}
          suggestions={suggestions}
          onSuggestionsFetchRequested={debouncedOnSuggestionsFetchRequested}
          onSuggestionsClearRequested={(): void => {
            // vis samme resultatsett neste gang feltet får fokus
          }}
          noCharacterValidation
          onSubmitValidator={onSubmitValidator}
          onSuggestionSelected={onSuggestionSelected}
          onBlur={onBlur}
          focusInputOnSuggestionClick={true}
          value={inputValue}
        />
        {isLoading && (
          <div>
            <Loader size={'tiny'} />
          </div>
        )}
        {noSuggestionsToShow && (
          <div className="page_refero__no-suggestions">{props.resources?.autosuggestNoSuggestions?.replace('{0}', inputValue)}</div>
        )}
        {hasLoadError && <NotificationPanel variant="alert">{props.resources?.autoSuggestLoadError}</NotificationPanel>}
        {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {props.repeatButton}
        {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
      </FormGroup>
    </div>
  );
};

export default AutosuggestView;
