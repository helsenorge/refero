import * as React from 'react';
import { mount } from 'enzyme';

import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
import SafeSelectField from '@helsenorge/toolkit/components/atoms/safe-select';
import { Spinner } from '@helsenorge/toolkit/components/atoms/spinner';

import ReceiverComponent from '../receiver-component';
import { NodeType, TreeNode } from '../../../../types/receiverTreeNode';
import { Resources } from '../../../../util/resources';

const receivers = [
  {
    nodeId: '1',
    endepunkt: null,
    navn: 'Region 1',
    type: NodeType.Region,
    barn: [
      { nodeId: '1.1', endepunkt: 'Endpoint/1', navn: 'Receiver 1', type: NodeType.Helseforetak, barn: [] },
      { nodeId: '1.2', endepunkt: 'Endpoint/11', navn: 'Receiver 11', type: NodeType.Helseforetak, barn: [] },
    ],
  },
  {
    nodeId: '2',
    endepunkt: null,
    navn: 'Region 1',
    type: NodeType.Region,
    barn: [{ nodeId: '2.1', endepunkt: 'Endpoint/2', navn: 'Receiver 2', type: NodeType.Helseforetak, barn: [] }],
  },
];

describe('ReceiverComponent', () => {
  it('Should show spinner while loading receivers', () => {
    const wrapper = mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={jest.fn()} />);

    expect(wrapper.find(Spinner).length).toBe(1);
  });
  it('Should call function to load receivers on mount', () => {
    const fetchReceiversFn = jest.fn();
    mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={fetchReceiversFn} />);

    expect(fetchReceiversFn).toHaveBeenCalled();
  });

  it('Should show error message if loading receivers call fails', () => {
    const fetchReceiversFn = (_successCallback: (receivers: Array<TreeNode>) => void, errorCallback: () => void) => {
      errorCallback();
    };
    const wrapper = mount(<ReceiverComponent handleChange={jest.fn()} clearCodingAnswer={jest.fn()} fetchReceivers={fetchReceiversFn} />);

    expect(wrapper.find(NotificationPanel).length).toBe(1);
  });

  it('Should set selected receiver after load', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<TreeNode>) => void) => {
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

  it('Should show selects after loading receivers', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<TreeNode>) => void) => {
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
    const fetchReceiversFn = (successCallback: (receivers: Array<TreeNode>) => void) => {
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

    expect(
      wrapper
        .find(SafeSelectField)
        .at(0)
        .props().label
    ).toBe('Velg region');
    expect(
      wrapper
        .find(SafeSelectField)
        .at(1)
        .props().label
    ).toBe('Velg helseforetak');
  });

  it('Should call clearCodingAnswer when dropdown value is changed to a non-leaf node', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<TreeNode>) => void) => {
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

    wrapper
      .find(SafeSelectField)
      .at(0)
      .props().onChange!({ target: { value: '2' } as unknown } as React.FormEvent<HTMLInputElement>, '2');

    expect(clearCodingAnswerFn).toHaveBeenCalled();
  });

  it('Should call handleChange when a leaf node is selected', () => {
    const fetchReceiversFn = (successCallback: (receivers: Array<TreeNode>) => void) => {
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

    wrapper
      .find(SafeSelectField)
      .at(1)
      .props().onChange!({ target: { value: '1.2' } as unknown } as React.FormEvent<HTMLInputElement>, '1.2');

    expect(handleChangeFn).toHaveBeenCalled();
  });
});
