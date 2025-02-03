/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { renderRefero, screen } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';
import { vi } from 'vitest';

import { EnhetType, OrgenhetHierarki } from '../../../../types/orgenhetHierarki';

import { q } from './__data__';
import { getResources } from '../../../../../preview/resources/referoResources';
import { selectDropdownOptionByName, submitForm } from '../../../../../test/selectors';

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

const resources = {
  ...getResources(''),
  adresseKomponent_velgHelseregion: 'Velg region',
  adresseKomponent_velgHelseforetak: 'Velg helseforetak',
  adresseKomponent_feilmelding: 'Du må velge en mottaker',
};

describe('ReceiverComponent', () => {
  it('Should call function to load receivers on mount', () => {
    const fetchReceivers = vi.fn();
    renderRefero({ questionnaire: q, props: { fetchReceivers }, resources: resources });

    expect(fetchReceivers).toHaveBeenCalled();
  });

  it('Should show error message if loading receivers call fails', async () => {
    const fetchReceiversFn = (_successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => {
      errorCallback();
    };
    renderRefero({ questionnaire: q, props: { fetchReceivers: fetchReceiversFn }, resources: resources });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('Should set selected receiver after load', async () => {
    const fetchReceiversFn = (successCallback: (receivers: OrgenhetHierarki[]) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    const onChange = vi.fn();
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers: fetchReceiversFn, onChange },
      resources: resources,
    });
    await selectDropdownOptionByName(resources.adresseKomponent_velgHelseregion, /region 1/i);
    await selectDropdownOptionByName(resources.adresseKomponent_velgHelseforetak, 'Receiver 1');

    expect(await screen.findByText(/Region 1 \/ Receiver 1/i)).toBeInTheDocument();
  });

  it('Should show selects after loading receivers', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers },
      resources: resources,
    });
    expect(await screen.findAllByRole('combobox')).toHaveLength(2);
  });
  it('Should show correct headers for select components after loading receivers', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers },
      resources: resources,
    });
    expect(screen.getByText('Velg region')).toBeInTheDocument();
    await selectDropdownOptionByName('Velg region', /region 1/i);
    expect(screen.getByText('Velg helseforetak')).toBeInTheDocument();
  });
  it('Should call clearCodingAnswer when dropdown value is changed to a non-leaf node', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    const onChange = vi.fn();
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: resources,
    });
    await selectDropdownOptionByName('Velg region', /region 1/i);

    await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);

    expect(screen.getByText(/Region 1 \/ Receiver 11/i)).toBeInTheDocument();

    await selectDropdownOptionByName('Velg region', /region 1/i);
    expect(screen.queryByText(/Region 1 \/ Receiver 11/i)).not.toBeInTheDocument();
  });

  it('Should call handleChange when a leaf node is selected', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    const onChange = vi.fn();
    renderRefero({
      questionnaire: q,
      props: { fetchReceivers, onChange },
      resources: resources,
    });
    await selectDropdownOptionByName('Velg region', /region 1/i);

    await selectDropdownOptionByName('Velg helseforetak', /Receiver 11/i);

    expect(onChange).toHaveBeenCalled();
  });

  it('readOnly value should get validation error if error exist', async () => {
    const fetchReceivers = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers as OrgenhetHierarki[]);
    };
    const onChange = vi.fn();

    const questionnaire: Questionnaire = {
      ...q,
      item: q.item?.map(x => ({
        ...x,
        readOnly: true,
        required: true,
        code: [
          {
            code: 'ValidateReadOnly',
            display: 'Valider skrivebeskyttet felt',
            system: 'http://helsenorge.no/fhir/CodeSystem/ValidationOptions',
          },
        ],
      })),
    };

    renderRefero({
      questionnaire: questionnaire,
      props: { fetchReceivers, onChange },
      resources: resources,
    });

    await submitForm();

    expect(screen.getByText(resources.adresseKomponent_feilmelding)).toBeInTheDocument();
  });
});
