import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { ValueSet, Coding } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Autosuggest, { Suggestion } from '@helsenorge/autosuggest/components/autosuggest';
import { debounce } from '@helsenorge/core-utils/debounce';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '@/constants';
import ItemType from '@/constants/itemType';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getId, getMaxLength, isReadOnly } from '@/util/index';
import { getStringAnswer, hasStringAnswer, getCodingAnswer } from '@/util/refero-core';

export type AutosuggestProps = QuestionnaireComponentItemProps & {
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
  handleStringChange?: (value: string) => void;
  pdfValue?: string | number;
};

const AutosuggestView = (props: AutosuggestProps): JSX.Element | null => {
  const {
    linkId,
    id,
    idWithLinkIdAndItemIndex,
    clearCodingAnswer,
    handleChange,
    handleStringChange,
    index,
    path,
    pdf,
    pdfValue,
    children,
  } = props;
  const { formState, getFieldState, register, setValue } = useFormContext<FieldValues>();
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const answer = useGetAnswer(linkId, path);
  const { fetchValueSet, autoSuggestProps, resources } = useExternalRenderContext();
  const codingAnswer = getCodingAnswer(answer);
  const initialInputValue =
    codingAnswer?.code === OPEN_CHOICE_ID && codingAnswer?.system === OPEN_CHOICE_SYSTEM ? getStringAnswer(answer) : codingAnswer?.display;

  const [inputValue, setInputValue] = useState(initialInputValue || '');
  const [lastSearchValue, setLastSearchValue] = useState('');
  const [system, setSystem] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [noSuggestionsToShow, setNoSuggestionsToShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useResetFormField(idWithLinkIdAndItemIndex, inputValue);
  useEffect(() => {
    if (initialInputValue) setInputValue(initialInputValue);
  }, [initialInputValue]);
  const isOpenChoice = (): boolean => {
    return item?.type === ItemType.OPENCHOICE;
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
    if (fetchValueSet && item) {
      setIsLoading(true);
      setSuggestions([]);
      setLastSearchValue(value);

      clearCodingAnswerIfExists();
      fetchValueSet(value, item, successCallback, errorCallback);
    }
  };

  const onChangeInput = (_event: FormEvent<HTMLElement>, { newValue }: { newValue: string; method: string }): void => {
    if (newValue === '') {
      clearCodingAnswerIfExists();
    }
    setValue(idWithLinkIdAndItemIndex, '', { shouldValidate: !!lastSearchValue });
    setInputValue(newValue);
    setIsDirty(true);
    setNoSuggestionsToShow(false);
    setHasLoadError(hasLoadError && !newValue);
  };

  const debouncedOnSuggestionsFetchRequested: ({ value }: { value: string }) => void = debounce(
    //@ts-expect-error - value is not a number
    onSuggestionsFetchRequested,
    autoSuggestProps?.typingSearchDelay || 500,
    false
  );

  const onSuggestionSelected = (_event: FormEvent<HTMLInputElement>, { suggestion }: { suggestion: Suggestion }): void => {
    setValue(idWithLinkIdAndItemIndex, suggestion.value, { shouldValidate: !!lastSearchValue });
    setLastSearchValue(suggestion.label);
    setIsDirty(false);

    handleChange(suggestion.value, system, suggestion.label);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onBlur = (_e: ChangeEvent<HTMLElement>, { highlightedSuggestion }: any | undefined): void => {
    if (isDirty && highlightedSuggestion) {
      setLastSearchValue(highlightedSuggestion.label);
      setIsDirty(false);
      setNoSuggestionsToShow(false);

      handleChange(highlightedSuggestion.value, system, highlightedSuggestion.label);

      setValue(idWithLinkIdAndItemIndex, highlightedSuggestion.value, { shouldValidate: !!lastSearchValue });
    } else if (isDirty && isOpenChoice() && handleStringChange) {
      setIsDirty(false);
      setNoSuggestionsToShow(false);

      const codingAnswer = getCodingAnswer(answer);

      if (inputValue) {
        handleChange(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, resources?.openChoiceOption);
        setValue(idWithLinkIdAndItemIndex, OPEN_CHOICE_ID, { shouldValidate: !!lastSearchValue });

        handleStringChange(inputValue);
      } else if (codingAnswer) {
        clearCodingAnswer(codingAnswer);
        handleStringChange('');
      }
    } else {
      setNoSuggestionsToShow(false);
    }
  };

  const maxCharacters = getMaxLength(item);
  const width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };
  const rest = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);
  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={codingAnswer}
        pdfValue={pdfValue}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_autosuggest">
      <FormGroup error={errorMessage} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-autosuggest-label`}
          testId={`${getId(id)}-label`}
          sublabelId={`${getId(id)}-sublabel`}
        />

        <Autosuggest
          inputProps={{
            ...rest,
            id: getId(id),
            width,
            onChange: (e: FormEvent<HTMLElement>, AutosuggestChangeEvent): void => {
              onChangeInput(e, AutosuggestChangeEvent);
            },
            value: inputValue,
            type: 'search',
            onBlur: (e: ChangeEvent<HTMLElement>, AutosuggestChangeEvent): void => {
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
            onSuggestionSelected(e, data);
          }}
          focusInputOnSuggestionClick={true}
        />

        {isLoading && (
          <div>
            <Loader size={'tiny'} color="black" />
          </div>
        )}
        {noSuggestionsToShow && (
          <div className="page_refero__no-suggestions">{resources?.autosuggestNoSuggestions?.replace('{0}', inputValue)}</div>
        )}
        {hasLoadError && <NotificationPanel variant="error">{resources?.autoSuggestLoadError}</NotificationPanel>}
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default AutosuggestView;
