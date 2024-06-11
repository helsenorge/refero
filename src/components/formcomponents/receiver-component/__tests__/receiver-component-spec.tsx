import { q } from './__data__';

import { EnhetType, OrgenhetHierarki } from '../../../../types/orgenhetHierarki';

import { act, renderRefero } from '../../../__tests__/test-utils/test-utils';
import { getResources } from '../../../../preview/resources/referoResources';
import { selectDropdownOptionByName } from '../../../__tests__/test-utils/selectors';

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
    const { findByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers: fetchReceiversFn, onChange },
      resources: getResources(''),
    });
    await selectDropdownOptionByName('Velg helseregion', /region 1/i);
    await selectDropdownOptionByName('Velg helseforetak', 'Receiver 1');

    expect(await findByText(/Region 1 \/ Receiver 1/i)).toBeInTheDocument();
  });

  // it.only('Should not set selected receiver after load if multiple receivers match selected endpoint', async () => {
  //   const onChange = createOnChangeFuncForActionRequester((actionRequester: IActionRequester) => {
  //     actionRequester.addChoiceAnswer('3a154799-1409-4ac7-8e56-27ea57f477a4', {
  //       code: '',
  //       system: '',
  //     });
  //   });
  //   const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
  //     successCallback([
  //       ...receivers,
  //       {
  //         OrgenhetId: 2,
  //         EndepunktId: '1',
  //         Navn: 'Region 3',
  //         EnhetType: EnhetType.Foretak,
  //         UnderOrgenheter: null,
  //       },
  //     ]);
  //   };
  //   const questionnaireResponse = generateQuestionnaireResponse(q);
  //   const { findByRole, findByLabelText, queryByText, debug } = renderRefero({
  //     questionnaire: q,
  //     props: { fetchReceivers: fetchReceiversFn, questionnaireResponse, onChange },
  //     resources: getResources(''),
  //   });
  //   debug();
  //   const option = await findByRole('option', { name: /region 1/i });
  //   userEvent.selectOptions(await findByLabelText('Velg helseregion'), option);
  //   userEvent.selectOptions(await findByLabelText('Velg helseforetak'), 'Receiver 1');

  //   expect(queryByText(/Region 1 \/ Receiver 1/i)).not.toBeInTheDocument();
  // });

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
    const { queryByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    expect(queryByText('Velg region')).toBeInTheDocument();
    await selectDropdownOptionByName('Velg region', /region 1/i);
    expect(queryByText('Velg helseforetak')).toBeInTheDocument();
  });
  it('Should call clearCodingAnswer when dropdown value is changed to a non-leaf node', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const onChange = jest.fn();
    const { queryByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await act(async () => {
      await selectDropdownOptionByName('Velg region', /region 1/i);

      await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);

      expect(queryByText(/Region 1 \/ Receiver 11/i)).toBeInTheDocument();

      await selectDropdownOptionByName('Velg region', /region 1/i);
      expect(queryByText(/Region 1 \/ Receiver 11/i)).not.toBeInTheDocument();
    });
  });

  it('Should call handleChange when a leaf node is selected', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const onChange = jest.fn();
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await act(async () => {
      await selectDropdownOptionByName('Velg region', /region 1/i);

      await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);
    });

    expect(onChange).toHaveBeenCalled();
  });
});
