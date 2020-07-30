import * as React from 'react';
import { mount } from 'enzyme';

import '../../../../util/defineFetch';
import { String } from '../string';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../../types/fhir';

describe('string', () => {
  describe('When input has html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med <html>';
    it('Should render with validation', () => {
      const wrapper = getStringWrapperWithChangedValue(validateScriptInjection, value);

      expect(wrapper.html()).toContain('&lt;html&gt; er ikke tillatt');
    });
  });

  describe('When input does not have html and validateScriptInjection = true', () => {
    const validateScriptInjection = true;
    const value = 'input med uten html';
    it('Should render without validation', () => {
      const wrapper = getStringWrapperWithChangedValue(validateScriptInjection, value);

      expect(wrapper.html()).not.toContain('er ikke tillatt');
    });
  });

  describe('When input has html and validateScriptInjection = false', () => {
    const validateScriptInjection = false;
    const value = 'input med <html>';
    it('Should render with validation', () => {
      const wrapper = getStringWrapperWithChangedValue(validateScriptInjection, value);

      expect(wrapper.html()).not.toContain('er ikke tillatt');
    });
  });
});

function getStringWrapperWithChangedValue(validateScriptInjection: boolean, value: string) {
  const item: QuestionnaireItem = {
    id: '2',
    linkId: '2.1',
    repeats: false,
    type: 'string',
    text: 'Uten html',
  };
  const wrapper = mount(
    <String
      item={item}
      answer={{} as QuestionnaireResponseItemAnswer}
      path={[]}
      id="item_2"
      oneToTwoColumn
      validateScriptInjection={validateScriptInjection}
      repeatButton={<div />}
      renderDeleteButton={() => {
        return undefined;
      }}
      visibleDeleteButton
      renderHelpButton={() => <React.Fragment />}
      renderHelpElement={() => <React.Fragment />}
      onAnswerChange={() => {}}
      responseItem={{} as QuestionnaireResponseItem}
    />
  );
  wrapper.update();
  const input = wrapper.find('input');
  input.simulate('change', { target: { value } });
  input.simulate('blur');
  wrapper.update();
  return wrapper;
}
