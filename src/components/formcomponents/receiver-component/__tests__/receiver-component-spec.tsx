import { q } from './__data__';

import { EnhetType, OrgenhetHierarki } from '../../../../types/orgenhetHierarki';

import { renderRefero, userEvent } from '../../../__tests__/test-utils/test-utils';
import { getResources } from '../../../../preview/resources/referoResources';
import { generateQuestionnaireResponse } from '../../../../actions/generateQuestionnaireResponse';
import { act } from 'react-dom/test-utils';

const receivers = [
  {
    OrgenhetId: 1,
    EndepunktId: null,
    Navn: 'Region 1',
    EnhetType: EnhetType.Region,
    UnderOrgenheter: [
      { OrgenhetId: 11, EndepunktId: '1', Navn: 'Receiver 1', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
      { OrgenhetId: 12, EndepunktId: '11', Navn: 'Receiver 11', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
    ],
  },
  {
    OrgenhetId: 2,
    EndepunktId: null,
    Navn: 'Region 2',
    EnhetType: EnhetType.Region,
    UnderOrgenheter: [{ OrgenhetId: 21, EndepunktId: '2', Navn: 'Receiver 2', EnhetType: EnhetType.Foretak, UnderOrgenheter: null }],
  },
];

describe('ReceiverComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should call function to load receivers on mount', () => {
    const fetchReceivers = jest.fn();
    renderRefero({ questionnaire: q, props: { fetchReceivers }, resources: getResources('') });

    expect(fetchReceivers).toHaveBeenCalled();
  });

  it('Should show error message if loading receivers call fails', async () => {
    const fetchReceiversFn = (_successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => {
      errorCallback();
    };
    const { findByRole } = renderRefero({ questionnaire: q, props: { fetchReceivers: fetchReceiversFn }, resources: getResources('') });
    expect(await findByRole('alert')).toBeInTheDocument();
  });

  it('Should set selected receiver after load', async () => {
    const fetchReceiversFn = (successCallback: (receivers: OrgenhetHierarki[]) => void) => {
      successCallback(receivers);
    };
    const onChange = jest.fn();
    const { findByText, findByLabelText, findByRole } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers: fetchReceiversFn, onChange },
      resources: getResources(''),
    });
    const option = await findByRole('option', { name: /region 1/i });
    userEvent.selectOptions(await findByLabelText('Velg helseregion'), option);
    userEvent.selectOptions(await findByLabelText('Velg helseforetak'), 'Receiver 1');
    expect(await findByText(/Region 1 \/ Receiver 1/i)).toBeInTheDocument();
  });

  //TODO: Find out what this does, looks at loadSuccessCallback in receiver-component.tsx
  it.skip('Should not set selected receiver after load if multiple receivers match selected endpoint', async () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback([
        ...receivers,
        {
          OrgenhetId: 2,
          EndepunktId: '1',
          Navn: 'Region 3',
          EnhetType: EnhetType.Foretak,
          UnderOrgenheter: null,
        },
      ]);
    };
    const questionnaireResponse = generateQuestionnaireResponse(q);
    const { findByRole, findByLabelText, queryByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers: fetchReceiversFn, questionnaireResponse },
      resources: getResources(''),
    });

    const option = await findByRole('option', { name: /region 1/i });
    userEvent.selectOptions(await findByLabelText('Velg helseregion'), option);
    userEvent.selectOptions(await findByLabelText('Velg helseforetak'), 'Receiver 1');

    expect(queryByText(/Region 1 \/ Receiver 1/i)).not.toBeInTheDocument();
  });

  it('Should show selects after loading receivers', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const { findAllByRole } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers },
      resources: getResources(''),
    });
    expect(await findAllByRole('combobox')).toHaveLength(2);
  });
  it('Should show correct headers for select components after loading receivers', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const { queryByText, findByRole, findByLabelText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    expect(queryByText('Velg region')).toBeInTheDocument();
    const option = await findByRole('option', { name: /region 1/i });
    userEvent.selectOptions(await findByLabelText('Velg region'), option);
    expect(queryByText('Velg helseforetak')).toBeInTheDocument();
  });
  it('Should call clearCodingAnswer when dropdown value is changed to a non-leaf node', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const onChange = jest.fn();
    const { findByRole, findByLabelText, queryByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await act(async () => {
      const option = await findByRole('option', { name: /region 1/i });
      userEvent.selectOptions(await findByLabelText('Velg region'), option);
      const option2 = await findByRole('option', { name: /Receiver 11/i });
      userEvent.selectOptions(await findByLabelText('Velg helseforetak'), option2);
      expect(queryByText(/Region 1 \/ Receiver 11/i)).toBeInTheDocument();
      userEvent.selectOptions(await findByLabelText('Velg region'), option);
      expect(queryByText(/Region 1 \/ Receiver 11/i)).not.toBeInTheDocument();
    });
  });

  it('Should call handleChange when a leaf node is selected', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const onChange = jest.fn();
    const { findByRole, findByLabelText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await act(async () => {
      const option = await findByRole('option', { name: /region 1/i });
      userEvent.selectOptions(await findByLabelText('Velg region'), option);
      const option2 = await findByRole('option', { name: /Receiver 11/i });
      userEvent.selectOptions(await findByLabelText('Velg helseforetak'), option2);
    });

    expect(onChange).toHaveBeenCalled();
  });
});
