import ChoiceRadioButtonDataModel from './__data__/scoring/choice-radio-button';
import ChoiceCheckBoxDataModel from './__data__/scoring/choice-check-box';
import OpenChoiceDataModel from './__data__/scoring/open-choice';
import SectionScoreDataModel from './__data__/scoring/section-score';
import FhirpathScoreDataModel from './__data__/scoring/fhirpath-score';
import { Questionnaire, QuestionnaireItem } from '../../types/fhir';
import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { Resources } from '../../util/resources';
import { SkjemautfyllerContainer } from '..';
import { getCalculatedExpressionExtension } from '../../util/extension';

describe('Component renders and calculates score', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
  });

  it('fhirpath score should be updated when decimal questions are answered', async () => {
    var model: Questionnaire = cloneQuestionnaire(FhirpathScoreDataModel);
    setFhirpath('4', "QuestionnaireResponse.item.where(linkId='1').answer.value", model);
    const wrapper = createWrapper(model);
    wrapper.render();

    await inputAnswer('1', 42, wrapper);

    let item = findItem('1', wrapper);
    expect(item.props().value).toBe('42');

    let fhirpathItem = findItem('4', wrapper);
    expect(fhirpathItem.props().value).toBe('42');
  });

  it('fhirpath score should be updated when integer questions are answered', async () => {
    var model: Questionnaire = cloneQuestionnaire(FhirpathScoreDataModel);
    setFhirpath('4', "QuestionnaireResponse.item.where(linkId='2').answer.value", model);
    const wrapper = createWrapper(model);
    wrapper.render();

    await inputAnswer('2', 42, wrapper);

    let item = findItem('2', wrapper);
    expect(item.props().value).toBe('42');

    let fhirpathItem = findItem('4', wrapper);
    expect(fhirpathItem.props().value).toBe('42');
  });

  it('fhirpath score should be updated when quantity questions are answered', async () => {
    var model: Questionnaire = cloneQuestionnaire(FhirpathScoreDataModel);
    setFhirpath('4', "QuestionnaireResponse.item.where(linkId='3').answer.value.value", model);
    const wrapper = createWrapper(model);
    wrapper.render();

    await inputAnswer('3', 42, wrapper);

    let item = findItem('3', wrapper);
    expect(item.props().value).toBe('42');

    let fhirpathItem = findItem('4', wrapper);
    expect(fhirpathItem.props().value).toBe('42');
  });

  it('fhirpath score should handle complex queries and should be part of totalscore', async () => {
    var model: Questionnaire = cloneQuestionnaire(FhirpathScoreDataModel);
    setFhirpath(
      '4',
      "QuestionnaireResponse.item.where(linkId='1').answer.value + QuestionnaireResponse.item.where(linkId='2').answer.value",
      model
    );
    const wrapper = createWrapper(model);
    wrapper.render();

    await inputAnswer('1', 21, wrapper);

    let item = findItem('1', wrapper);
    expect(item.props().value).toBe('21');

    await inputAnswer('2', 21, wrapper);

    item = findItem('2', wrapper);
    expect(item.props().value).toBe('21');

    let fhirpathItem = findItem('4', wrapper);
    expect(fhirpathItem.props().value).toBe('42');
  });

  it('total score should be updated when options in choice item as radio-button is selected', async () => {
    const wrapper = createWrapper(ChoiceRadioButtonDataModel);
    wrapper.render();

    let ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('');

    await selectRadioButtonOption('2.1', 2, wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('2');

    await selectRadioButtonOption('2.1', 1, wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('1');
  });

  it('total score should be updated when options in choice item as check-box is selected', async () => {
    const wrapper = createWrapper(ChoiceCheckBoxDataModel);
    wrapper.render();

    let ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('');

    await selectCheckBoxOption('2.1', 'c', wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('2');

    await selectCheckBoxOption('2.1', 'b', wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('3');

    await unSelectCheckBoxOption('2.1', 'c', wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('1');
  });

  it('total score should be updated when options in open-choice item is selected', async () => {
    const wrapper = createWrapper(OpenChoiceDataModel);
    wrapper.render();

    let ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('');

    await selectRadioButtonOption('2.1', 2, wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('2');

    await selectRadioButtonOption('2.1', 4, wrapper);

    ts = findItem('3.1', wrapper);
    expect(ts.props().value).toBe('');
  });

  it('total score and section score should be updated', async () => {
    const wrapper = createWrapper(SectionScoreDataModel);
    wrapper.render();

    let expectedScores = {
      totalscore_31: '',
      sectionscore_213: '',
      sectionscore_223: '',
      sectionscore_230: '',
    };
    expectScores(expectedScores, wrapper);

    await selectRadioButtonOption('2.1.1', 2, wrapper);

    expectedScores.totalscore_31 = '4';
    expectedScores.sectionscore_213 = '4';
    expectedScores.sectionscore_223 = '';
    expectedScores.sectionscore_230 = '';
    expectScores(expectedScores, wrapper);

    await selectCheckBoxOption('2.2.2', 'd', wrapper);

    expectedScores.sectionscore_223 = '8';
    expectedScores.totalscore_31 = '12';
    expectScores(expectedScores, wrapper);

    await selectRadioButtonOption('2.3.2.2.1', 0, wrapper);

    expectedScores.sectionscore_230 = '1';
    expectedScores.totalscore_31 = '13';
    expectScores(expectedScores, wrapper);

    await selectRadioButtonOption('2.3.1', 1, wrapper);

    expectedScores.sectionscore_230 = '3';
    expectedScores.totalscore_31 = '15';
    expectScores(expectedScores, wrapper);

    await selectCheckBoxOption('2.3.2.1', 'a', wrapper);
    await selectCheckBoxOption('2.3.2.1', 'b', wrapper);

    expectedScores.sectionscore_230 = '6';
    expectedScores.totalscore_31 = '18';
    expectScores(expectedScores, wrapper);

    await selectCheckBoxOption('2.1.2', 'd', wrapper);

    expectedScores.sectionscore_213 = '12';
    expectedScores.totalscore_31 = '26';
    expectScores(expectedScores, wrapper);
  });
});

function expectScores(scores: { [linkId: string]: string }, wrapper: ReactWrapper<{}, {}>) {
  for (let linkId in scores) {
    const value = scores[linkId];
    const item = findItem(linkId, wrapper);
    expect(item.props().value).toBe(value);
  }
}

async function inputAnswer(linkId: string, answer: number, wrapper: ReactWrapper<{}, {}>) {
  const id = 'item_' + linkId;
  const input = wrapper.find('input[id="' + id + '"]');
  act(() => {
    input.simulate('change', { target: { value: answer } });
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();

  act(() => {
    input.simulate('blur');
  });
  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

async function selectRadioButtonOption(linkId: string, index: number, wrapper: ReactWrapper<{}, {}>) {
  act(() => {
    const id = 'item_' + linkId + '-hn-' + index;
    const input = wrapper.find('input[id="' + id + '"]');
    input.simulate('click');
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

async function selectCheckBoxOption(linkId: string, index: string, wrapper: ReactWrapper<{}, {}>) {
  await changeCheckBoxOption(linkId, index, true, wrapper);
}

async function unSelectCheckBoxOption(linkId: string, index: string, wrapper: ReactWrapper<{}, {}>) {
  await changeCheckBoxOption(linkId, index, false, wrapper);
}

async function changeCheckBoxOption(linkId: string, index: string, on: boolean, wrapper: ReactWrapper<{}, {}>) {
  act(() => {
    const id = 'item_' + linkId + '-' + index;
    const input = wrapper.find('input[id="' + id + '"]');
    input.simulate('change', { target: { checked: on } });
  });

  await new Promise(r => {
    setTimeout(r);
  });
  wrapper.update();
}

function findItem(linkId: string, wrapper: ReactWrapper<{}, {}>) {
  const id = 'item_' + linkId;
  const input = wrapper.find('input[id="' + id + '"]');
  return input.at(0);
}

function findQuestionnaireItem(linkId: string, items: QuestionnaireItem[] | undefined): QuestionnaireItem | undefined {
  if (items === undefined) return;
  for (let item of items) {
    if (item.linkId === linkId) return item;

    const found = findQuestionnaireItem(linkId, item.item);
    if (found !== undefined) return found;
  }
}

function setFhirpath(linkId: string, expression: string, q: Questionnaire) {
  const item = findQuestionnaireItem(linkId, q.item);
  if (item) {
    var extension = getCalculatedExpressionExtension(item);
    if (extension) {
      extension.valueString = expression;
    }
  }
}

function cloneQuestionnaire(o: Questionnaire): Questionnaire {
  return JSON.parse(JSON.stringify(o));
}

function createWrapper(questionnaire: Questionnaire) {
  const store: any = createStore(rootReducer, applyMiddleware(thunk));
  return mount(
    <Provider store={store}>
      <SkjemautfyllerContainer
        loginButton={<React.Fragment />}
        store={store}
        authorized={true}
        onCancel={() => {}}
        onSave={() => {}}
        onSubmit={() => {}}
        resources={{} as Resources}
        questionnaire={questionnaire}
      />
    </Provider>
  );
}
