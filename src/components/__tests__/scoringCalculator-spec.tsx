import ChoiceRadioButtonDataModel from './__data__/scoringCalculator/choice-radio-button';
import ChoiceCheckBoxDataModel from './__data__/scoringCalculator/choice-check-box';
import OpenChoiceDataModel from './__data__/scoringCalculator/open-choice';
import SectionScoreDataModel from './__data__/scoringCalculator/section-score';
import { Questionnaire } from '../../types/fhir';
import * as React from 'react';
import rootReducer from '../../reducers';
import { createStore, applyMiddleware } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import { Resources } from '../../util/resources';
import { SkjemautfyllerContainer } from '..';

describe('Component renders and calculates score', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(_ => {
      return {};
    });
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
