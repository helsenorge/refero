import * as React from 'react';
import { shallow } from 'enzyme';
import { EmphasisBox } from '@helsenorge/toolkit/components/atoms/emphasisbox';
import Autosuggest from '@helsenorge/toolkit/components/molecules/autosuggest';
import { Spinner } from '@helsenorge/toolkit/components/atoms/spinner';

import AutosuggestView from '../autosuggest-view';
import { QuestionnaireItem, ValueSet } from '../../../../types/fhir';
import { Resources } from '../../../../util/resources';
import MessageBox from '@helsenorge/toolkit/components/atoms/message-box';

describe('autosuggest-view', () => {
  it('skal vise spinner mens valg lastes', () => {
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
    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(Spinner).length).toBe(1);
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

    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(fetchValueSetFn).toHaveBeenCalled();
  });

  it('skal vise valgt verdi dersom en verdi er valgt', () => {
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
        item={{} as QuestionnaireItem}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );
    expect(wrapper.find(EmphasisBox).length).toBe(1);
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

    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(Autosuggest).props().suggestions.length).toBe(1);
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

    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    const selectedSuggestion = {
      suggestion: { label: 'Fyrstekake', value: '1' },
      suggestionValue: '',
      suggestionIndex: 0,
      sectionIndex: 0,
      method: 'click' as 'click',
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

    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

    jest.runAllTimers();

    expect(wrapper.find(MessageBox).length).toBe(1);
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

    wrapper
      .find(Autosuggest)
      .props()
      .onSuggestionsFetchRequested({ value: 'test', reason: 'input-changed' });

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
});
