import * as React from 'react';
import { Collapse } from 'react-collapse';
import Autosuggest, { Suggestion } from '@helsenorge/toolkit/components/molecules/autosuggest';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { Spinner } from '@helsenorge/toolkit/components/atoms/spinner';
import MessageBox from '@helsenorge/toolkit/components/atoms/message-box';
import { debounce } from '@helsenorge/core-utils/debounce';

import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { ValueSet, QuestionnaireItem, Coding, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import { hasStringAnswer, hasCodingAnswer } from '../../../util/skjemautfyller-core';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../../constants';

interface AutosuggestProps {
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
  id?: string;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  children?: JSX.Element;

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

    this.state = {
      inputValue: '',
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
        noSuggestionsToShow: true,
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

  errorCallback(_error: string): void {
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

  onBlur(_e: React.FormEvent<{}>, { highlightedSuggestion }: { highlightedSuggestion: Suggestion | null }) {
    if (this.state.isDirty && highlightedSuggestion) {
      this.setState({
        lastSearchValue: highlightedSuggestion.label,
        isDirty: false,
      });
      this.props.handleChange(highlightedSuggestion.value, this.state.system, highlightedSuggestion.label);
    } else if (this.state.isDirty && !!this.props.handleStringChange) {
      this.setState({
        isDirty: false,
      });
      // det er bare open-choice som sender handleStringChange som prop. Bruker dette for å skille choice og open-choice
      const codingAnswer = this.getCodingAnswer();
      if (this.state.inputValue) {
        this.props.handleChange(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL);
        this.props.handleStringChange(this.state.inputValue);
      } else if (codingAnswer) {
        this.props.clearCodingAnswer(codingAnswer);
        this.props.handleStringChange('');
      }
    }
  }

  hasStringAnswer(): boolean {
    if (Array.isArray(this.props.answer)) {
      return this.props.answer.reduce((acc, x) => acc || hasStringAnswer(x), false);
    } else if (this.props.answer) {
      return hasStringAnswer(this.props.answer);
    }
    return false;
  }

  hasCodingAnswer(): boolean {
    if (Array.isArray(this.props.answer)) {
      return this.props.answer.reduce((acc, x) => acc || hasCodingAnswer(x), false);
    } else if (this.props.answer) {
      return hasCodingAnswer(this.props.answer);
    }
    return false;
  }

  getCodingAnswer(): Coding | undefined {
    const answer = Array.isArray(this.props.answer) ? this.props.answer[0] : this.props.answer;
    return answer ? answer.valueCoding : undefined;
  }

  render(): JSX.Element {
    let placeholder = getPlaceholder(this.props.item);
    if (!placeholder && this.props.resources) {
      placeholder = this.props.resources.selectDefaultPlaceholder;
    }

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_choice page_skjemautfyller__component_choice_autosuggest">
        <Collapse isOpened>
          <Validation {...this.props}>
            <Autosuggest
              id={getId(this.props.id)}
              label={
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${renderPrefix(this.props.item)} ${getText(this.props.item, this.props.onRenderMarkdown)}`,
                  }}
                />
              }
              className="page_skjemautfyller__autosuggest"
              type="search"
              isRequired={isRequired(this.props.item)}
              placeholder={placeholder}
              errorMessage={getValidationTextExtension(this.props.item)}
              helpButton={this.props.renderHelpButton()}
              helpElement={this.props.renderHelpElement()}
              suggestions={this.state.suggestions}
              onSuggestionsFetchRequested={this.debouncedOnSuggestionsFetchRequested}
              onSuggestionsClearRequested={() => {
                // vis samme resultatsett neste gang feltet får fokus
              }}
              onSubmitValidator={this.onSubmitValidator}
              onSuggestionSelected={this.onSuggestionSelected}
              onChange={this.onChangeInput}
              onBlur={this.onBlur}
              focusInputOnSuggestionClick={true}
              value={this.state.inputValue}
            />
          </Validation>
          {this.state.isLoading && (
            <div>
              <Spinner inline mini />
            </div>
          )}
          {this.state.noSuggestionsToShow && (
            <div className="page_skjemautfyller__no-suggestions">
              {this.props.resources?.autosuggestNoSuggestions?.replace('{0}', this.state.inputValue)}
            </div>
          )}
          {this.state.hasLoadError && <MessageBox type="error" title={this.props.resources?.autoSuggestLoadError} />}
          {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
          {this.props.repeatButton}
          {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
        </Collapse>
      </div>
    );
  }
}

export default AutosuggestView;
