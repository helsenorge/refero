import * as React from 'react';

import { shallow } from 'enzyme';

import { QuestionnaireItem, ValueSet } from '../../../../types/fhir';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import Autosuggest from '@helsenorge/autosuggest/components/autosuggest';

import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../../../constants';
import { Resources } from '../../../../util/resources';
import AutosuggestView from '../autosuggest-view';

describe('autosuggest-view', () => {
  it('skal vise loader mens valg lastes', () => {
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[]}
        autoSuggestProps={{ typingSearchDelay: 0, minSearchCharacters: 3 }}
        id="test1"
        item={
          {
            text: 'label',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );
    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(Loader).length).toBe(1);
  });

  it('skal kalle fetchValueSet når input endres', () => {
    const fetchValueSetFn = jest.fn();
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={fetchValueSetFn}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(fetchValueSetFn).toHaveBeenCalled();
  });

  it('skal vise valg etter ValueSet er lastet', () => {
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback({
            resourceType: 'ValueSet',
            status: 'draft',
            compose: {
              include: [
                {
                  system: 'http://kaker.namnam',
                  concept: [
                    {
                      code: '1',
                      display: 'Fyrstekake',
                    },
                  ],
                },
              ],
            },
          });
        }}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(Autosuggest).props().suggestions.length).toBe(1);
  });

  it('skal vise spesiell melding dersom listen over valg som lastes er tom', () => {
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback({
            resourceType: 'ValueSet',
            status: 'draft',
            compose: {
              include: [
                {
                  system: '',
                  concept: [],
                },
              ],
            },
          });
        }}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find('.page_refero__no-suggestions').length).toBe(1);
  });

  it('skal fjerne spesiell melding dersom listen over valg som lastes er tom ved blur av feltet', () => {
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback({
            resourceType: 'ValueSet',
            status: 'draft',
            compose: {
              include: [
                {
                  system: '',
                  concept: [],
                },
              ],
            },
          });
        }}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    // feil i react-autosuggest typings: highlightedSuggestion kan ikke være null, men i følge koden og dokumentasjonen kan den være null.
    //eslint-disable-next-line
    //@ts-ignore
    //eslint-disable-next-line
    wrapper.find(Autosuggest).props().onBlur!({} as React.FormEvent<HTMLInputElement>, { highlightedSuggestion: null });

    expect(wrapper.find('.page_refero__no-suggestions').length).toBe(0);
  });

  it('skal kalle handleChange når bruker velger noe i listen', () => {
    const handleChangeFn = jest.fn();
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={handleChangeFn}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback({
            resourceType: 'ValueSet',
            status: 'draft',
            compose: {
              include: [
                {
                  system: 'http://kaker.namnam',
                  concept: [
                    {
                      code: '1',
                      display: 'Fyrstekake',
                    },
                  ],
                },
              ],
            },
          });
        }}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    const selectedSuggestion = {
      suggestion: { label: 'Fyrstekake', value: '1' },
      suggestionValue: '',
      suggestionIndex: 0,
      sectionIndex: 0,
      method: 'click' as const,
    };
    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionSelected({} as React.FormEvent<HTMLInputElement>, selectedSuggestion);

    expect(handleChangeFn).toHaveBeenCalledWith('1', 'http://kaker.namnam', 'Fyrstekake');
  });

  it('skal vise feilmelding dersom valg ikke kunne lastes', () => {
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          _successCallback: (valueSet: ValueSet) => void,
          errorCallback: (error: string) => void
        ) => {
          errorCallback('feil');
        }}
        answer={[]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(NotificationPanel).length).toBe(1);
  });

  it('skal fjerne svar dersom det finnes når ValueSet lastes', () => {
    const clearCodingAnswerFn = jest.fn();
    jest.useFakeTimers();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={clearCodingAnswerFn}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback({
            resourceType: 'ValueSet',
            status: 'draft',
            compose: {
              include: [
                {
                  system: 'http://kaker.namnam',
                  concept: [
                    {
                      code: '1',
                      display: 'Fyrstekake',
                    },
                  ],
                },
              ],
            },
          });
        }}
        answer={[
          {
            valueCoding: {
              code: '1',
              system: 'http://autosuggest.system',
              display: 'Answer',
            },
          },
        ]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper.find(Autosuggest).props().onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(clearCodingAnswerFn).toHaveBeenCalled();
  });

  it('skal fjerne svar dersom verdien i input tømmes', () => {
    const clearCodingAnswerFn = jest.fn();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={clearCodingAnswerFn}
        fetchValueSet={jest.fn()}
        answer={[
          {
            valueCoding: {
              code: '1',
              system: 'http://autosuggest.system',
              display: 'Answer',
            },
          },
        ]}
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper
      .find(Autosuggest)
      .props()
      .onChange({} as React.FormEvent<HTMLInputElement>, { newValue: '', method: 'type' });

    expect(clearCodingAnswerFn).toHaveBeenCalled();
  });

  it('skal validere true dersom det finnes answer og feltet er required', () => {
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[
          {
            valueCoding: {
              code: '1',
              system: 'http://autosuggest.system',
              display: 'Answer',
            },
          },
        ]}
        item={
          {
            required: true,
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    expect(wrapper.find(Autosuggest).props().onSubmitValidator!()).toBeTruthy();
  });

  it('skal validere false dersom det ikke finnes answer og feltet er required', () => {
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[]}
        item={
          {
            required: true,
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    expect(wrapper.find(Autosuggest).props().onSubmitValidator!()).toBeFalsy();
  });

  it('skal validere true dersom det ikke finnes answer og feltet ikke er required', () => {
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[]}
        item={
          {
            required: false,
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    expect(wrapper.find(Autosuggest).props().onSubmitValidator!()).toBeTruthy();
  });

  it('skal kalle handleStringChange med feltverdi når feltet mister fokus', () => {
    const handleStringChangeFn = jest.fn();
    const handleChangeFn = jest.fn();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={handleChangeFn}
        handleStringChange={handleStringChangeFn}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          _successCallback: (valueSet: ValueSet) => void,
          errorCallback: (error: string) => void
        ) => {
          errorCallback('feil');
        }}
        answer={[]}
        item={
          {
            type: 'open-choice',
          } as QuestionnaireItem
        }
        resources={{openChoiceOption: 'annet'} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper
      .find(Autosuggest)
      .props()
      .onChange({} as React.FormEvent<HTMLInputElement>, { newValue: 'test', method: 'type' });

    // feil i react-autosuggest typings: highlightedSuggestion kan ikke være null, men i følge koden og dokumentasjonen kan den være null.
    //eslint-disable-next-line
    //@ts-ignore
    //eslint-disable-next-line
    wrapper.find(Autosuggest).props().onBlur!({} as React.FormEvent<HTMLInputElement>, { highlightedSuggestion: null });

    expect(handleChangeFn).toHaveBeenCalledWith(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL);
    expect(handleStringChangeFn).toHaveBeenCalledWith('test');
  });

  it('skal kalle handleStringChange med tom verdi når feltet settes til tom string', () => {
    const handleStringChangeFn = jest.fn();
    const clearCodingAnswerFn = jest.fn();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        handleStringChange={handleStringChangeFn}
        clearCodingAnswer={clearCodingAnswerFn}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          _successCallback: (valueSet: ValueSet) => void,
          errorCallback: (error: string) => void
        ) => {
          errorCallback('feil');
        }}
        answer={[
          {
            valueCoding: {
              code: OPEN_CHOICE_ID,
              system: OPEN_CHOICE_SYSTEM,
              display: OPEN_CHOICE_LABEL,
            },
          },
        ]}
        item={
          {
            type: 'open-choice',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper
      .find(Autosuggest)
      .props()
      .onChange({} as React.FormEvent<HTMLInputElement>, { newValue: '', method: 'type' });

    // feil i react-autosuggest typings: highlightedSuggestion kan ikke være null, men i følge koden og dokumentasjonen kan den være null.
    //eslint-disable-next-line
    //@ts-ignore
    //eslint-disable-next-line
    wrapper.find(Autosuggest).props().onBlur!({} as React.FormEvent<HTMLInputElement>, { highlightedSuggestion: null });

    expect(clearCodingAnswerFn).toHaveBeenCalled();
    expect(handleStringChangeFn).toHaveBeenCalledWith('');
  });

  it('skal kalle handleChange ved blur dersom en suggstion er highlighted', () => {
    const handleChangeFn = jest.fn();
    const wrapper = shallow(
      <AutosuggestView
        handleChange={handleChangeFn}
        handleStringChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={(
          _searchString: string,
          _item: QuestionnaireItem,
          _successCallback: (valueSet: ValueSet) => void,
          errorCallback: (error: string) => void
        ) => {
          errorCallback('feil');
        }}
        answer={[
          {
            valueCoding: {
              code: OPEN_CHOICE_ID,
              system: OPEN_CHOICE_SYSTEM,
              display: OPEN_CHOICE_LABEL,
            },
          },
        ]}
        item={
          {
            type: 'open-choice',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    wrapper
      .find(Autosuggest)
      .props()
      .onChange({} as React.FormEvent<HTMLInputElement>, { newValue: '', method: 'type' });

    wrapper.find(Autosuggest).props().onBlur!({} as React.FormEvent<HTMLInputElement>, {
      highlightedSuggestion: { value: 'a', label: 'b' },
    });

    expect(handleChangeFn).toHaveBeenCalled();
  });

  it('skal vise valgt verdi som allerede er satt i autosuggest når choice-komponenten lastes', () => {
    const options = {
      lifecycleExperimental: true,
      disableLifecycleMethods: false,
    };
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[
          {
            valueCoding: {
              code: '1',
              system: 'http://autosuggest.system',
              display: 'Existing answer',
            },
          },
        ]}
        item={
          {
            type: 'choice',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />,
      options
    );

    expect(wrapper.find(Autosuggest).props().value).toBe('Existing answer');
  });

  it('skal vise valgt verdi som allerede er satt i autosuggest når open-choice-komponenten lastes', () => {
    const options = {
      lifecycleExperimental: true,
      disableLifecycleMethods: false,
    };
    const wrapper = shallow(
      <AutosuggestView
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchValueSet={jest.fn()}
        answer={[
          {
            valueString: 'Typed value',
          },
          {
            valueCoding: {
              code: OPEN_CHOICE_ID,
              system: OPEN_CHOICE_SYSTEM,
              display: OPEN_CHOICE_LABEL,
            },
          },
        ]}
        item={
          {
            type: 'open-choice',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />,
      options
    );

    expect(wrapper.find(Autosuggest).props().value).toBe('Typed value');
  });
});
