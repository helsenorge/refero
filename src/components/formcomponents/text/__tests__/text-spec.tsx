import * as React from 'react';
import { mount } from 'enzyme';
import { Text } from '../text';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../../types/fhir';
import * as fs from 'fs';

describe('text with inline extension', () => {
  it('should render correct tag', () => {
    const item = JSON.parse(fs.readFileSync(__dirname + '/__data__/inline-item.json').toString()) as QuestionnaireItem;

    const answer: QuestionnaireResponseAnswer = {} as QuestionnaireResponseAnswer;
    const children = <div>{'Tekst'}</div>;
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
        onAnswerChange={() => {}}
      >
        {children}
      </Text>
    );
    expect(text.html()).toContain('<div>Tekst</div>');
  });
});
