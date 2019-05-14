/* tslint:disable */
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
    const answer: QuestionnaireResponseAnswer = {} as any;
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
        helpElementIsVisible={false}
      />
    );
    expect(group.find(CustomTag)).toMatchSnapshot();
  });
});
/* tslint:enable */
