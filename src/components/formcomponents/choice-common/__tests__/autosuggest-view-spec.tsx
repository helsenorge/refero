import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { QuestionnaireItem, ValueSet } from 'fhir/r4';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../../../constants';
import { Resources } from '../../../../util/resources';
import AutosuggestView from '../autosuggest-view';
import { render, screen, fireEvent, waitFor, userEvent, renderRefero, act } from '../../../__tests__/test-utils/test-utils';
import { q } from './__data__/index';
import { generateQuestionnaireResponse } from '../../../../actions/generateQuestionnaireResponse';

jest.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));
const successReturnValueSet: ValueSet = {
  resourceType: 'ValueSet',
  status: 'draft',
  compose: {
    include: [
      {
        system: 'http://helsedirektoratet.no/ValueSet/legemiddeloppslag',
        concept: [
          {
            code: '1',
            display: 'Fyrstekake',
          },
        ],
      },
    ],
  },
};
describe('autosuggest-view', () => {
  it('skal kalle fetchValueSet når input endres', async () => {
    const fetchValueSetFn = jest.fn();
    const { getByLabelText } = renderRefero({ questionnaire: q, props: { fetchValueSet: fetchValueSetFn } });
    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    userEvent.type(getByLabelText('Mistenkt legemiddel'), 'test');

    await waitFor(() => expect(fetchValueSetFn).toHaveBeenCalled());
  });

  it('skal vise valg etter ValueSet er lastet', async () => {
    const fetchValueSetFn = (
      _searchString: string,
      _item: QuestionnaireItem,
      successCallback: (valueSet: ValueSet) => void,
      _errorCallback: (error: string) => void
    ) => {
      successCallback(successReturnValueSet);
    };
    const { getByLabelText, getByText } = renderRefero({ questionnaire: q, props: { fetchValueSet: fetchValueSetFn } });
    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    await act(async () => {
      userEvent.paste(getByLabelText('Mistenkt legemiddel'), 't');
    });
    expect(getByText('Fyrstekake')).toBeInTheDocument();
  });

  it('skal vise spesiell melding dersom listen over valg som lastes er tom', async () => {
    const fetchValueSetFn = (
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
    };
    const { getByLabelText, getByText } = renderRefero({ questionnaire: q, props: { fetchValueSet: fetchValueSetFn } });
    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    await act(async () => {
      userEvent.type(getByLabelText('Mistenkt legemiddel'), 't');
    });

    expect(getByText(/ Prøv med et annet ord eller sjekk for skrivefeil/i)).toBeInTheDocument();
  });

  it('skal fjerne spesiell melding dersom listen over valg som lastes er tom ved blur av feltet', async () => {
    const fetchValueSetFn = (
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
    };
    const { getByLabelText, queryByText } = renderRefero({ questionnaire: q, props: { fetchValueSet: fetchValueSetFn } });

    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    await act(async () => {
      userEvent.type(getByLabelText('Mistenkt legemiddel'), 't');
    });
    fireEvent.blur(getByLabelText('Mistenkt legemiddel'));

    expect(queryByText(/ Prøv med et annet ord eller sjekk for skrivefeil/i)).not.toBeInTheDocument();
  });

  it('skal kalle handleChange når bruker velger noe i listen', async () => {
    const onChange = jest.fn();
    const fetchValueSet = (
      _searchString: string,
      _item: QuestionnaireItem,
      successCallback: (valueSet: ValueSet) => void,
      _errorCallback: (error: string) => void
    ) => {
      successCallback(successReturnValueSet);
    };
    const { getByLabelText, getByText } = renderRefero({ questionnaire: q, props: { onChange, fetchValueSet } });

    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    await act(async () => {
      userEvent.type(getByLabelText('Mistenkt legemiddel'), 't');
    });
    fireEvent.click(getByText('Fyrstekake'));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('skal vise feilmelding dersom valg ikke kunne lastes', async () => {
    const fetchValueSet = (
      _searchString: string,
      _item: QuestionnaireItem,
      _successCallback: (valueSet: ValueSet) => void,
      errorCallback: (error: string) => void
    ) => {
      errorCallback('feil');
    };
    const { getByLabelText, getByText } = renderRefero({ questionnaire: q, props: { fetchValueSet } });

    expect(getByLabelText('Mistenkt legemiddel')).toBeInTheDocument();
    await act(async () => {
      userEvent.type(getByLabelText('Mistenkt legemiddel'), 't');
    });
    await waitFor(() => expect(getByText('Teknisk feil')).toBeInTheDocument());
  });

  //TODO: lager denne på nytt når vi skal teste validering
  it.skip('skal validere true dersom det finnes answer og feltet er required', async () => {
    render(
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

    const isValid = screen.getByRole('form').checkValidity();

    expect(isValid).toBeTruthy();
  });

  //TODO: lager denne på nytt når vi skal teste validering
  it.skip('skal validere false dersom det ikke finnes answer og feltet er required', async () => {
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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

    const isValid = screen.getByRole('form').checkValidity();

    expect(isValid).toBeFalsy();
  });

  //TODO: lager denne på nytt når vi skal teste validering
  it.skip('skal validere true dersom det ikke finnes answer og feltet ikke er required', async () => {
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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

    const isValid = screen.getByRole('form').checkValidity();

    expect(isValid).toBeTruthy();
  });

  it.skip('skal kalle handleStringChange med feltverdi når feltet mister fokus', async () => {
    const handleStringChangeFn = jest.fn();
    const handleChangeFn = jest.fn();
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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
        resources={{ openChoiceOption: 'annet' } as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );
    const elm = screen.getByRole('combobox')?.firstChild as ChildNode;
    expect(elm).toBeDefined();
    fireEvent.change(elm, { target: { value: 'test' } });

    fireEvent.blur(elm);

    expect(handleChangeFn).toHaveBeenCalledWith(OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL);
    expect(handleStringChangeFn).toHaveBeenCalledWith('test');
  });

  it.skip('skal kalle handleStringChange med tom verdi når feltet settes til tom string', async () => {
    const handleStringChangeFn = jest.fn();
    const clearCodingAnswerFn = jest.fn();
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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
        item={{
          linkId: 'test1',
          type: 'open-choice',
        }}
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );

    const elm = screen.getByRole('combobox')?.firstChild as ChildNode;
    expect(elm).toBeDefined();
    fireEvent.change(elm, { target: { value: 'test' } });
    fireEvent.change(elm, { target: { value: '' } });

    fireEvent.blur(elm);

    expect(clearCodingAnswerFn).toHaveBeenCalled();
    expect(handleStringChangeFn).toHaveBeenCalledWith('');
  });

  it.skip('skal kalle handleChange ved blur dersom en suggstion er highlighted', async () => {
    const handleChangeFn = jest.fn();
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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
            linkId: 'test1',
          } as QuestionnaireItem
        }
        resources={{} as Resources}
        renderDeleteButton={jest.fn()}
        repeatButton={<></>}
        renderHelpButton={jest.fn()}
        renderHelpElement={jest.fn()}
      />
    );
    const elm = screen.getByRole('combobox')?.firstChild;
    expect(elm).toBeDefined();
    fireEvent.change(elm as ChildNode, { target: { value: 'asd' }, newValue: 'test' });

    fireEvent.blur(elm as ChildNode, {
      target: { value: 'a', label: 'b' },
    });

    expect(handleChangeFn).toHaveBeenCalled();
  });

  it.skip('skal vise valgt verdi som allerede er satt i autosuggest når choice-komponenten lastes', async () => {
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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
      />
    );
    const element = screen.getByDisplayValue('Existing answer');
    expect(element).toBeDefined();
  });

  it.skip('skal vise valgt verdi som allerede er satt i autosuggest når open-choice-komponenten lastes', async () => {
    render(
      <AutosuggestView
        idWithLinkIdAndItemIndex="test1"
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
      />
    );
    const element = screen.getByDisplayValue('Typed value');
    expect(element).toBeDefined();
  });
});
