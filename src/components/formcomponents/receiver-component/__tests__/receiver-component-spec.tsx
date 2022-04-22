import * as React from 'react';

import { mount } from 'enzyme';

import { EnhetType, OrgenhetHierarki } from '../../../../types/orgenhetHierarki';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import SafeSelectField from '@helsenorge/form/components/safe-select';

import { Resources } from '../../../../util/resources';
import ReceiverComponent from '../receiver-component';

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
    Navn: 'Region 1',
    EnhetType: EnhetType.Region,
    UnderOrgenheter: [{ OrgenhetId: 21, EndepunktId: '2', Navn: 'Receiver 2', EnhetType: EnhetType.Foretak, UnderOrgenheter: null }],
  },
];

describe('ReceiverComponent', () => {
  it('Should show Loader while loading receivers', () => {
    const wrapper = mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={jest.fn()} />);

    expect(wrapper.find(Loader).length).toBe(1);
  });
  it('Should call function to load receivers on mount', () => {
    const fetchReceiversFn = jest.fn();
    mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={fetchReceiversFn} />);

    expect(fetchReceiversFn).toHaveBeenCalled();
  });

  it('Should show error message if loading receivers call fails', () => {
    const fetchReceiversFn = (_successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => {
      errorCallback();
    };
    const wrapper = mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={fetchReceiversFn} />);

    expect(wrapper.find(NotificationPanel).length).toBe(1);
  });

  it('Should set selected receiver after load', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const wrapper = mount(
      <ReceiverComponent
        selected={['Endpoint/1']}
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchReceivers={fetchReceiversFn}
      />
    );

    expect(wrapper.find('strong').text()).toBe('Region 1 / Receiver 1');
  });

  it('Should not set selected receiver after load if multiple receivers match selected endpoint', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback([
        ...receivers,
        {
          OrgenhetId: 2,
          EndepunktId: '1',
          Navn: 'Region 1',
          EnhetType: EnhetType.Foretak,
          UnderOrgenheter: null,
        },
      ]);
    };
    const clearCodingAnswerFn = jest.fn();
    const wrapper = mount(
      <ReceiverComponent
        selected={['Endpoint/1']}
        handleChange={jest.fn()}
        clearCodingAnswer={clearCodingAnswerFn}
        fetchReceivers={fetchReceiversFn}
      />
    );

    expect(wrapper.find('strong').length).toBe(0);
    expect(clearCodingAnswerFn).toHaveBeenCalled();
  });

  it('Should show selects after loading receivers', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const wrapper = mount(
      <ReceiverComponent
        selected={['Endpoint/1']}
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchReceivers={fetchReceiversFn}
      />
    );

    expect(wrapper.find(SafeSelectField).length).toBe(2);
  });

  it('Should show correct headers for select components after loading receivers', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const wrapper = mount(
      <ReceiverComponent
        resources={
          {
            adresseKomponent_velgHelseregion: 'Velg region',
            adresseKomponent_velgHelseforetak: 'Velg helseforetak',
          } as Resources
        }
        selected={['Endpoint/1']}
        handleChange={jest.fn()}
        clearCodingAnswer={jest.fn()}
        fetchReceivers={fetchReceiversFn}
      />
    );

    expect(wrapper.find(SafeSelectField).at(0).props().label).toBe('Velg region');
    expect(wrapper.find(SafeSelectField).at(1).props().label).toBe('Velg helseforetak');
  });

  it('Should call clearCodingAnswer when dropdown value is changed to a non-leaf node', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const clearCodingAnswerFn = jest.fn();
    const wrapper = mount(
      <ReceiverComponent
        selected={['Endpoint/1']}
        handleChange={jest.fn()}
        clearCodingAnswer={clearCodingAnswerFn}
        fetchReceivers={fetchReceiversFn}
      />
    );

    wrapper.find(SafeSelectField).at(0).props().onChange!({ target: { value: '2' } as unknown } as React.FormEvent<HTMLInputElement>, '2');

    expect(clearCodingAnswerFn).toHaveBeenCalled();
  });

  it('Should call handleChange when a leaf node is selected', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void) => {
      successCallback(receivers);
    };
    const handleChangeFn = jest.fn();
    const wrapper = mount(
      <ReceiverComponent
        selected={['Endpoint/1']}
        handleChange={handleChangeFn}
        clearCodingAnswer={jest.fn()}
        fetchReceivers={fetchReceiversFn}
      />
    );

    wrapper.find(SafeSelectField).at(1).props().onChange!(
      { target: { value: '12' } as unknown } as React.FormEvent<HTMLInputElement>,
      '1.2'
    );

    expect(handleChangeFn).toHaveBeenCalled();
  });
});
