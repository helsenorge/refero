import * as React from 'react';
import { mount } from 'enzyme';
import * as fs from 'fs';

import '../../../../util/defineFetch';
import { Text } from '../text';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../../types/fhir';

describe('text with inline extension', () => {
  it('should render correct tag', () => {
    const item = JSON.parse(fs.readFileSync(__dirname + '/__data__/inline-item.json').toString()) as QuestionnaireItem;

    const answer: QuestionnaireResponseItemAnswer = {} as QuestionnaireResponseItemAnswer;
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
        responseItem={{} as QuestionnaireResponseItem}
      >
        {children}
      </Text>
    );
    expect(text.html()).toContain('<div>Tekst</div>');
  });
});
