import { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';

import { fireEvent, waitFor, userEvent, renderRefero, act, findByRole } from '../../../__tests__/test-utils/test-utils';
import { q } from './__data__/index';
import { generateQuestionnaireResponse } from '../../../../actions/generateQuestionnaireResponse';
import valueSet from '../../../../constants/valuesets';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../__tests__/test-utils/selectors';
import { addPropertyToQuestionnaireItem } from '../../../__tests__/test-utils/questionnairHelpers';
import { getResources } from '../../../../../preview/resources/referoResources';

jest.mock('@helsenorge/core-utils/debounce', () => ({
  debounce: (fn: Function) => fn,
}));
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', openChoiceOption: 'annet' };

const successReturnValueSet: ValueSet = {
  resourceType: 'ValueSet',
  status: 'draft',
  compose: {
    include: [
      {
        system: valueSet.LEGEMIDDELOPPSLAG_SYSTEM,
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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = renderRefero({ questionnaire: q });

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = renderRefero({ questionnaire: q });

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();
      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) userEvent.click(helpButton);

      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);

      const { getByTestId } = renderRefero({ questionnaire });
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', false);
      const { queryByTestId } = renderRefero({ questionnaire });
      const repeatButton = queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
        extension: q.extension?.map(y => {
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      const { queryAllByLabelText, queryByTestId } = renderRefero({ questionnaire });
      await clickButtonTimes(/-repeat-button/i, 3);
      expect(queryAllByLabelText(/Mistenkt legemiddel/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { getByTestId, queryAllByTestId } = renderRefero({ questionnaire });

      userEvent.click(getByTestId(/-repeat-button/i));
      userEvent.click(getByTestId(/-repeat-button/i));

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { queryByTestId } = renderRefero({ questionnaire });

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { getByTestId } = renderRefero({ questionnaire });

      userEvent.click(getByTestId(/-repeat-button/i));

      const deleteButton = getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();
      userEvent.click(deleteButton);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire = addPropertyToQuestionnaireItem(q, 'repeats', true);
      const { getByTestId, queryByTestId } = renderRefero({ questionnaire });

      userEvent.click(getByTestId(/-repeat-button/i));

      const deleteButton = getByTestId(/-delete-button/i);
      expect(deleteButton).toBeInTheDocument();

      userEvent.click(deleteButton);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire = addPropertyToQuestionnaireItem(q, 'required', true);
        const { getByText } = renderRefero({ questionnaire });
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire = addPropertyToQuestionnaireItem(q, 'required', true);
        const fetchValueSetFn = (
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback(successReturnValueSet);
        };
        const { getByLabelText, queryByText, getByText } = renderRefero({
          questionnaire,
          props: { fetchValueSet: fetchValueSetFn },
        });
        await act(async () => {
          userEvent.type(getByLabelText(/Mistenkt legemiddel/i), 'fyr');
        });
        await act(async () => {
          userEvent.click(getByText(/Fyrstekake/i));
        });

        await submitForm();
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      it('Should remove error on change if form is submitted', async () => {
        const fetchValueSetFn = (
          _searchString: string,
          _item: QuestionnaireItem,
          successCallback: (valueSet: ValueSet) => void,
          _errorCallback: (error: string) => void
        ) => {
          successCallback(successReturnValueSet);
        };
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText, queryByText, getByLabelText } = renderRefero({
          questionnaire,
          props: { fetchValueSet: fetchValueSetFn },
        });
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

        await act(async () => {
          await userEvent.type(getByLabelText(/Mistenkt legemiddel/i), 'fyr');
          await userEvent.click(getByText('Fyrstekake'));
        });
        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
    });
  });
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
  describe('onChange', () => {
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
      await act(async () => userEvent.click(getByText('Fyrstekake')));
      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueCoding: {
          code: '1',
          system: 'http://helsedirektoratet.no/ValueSet/legemiddeloppslag',
          display: 'Fyrstekake',
        },
      };
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
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

  it('skal vise valgt verdi som allerede er satt i autosuggest når choice-komponenten lastes', async () => {
    const questionnaire: Questionnaire = {
      ...q,
      item: q.item?.map(x => ({ ...x, type: 'choice' })),
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      ...generateQuestionnaireResponse(questionnaire),
      item: generateQuestionnaireResponse(questionnaire)?.item?.map(x => {
        if (x.linkId === 'af3cff52-5879-4db0-c671-1fb2bec90309') {
          return {
            ...x,
            answer: [
              {
                valueCoding: {
                  code: '1',
                  system: 'http://autosuggest.system',
                  display: 'Fyrstekake',
                },
              },
            ],
          };
        }
        return x;
      }),
    };
    const fetchValueSetFn = (
      _searchString: string,
      _item: QuestionnaireItem,
      successCallback: (valueSet: ValueSet) => void,
      _errorCallback: (error: string) => void
    ) => {
      successCallback(successReturnValueSet);
    };
    const { getByDisplayValue } = renderRefero({
      questionnaire,
      props: { fetchValueSet: fetchValueSetFn, questionnaireResponse },
    });
    waitFor(() => expect(getByDisplayValue('Fyrstekake')).toBeDefined());
  });

  it('skal vise valgt verdi som allerede er satt i autosuggest når open-choice-komponenten lastes', async () => {
    const questionnaire: Questionnaire = {
      ...q,
      item: q.item?.map(x => ({ ...x, type: 'open-choice' })),
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      ...generateQuestionnaireResponse(questionnaire),
      item: generateQuestionnaireResponse(questionnaire)?.item?.map(x => {
        if (x.linkId === 'af3cff52-5879-4db0-c671-1fb2bec90309') {
          return {
            ...x,
            answer: [
              {
                valueCoding: {
                  code: '1',
                  system: 'http://autosuggest.system',
                  display: 'Fyrstekake',
                },
              },
            ],
          };
        }
        return x;
      }),
    };
    const fetchValueSetFn = (
      _searchString: string,
      _item: QuestionnaireItem,
      successCallback: (valueSet: ValueSet) => void,
      _errorCallback: (error: string) => void
    ) => {
      successCallback(successReturnValueSet);
    };
    const { getByDisplayValue } = renderRefero({
      questionnaire,
      props: { fetchValueSet: fetchValueSetFn, questionnaireResponse },
    });
    waitFor(() => expect(getByDisplayValue('Fyrstekake')).toBeDefined());
  });
});
