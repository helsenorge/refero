import * as React from 'react';
import { shallow } from 'enzyme';
import { Group } from '../group';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../../types/fhir';
import CustomTag from '@helsenorge/toolkit/utils/custom-tag';

describe('group', () => {
  it('should render correct tag', () => {
    const item: QuestionnaireItem = {
      id: '2',
      linkId: '2.1',
      repeats: false,
      type: 'group',
      text: 'Overskrift',
    };
    const answer: QuestionnaireResponseAnswer = {} as QuestionnaireResponseAnswer;
    const group = shallow(
      <Group
        item={item}
        answer={answer}
        path={[]}
        headerTag={3}
        renderChildrenItems={() => {
          return undefined;
        }}
        repeatButton={<div />}
        renderDeleteButton={() => {
          return undefined;
        }}
        id="item_2"
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
      />
    );
    expect(group.find(CustomTag).html()).toMatchSnapshot();
  });
});
