import * as React from 'react';
import { Collapse } from 'react-collapse';
import Autosuggest, { Suggestion } from '@helsenorge/toolkit/components/molecules/autosuggest';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { Spinner } from '@helsenorge/toolkit/components/atoms/spinner';
import MessageBox from '@helsenorge/toolkit/components/atoms/message-box';
import { EmphasisBox, colors } from '@helsenorge/toolkit/components/atoms/emphasisbox';
import { debounce } from '@helsenorge/core-utils/debounce';

import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { ValueSet, QuestionnaireItem, Coding, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { AutoSuggestProps } from '../../../types/autoSuggestProps';

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

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

interface AutosuggestState {
  inputValue: string;
  lastSearchValue: string;
  system: string;
  suggestions: Array<Suggestion>;
  isLoading: boolean;
  hasLoadError: boolean;
}

class AutosuggestView extends React.Component<AutosuggestProps, AutosuggestState> {
  constructor(props: AutosuggestProps) {
    super(props);

    this.state = {
      inputValue: '',
      lastSearchValue: '',
      system: '',
      suggestions: [],
      isLoading: false,
      hasLoadError: false,
    };

    this.debouncedOnSuggestionsFetchRequested = this.debouncedOnSuggestionsFetchRequested.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
    this.successCallback = this.successCallback.bind(this);
    this.onSubmitValidator = this.onSubmitValidator.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
  }

  onSubmitValidator(): boolean {
    return isRequired(this.props.item) ? !!this.getAnswer() : true;
  }

  onSuggestionSelected(_event: React.FormEvent<HTMLInputElement>, { suggestion }: { suggestion: Suggestion }): void {
    this.setState({
      lastSearchValue: suggestion.label,
    });
    this.props.handleChange(suggestion.value, this.state.system, suggestion.label);
  }

  successCallback(valueSet: ValueSet): void {
    if (!valueSet.compose || !valueSet.compose.include) {
      return;
    }
    const include = valueSet.compose.include;
    if (!include || include.length === 0 || !include[0].concept || !include[0].system) {
      return;
    }
    this.setState({
      isLoading: false,
      system: include[0].system || '',
      suggestions: include[0].concept?.map(x => {
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

  clearAnswerIfExists(): void {
    const hasExistingAnswer = this.getAnswer();
    if (hasExistingAnswer) {
      this.props.clearCodingAnswer(hasExistingAnswer);
    }
  }

  onSuggestionsFetchRequested({ value }: { value: string }): void {
    if (value.length < (this.props.autoSuggestProps?.minSearchCharacters || 0) || value === this.state.lastSearchValue) {
      return;
    }

    if (this.props.fetchValueSet) {
      this.setState({
        isLoading: true,
        suggestions: [],
        lastSearchValue: value,
      });
      this.clearAnswerIfExists();
      this.props.fetchValueSet(value, this.props.item, this.successCallback, this.errorCallback);
    }
  }

  onChangeInput(_event: React.FormEvent<HTMLInputElement>, { newValue }: { newValue: string; method: string }): void {
    if (newValue === '') {
      this.clearAnswerIfExists();
    }
    this.setState({
      inputValue: newValue,
      hasLoadError: this.state.hasLoadError && !newValue,
    });
  }

  debouncedOnSuggestionsFetchRequested: ({ value }: { value: string }) => void = debounce(
    this.onSuggestionsFetchRequested,
    this.props.autoSuggestProps?.typingSearchDelay || 500,
    false
  );

  getAnswer(): Coding | undefined {
    const answer = Array.isArray(this.props.answer) ? this.props.answer[0] : this.props.answer;
    return answer ? answer.valueCoding : undefined;
  }

  render(): JSX.Element {
    let placeholder = getPlaceholder(this.props.item);
    if (!placeholder && this.props.resources) {
      placeholder = this.props.resources.selectDefaultPlaceholder;
    }
    const answer = this.getAnswer();
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
              value={this.state.inputValue}
            />
          </Validation>
          {this.state.isLoading && (
            <div>
              <Spinner inline mini />
            </div>
          )}
          {answer && <EmphasisBox color={colors.Blue}>{`Valgt verdi: ${answer.display}`}</EmphasisBox>}
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
