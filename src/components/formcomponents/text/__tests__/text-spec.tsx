import * as React from 'react';
import { mount } from 'enzyme';
import * as fs from 'fs';

import '../../../../util/defineFetch';
import { Text } from '../text';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../../types/fhir';

describe('text with inline extension', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

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
        shouldExpanderRenderChildrenWhenClosed={true}
      >
        {children}
      </Text>
    );
    expect(text.html()).toContain('<div>Tekst</div>');
  });

  it('should render highlight correct', () => {
    const item = JSON.parse(fs.readFileSync(__dirname + '/__data__/highlight-item.json').toString()) as QuestionnaireItem;

    const answer: QuestionnaireResponseItemAnswer = {} as QuestionnaireResponseItemAnswer;
    const text = mount(
      <Text
        item={item}
        answer={answer}
        path={[]}
        repeatButton={<div />}
        renderDeleteButton={() => {
          return undefined;
        }}
        id="item_highlight"
        validateScriptInjection
        renderHelpButton={() => <React.Fragment />}
        renderHelpElement={() => <React.Fragment />}
        onAnswerChange={() => {}}
        responseItem={{} as QuestionnaireResponseItem}
      />
    );
    expect(text.find('.page_refero__component_highlight').length).toBe(1);
  });
});
