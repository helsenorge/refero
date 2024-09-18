import { q } from './__data__';

import { EnhetType, OrgenhetHierarki } from '../../../../types/orgenhetHierarki';

import { renderRefero } from '@test/test-utils.tsx';
import { selectDropdownOptionByName } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';

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
  it('Should call function to load receivers on mount', () => {
    const fetchReceivers = vi.fn();
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
    const onChange = vi.fn();
    const { findByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers: fetchReceiversFn, onChange },
      resources: getResources(''),
    });
    await selectDropdownOptionByName('Velg helseregion', /region 1/i);
    await selectDropdownOptionByName('Velg helseforetak', 'Receiver 1');

    expect(await findByText(/Region 1 \/ Receiver 1/i)).toBeInTheDocument();
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
    const onChange = vi.fn();
    const { queryByText } = renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await selectDropdownOptionByName('Velg region', /region 1/i);

    await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);

    expect(queryByText(/Region 1 \/ Receiver 11/i)).toBeInTheDocument();

    await selectDropdownOptionByName('Velg region', /region 1/i);
    expect(queryByText(/Region 1 \/ Receiver 11/i)).not.toBeInTheDocument();
  });

  it('Should call handleChange when a leaf node is selected', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const onChange = vi.fn();
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: {
        ...getResources(''),
        adresseKomponent_velgHelseregion: 'Velg region',
        adresseKomponent_velgHelseforetak: 'Velg helseforetak',
      },
    });
    await selectDropdownOptionByName('Velg region', /region 1/i);

    await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);

    expect(onChange).toHaveBeenCalled();
  });
});
