import * as React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import '../../util/defineFetch';
import DataModel from './__data__/common/';
import { Questionnaire, Extension } from '../../types/fhir';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '..';
import ExtensionConstants from '../../constants/extensions';
import { PresentationButtonsType } from '../../constants/presentationButtonsType';

describe('component respects sdf-presentationbuttons', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('questionnaire without presentationbuttons default to sticky, when sticky is set to true', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);

    const wrapper = createWrapper(model, true);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire without presentationbuttons default to non-sticky, when sticky is set to false', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);

    const wrapper = createWrapper(model, false);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire without presentationbuttons default to non-sticky, when sticky is not set', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);

    const wrapper = createWrapper(model);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is true', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.None);

    const wrapper = createWrapper(model, true);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('hidden_buttons'));
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is false', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.None);

    const wrapper = createWrapper(model, false);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('hidden_buttons'));
    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is not set', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.None);

    const wrapper = createWrapper(model);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('hidden_buttons'));
    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is true', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Static);

    const wrapper = createWrapper(model, true);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is false', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Static);

    const wrapper = createWrapper(model, false);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is not set', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Static);

    const wrapper = createWrapper(model);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).not.toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is true', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Sticky);

    const wrapper = createWrapper(model, true);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is false', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Sticky);

    const wrapper = createWrapper(model, false);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('sticky'));
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is not set', () => {
    var model: Questionnaire = cloneQuestionnaire(DataModel);
    setPresentationButtons(model, PresentationButtonsType.Sticky);

    const wrapper = createWrapper(model);
    wrapper.render();

    expect(wrapper.find('.page_refero__content').props().className).toEqual(expect.stringContaining('sticky'));
  });
});

function setPresentationButtons(q: Questionnaire, presenttationType: PresentationButtonsType) {
  if (!q.extension) {
    q.extension = [];
  }

  const extension = {
    url: ExtensionConstants.PRESENTATION_BUTTONS,
    valueCoding: {
      system: 'http://helsenorge.no/fhir/ValueSet/presentationbuttons',
      code: presenttationType.toLowerCase(),
      display: presenttationType,
    },
  } as Extension;

  q.extension.push(extension);
}

function cloneQuestionnaire(o: Questionnaire): Questionnaire {
  return JSON.parse(JSON.stringify(o));
}

function createWrapper(questionnaire: Questionnaire, sticky?: boolean) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <ReferoContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaire}
        sticky={sticky}
      />
    </Provider>
  );
}
