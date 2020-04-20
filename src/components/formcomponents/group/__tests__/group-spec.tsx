import * as React from 'react';
import { shallow } from 'enzyme';
import { Group } from '../group';
import { QuestionnaireItem, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from '../../../../types/fhir';
import CustomTag from '@helsenorge/toolkit/utils/custom-tag';
import { RenderContextType } from '../../../../constants/renderContextType';
import { RenderContext } from '../../../../util/renderContext';

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
        renderContext={new RenderContext(RenderContextType.None)}
        responseItem={{} as QuestionnaireResponseItem}
      />
    );
    expect(group.find(CustomTag).html()).toMatchSnapshot();
  });
});
