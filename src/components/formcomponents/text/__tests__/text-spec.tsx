import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { Text } from '../text';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../../types/fhir';
import * as fs from 'fs';
import { ExpandableSection } from '@helsenorge/toolkit/components/atoms/expandable-section';
import TextView from '../../textview';

describe('text with inline extension', () => {
  it('should render correct tag', () => {
    const item = JSON.parse(fs.readFileSync(__dirname + '/__data__/inline-item.json').toString()) as QuestionnaireItem;

    const answer: QuestionnaireResponseAnswer = {} as any;
    const children = <div>Tekst</div>;
    const text = mount(
      <Text
        item={item}
        answer={answer}
        path={[]}
        repeatButton={<div />}
        renderDeleteButton={() => {
          return undefined;
        }}
        id="item_1.1"
        validateScriptInjection
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        children={children}
      />
    );

    const expandableSection = text.find(ExpandableSection);
    expect(expandableSection.exists()).toBe(true);
    expect(expandableSection.html()).toContain('<div>Tekst</div>');
  });
});
