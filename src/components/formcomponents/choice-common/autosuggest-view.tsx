import * as React from 'react';

import { ValueSet, QuestionnaireItem, Questionnaire, Coding, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Autosuggest, { Suggestion } from '@helsenorge/autosuggest/components/autosuggest';
import { debounce } from '@helsenorge/core-utils/debounce';

import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '../../../constants';
import ItemType from '../../../constants/itemType';
import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';

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
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;

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

interface AutosuggestState {
  inputValue: string;
  lastSearchValue: string;
  system: string;
  suggestions: Array<Suggestion>;
  noSuggestionsToShow: boolean;
  isLoading: boolean;
  hasLoadError: boolean;
  isDirty: boolean;
}

class AutosuggestView extends React.Component<AutosuggestProps, AutosuggestState> {
  constructor(props: AutosuggestProps) {
    super(props);

    const codingAnswer = this.getCodingAnswer();
    const initialInputValue =
      codingAnswer?.code === OPEN_CHOICE_ID && codingAnswer?.system === OPEN_CHOICE_SYSTEM ? this.getStringAnswer() : codingAnswer?.display;

    this.state = {
      inputValue: initialInputValue || '',
      lastSearchValue: '',
      system: '',
      suggestions: [],
      noSuggestionsToShow: false,
      isLoading: false,
      hasLoadError: false,
      isDirty: false,
    };

    this.debouncedOnSuggestionsFetchRequested = this.debouncedOnSuggestionsFetchRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
    this.successCallback = this.successCallback.bind(this);
    this.onSubmitValidator = this.onSubmitValidator.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  isOpenChoice(): boolean {
    return this.props.item.type === ItemType.OPENCHOICE;
  }

  onSubmitValidator(): boolean {
    return isRequired(this.props.item) ? !!this.hasCodingAnswer() || !!this.hasStringAnswer() : true;
  }

  successCallback(valueSet: ValueSet): void {
    if (
      !valueSet.compose ||
      !valueSet.compose.include ||
      valueSet.compose.include.length === 0 ||
      !valueSet.compose.include[0].concept ||
      !valueSet.compose.include[0].system
    ) {
      this.setState({
        isLoading: false,
        noSuggestionsToShow: !this.isOpenChoice(),
        suggestions: [],
      });
      return;
    }

    this.setState({
      isLoading: false,
      system: valueSet.compose.include[0].system || '',
      suggestions: valueSet.compose.include[0].concept.map(x => {
        return { label: x.display || '', value: x.code };
      }),
    });
  }

  errorCallback(): void {
    this.setState({
      isLoading: false,
      hasLoadError: true,
    });
  }

  clearCodingAnswerIfExists(): void {
    const codingAnswer = this.getCodingAnswer();
    const hasStringAnswer = this.hasStringAnswer();
    if (codingAnswer && !hasStringAnswer) {
      this.props.clearCodingAnswer(codingAnswer);
    }
  }

  onSuggestionsFetchRequested({ value }: { value: string }): void {
    if (value.length < (this.props.autoSuggestProps?.minSearchCharacters || 0)) {
      this.setState({
        suggestions: [],
      });
      return;
    }
    if (value === this.state.lastSearchValue) {
      return;
    }

    if (this.props.fetchValueSet) {
      this.setState({
        isLoading: true,
        suggestions: [],
        lastSearchValue: value,
      });
      this.clearCodingAnswerIfExists();
      this.props.fetchValueSet(value, this.props.item, this.successCallback, this.errorCallback);
    }
  }

  onChangeInput(_event: React.FormEvent<HTMLInputElement>, { newValue }: { newValue: string; method: string }): void {
    if (newValue === '') {
      this.clearCodingAnswerIfExists();
    }
    this.setState({
      inputValue: newValue,
      isDirty: true,
      noSuggestionsToShow: false,
      hasLoadError: this.state.hasLoadError && !newValue,
    });
  }

  debouncedOnSuggestionsFetchRequested: ({ value }: { value: string }) => void = debounce(
    this.onSuggestionsFetchRequested,
    this.props.autoSuggestProps?.typingSearchDelay || 500,
    false
  );

  onSuggestionSelected(_event: React.FormEvent<HTMLInputElement>, { suggestion }: { suggestion: Suggestion }): void {
    this.setState({
      lastSearchValue: suggestion.label,
      isDirty: false,
    });
    this.props.handleChange(suggestion.value, this.state.system, suggestion.label);
  }

  onBlur(_e: React.ChangeEvent<HTMLInputElement>, { highlightedSuggestion }: { highlightedSuggestion: Suggestion | null }): void {
    if (this.state.isDirty && highlightedSuggestion) {
      this.setState({
        lastSearchValue: highlightedSuggestion.label,
        isDirty: false,
        noSuggestionsToShow: false,
      });
      this.props.handleChange(highlightedSuggestion.value, this.state.system, highlightedSuggestion.label);
    } else if (this.state.isDirty && this.isOpenChoice() && this.props.handleStringChange) {
      this.setState({
        isDirty: false,
        noSuggestionsToShow: false,
      });

      const codingAnswer = this.getCodingAnswer();
      if (this.state.inputValue) {
        this.props.handleChange(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, this.props.resources?.openChoiceOption);
        this.props.handleStringChange(this.state.inputValue);
      } else if (codingAnswer) {
        this.props.clearCodingAnswer(codingAnswer);
        this.props.handleStringChange('');
      }
    } else {
      this.setState({
        noSuggestionsToShow: false,
      });
    }
  }

  hasStringAnswer(): boolean {
    return !!this.getStringAnswer();
  }

  hasCodingAnswer(): boolean {
    return !!this.getCodingAnswer();
  }

  getCodingAnswer(): Coding | undefined {
    if (Array.isArray(this.props.answer)) {
      return this.props.answer.reduce((acc, x) => acc || x.valueCoding, undefined);
    } else if (this.props.answer) {
      return this.props.answer.valueCoding;
    }
    return undefined;
  }

  getStringAnswer(): string | undefined {
    if (Array.isArray(this.props.answer)) {
      return this.props.answer.reduce((acc, x) => acc || x.valueString, undefined);
    } else if (this.props.answer) {
      return this.props.answer.valueString;
    }
  }

  render(): JSX.Element {
    const { control, resources, item, onRenderMarkdown, questionnaire, id, renderHelpButton, renderHelpElement, idWithLinkIdAndItemIndex } =
      this.props;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    return (
      <div className="page_refero__component page_refero__component_choice page_refero__component_choice_autosuggest">
        <Controller
          name={idWithLinkIdAndItemIndex}
          control={control}
          shouldUnregister={true}
          rules={{
            required: {
              value: isRequired(item),
              message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
            },
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Autosuggest
              {...rest}
              id={getId(id)}
              label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
              subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
              className="page_refero__autosuggest"
              type="search"
              isRequired={isRequired(item)}
              errorMessage={getValidationTextExtension(item)}
              helpButton={renderHelpButton()}
              helpElement={renderHelpElement()}
              suggestions={this.state.suggestions}
              onSuggestionsFetchRequested={this.debouncedOnSuggestionsFetchRequested}
              onSuggestionsClearRequested={(): void => {
                // vis samme resultatsett neste gang feltet får fokus
              }}
              noCharacterValidation
              onSubmitValidator={this.onSubmitValidator}
              onSuggestionSelected={this.onSuggestionSelected}
              onChange={(e: React.ChangeEvent<HTMLInputElement>, AutosuggestChangeEvent): void => {
                this.onChangeInput(e, AutosuggestChangeEvent);
                onChange(AutosuggestChangeEvent.newValue);
              }}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>, AutosuggestChangeEvent): void => {
                this.onBlur(e, AutosuggestChangeEvent);
                onChange(AutosuggestChangeEvent.highlightedSuggestion.value);
              }}
              focusInputOnSuggestionClick={true}
              value={this.state.inputValue}
            />
          )}
        />
        {this.state.isLoading && (
          <div>
            <Loader size={'tiny'} />
          </div>
        )}
        {this.state.noSuggestionsToShow && (
          <div className="page_refero__no-suggestions">
            {this.props.resources?.autosuggestNoSuggestions?.replace('{0}', this.state.inputValue)}
          </div>
        )}
        {this.state.hasLoadError && <NotificationPanel variant="alert">{this.props.resources?.autoSuggestLoadError}</NotificationPanel>}
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

export default ReactHookFormHoc(AutosuggestView);
