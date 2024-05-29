import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';

import '../../util/defineFetch';
import ChoiceRadioButtonDataModel from './__data__/scoring/choice-radio-button';
import ChoiceCheckBoxDataModel from './__data__/scoring/choice-check-box';
import OpenChoiceDataModel from './__data__/scoring/open-choice';
import SectionScoreDataModel from './__data__/scoring/section-score';
import FhirpathScoreDataModel from './__data__/scoring/fhirpath-score';
import CodeScoreDataModel from './__data__/scoring/code-scoring';
import { Questionnaire } from 'fhir/r4';
import rootReducer from '../../reducers';
import { Resources } from '../../util/resources';
import { ReferoContainer } from '..';
import { getCalculatedExpressionExtension } from '../../util/extension';
import { inputAnswer, selectRadioButtonOption, findQuestionnaireItem, findItem } from './utils';
import { renderWithRedux, screen, userEvent } from './test-utils/test-utils';

describe('Component renders and calculates score', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => {
      return {};
    });
  });

  it('fhirpath score should be updated when decimal questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='1').answer.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    inputAnswer('1', 42, container);

    const item = findItem('1', container);
    expect(item).toHaveValue(42);

    const fhirpathItem = await findByLabelText('Fhir sum element');

    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should be updated when integer questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='2').answer.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    inputAnswer('2', 42, container);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should be updated when quantity questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='3').answer.value.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    inputAnswer('3', 42, container);

    const item = findItem('3', container);
    expect(item).toHaveValue(42);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should handle complex queries and should be part of totalscore', async () => {
    const questionnaire = setFhirpath(
      '4',
      "QuestionnaireResponse.item.where(linkId='1').answer.value + QuestionnaireResponse.item.where(linkId='2').answer.value",
      FhirpathScoreDataModel
    );
    const { container, findByLabelText } = createWrapper(questionnaire);

    inputAnswer('1', 21, container);

    let item = findItem('1', container);
    expect(item).toHaveValue(21);

    inputAnswer('2', 21, container);

    item = findItem('2', container);
    expect(item).toHaveValue(21);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should update with blank score when answer is NaN', async () => {
    const questionnaire = setFhirpath('4', '0 / 0', FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    inputAnswer('1', 42, container);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(null);
  });

  it('fhirpath score should update with blank score when answer is infinite', async () => {
    const questionnaire = setFhirpath('4', '42 / 0', FhirpathScoreDataModel);
    const { container } = createWrapper(questionnaire);

    inputAnswer('1', 42, container);

    const fhirpathItem = findItem('4', container);
    expect(fhirpathItem).toHaveValue(null);
  });

  it('total score should be updated when options in choice item as radio-button is selected', async () => {
    const { findByLabelText, getByLabelText } = createWrapper(ChoiceRadioButtonDataModel);
    const sum = await findByLabelText('Sum');
    expect(sum).toHaveValue(null);

    userEvent.click(getByLabelText('Mer enn halvparten av dagene'));

    const sum2 = await findByLabelText('Sum');
    expect(sum2).toHaveValue(2);

    userEvent.click(getByLabelText('Noen dager'));

    const sum3 = await findByLabelText('Sum');
    expect(sum3).toHaveValue(1);
  });

  it('total score should be updated when options in choice item as check-box is selected', async () => {
    const { findByLabelText, getByLabelText } = createWrapper(ChoiceCheckBoxDataModel);
    const sum = await findByLabelText('Sum');

    expect(sum).toHaveValue(null);

    userEvent.click(getByLabelText('Mer enn halvparten av dagene'));

    const sum2 = await findByLabelText('Sum');
    expect(sum2).toHaveValue(2);
    userEvent.click(getByLabelText('Nesten hver dag'));

    const sum3 = await findByLabelText('Sum');
    expect(sum3).toHaveValue(3);

    userEvent.click(getByLabelText('Mer enn halvparten av dagene'));

    const sum4 = await findByLabelText('Sum');
    expect(sum4).toHaveValue(2);
  });

  it('total score should be updated when options in open-choice item is selected', async () => {
    const { findByLabelText, getByLabelText } = createWrapper(OpenChoiceDataModel);

    let sum = await findByLabelText('Sum');
    expect(sum).toHaveValue(null);

    userEvent.click(getByLabelText('Mer enn halvparten av dagene'));

    sum = await findByLabelText('Sum');
    expect(sum).toHaveValue(2);

    userEvent.click(getByLabelText('Nesten hver dag'));

    sum = await findByLabelText('Sum');
    expect(sum).toHaveValue(3);
  });

  it.skip('total score and section score should be updated', async () => {
    const { container, getByLabelText } = createWrapper(SectionScoreDataModel);

    let expectedScores = {
      totalscore_31: '',
      sectionscore_213: '',
      sectionscore_223: '',
      sectionscore_230: '',
    };
    expectScores(expectedScores, container);

    userEvent.click(getByLabelText('Noen dager'));

    expectedScores.totalscore_31 = '4';
    expectedScores.sectionscore_213 = '4';
    expectedScores.sectionscore_223 = '';
    expectedScores.sectionscore_230 = '';
    expectScores(expectedScores, container);

    selectCheckBoxOption('2.2.2', 'd', container);

    expectedScores.sectionscore_223 = '8';
    expectedScores.totalscore_31 = '12';
    expectScores(expectedScores, container);

    selectRadioButtonOption('2.3.2.2.1', 0, container);

    expectedScores.sectionscore_230 = '1';
    expectedScores.totalscore_31 = '13';
    expectScores(expectedScores, container);

    selectRadioButtonOption('2.3.1', 1, container);

    expectedScores.sectionscore_230 = '3';
    expectedScores.totalscore_31 = '15';
    expectScores(expectedScores, container);

    selectCheckBoxOption('2.3.2.1', 'a', container);
    selectCheckBoxOption('2.3.2.1', 'b', container);

    expectedScores.sectionscore_230 = '6';
    expectedScores.totalscore_31 = '18';
    expectScores(expectedScores, container);

    selectCheckBoxOption('2.1.2', 'd', container);

    expectedScores.sectionscore_213 = '12';
    expectedScores.totalscore_31 = '26';
    expectScores(expectedScores, container);
  });
});

describe('Code Scoring', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => {
      return {};
    });
  });

  it('Section scoring on decimal grouping with limit 2 digit in decimal. Round decimal to integer less than 5', async () => {
    const { findByLabelText, findByDisplayValue, findByText } = createWrapper(CodeScoreDataModel);

    const item = await findByLabelText('Decimal 1');
    userEvent.type(item, '42.451');
    let sum = await findByDisplayValue(42.451);
    expect(sum).toBeInTheDocument();

    const item2 = await findByLabelText('Decimal 2');
    userEvent.type(item2, '1.041');
    sum = await findByDisplayValue(1.041);
    expect(sum).toBeInTheDocument();
    sum = await findByText(43);
    expect(sum).toBeInTheDocument();
    sum = await findByText(43.49);
    expect(sum).toBeInTheDocument();
  });

  it('Section scoring on decimal grouping with limit 2 digit in decimal. Round decimal to integer more than 5', async () => {
    const { findByLabelText, findByDisplayValue, findByText } = createWrapper(CodeScoreDataModel);

    const item = await findByLabelText('Decimal 1');
    userEvent.type(item, '42.551');
    let sum = await findByDisplayValue(42.551);
    expect(sum).toBeInTheDocument();

    const item2 = await findByLabelText('Decimal 2');
    userEvent.type(item2, '1.041');
    sum = await findByDisplayValue(1.041);
    expect(sum).toBeInTheDocument();
    sum = await findByText(44);
    expect(sum).toBeInTheDocument();
    sum = await findByText(43.59);
    expect(sum).toBeInTheDocument();
  });

  it('Section scoring on integer grouping', async () => {
    const { findByLabelText, findByDisplayValue, findByText, findAllByDisplayValue } = createWrapper(CodeScoreDataModel);

    const item = await findByLabelText('Integer 1');
    userEvent.type(item, '42');
    let sum = await findByDisplayValue(42);
    expect(sum).toBeInTheDocument();

    const item2 = await findByLabelText('Integer 2');
    userEvent.type(item2, '2');
    const sum2 = await findAllByDisplayValue(2);
    expect(sum2[0]).toHaveValue(2);
    sum = await findByText(44);
    expect(sum).toBeInTheDocument();
  });

  it('Section scoring on quantity grouping', async () => {
    const { findByLabelText, findByDisplayValue, findByText } = createWrapper(CodeScoreDataModel);
    const item = await findByLabelText('Quantity (cm)');
    userEvent.type(item, '165.234');
    let sum = await findByDisplayValue(165.234);
    expect(sum).toBeInTheDocument();

    const item2 = await findByLabelText('Nytt quantityfelt med en egen enhet der man feks skal regne sammen to cm felt');
    userEvent.type(item2, '45.234');
    const sum2 = await findByDisplayValue(45.234);
    expect(sum2).toBeInTheDocument();
    const sectionScoreItem = await findByText('210.47 centimeter');
    expect(sectionScoreItem).toBeInTheDocument();
  });

  it('Section scoring on multiple choice grouping, with section scoring quantity extention kilo. Select one', async () => {
    const { getByLabelText, findByText } = createWrapper(CodeScoreDataModel);
    userEvent.click(getByLabelText('Svært medtatt, vansker med å ta til deg væske eller næring'));

    const sectionScoreItem = await findByText('50 kilo');
    expect(sectionScoreItem).toBeInTheDocument();
  });

  it('Section scoring on multiple choice grouping, with section scoring quantity extention kilo. Select multiple', async () => {
    const { findByLabelText, findByText } = createWrapper(CodeScoreDataModel);
    userEvent.click(await findByLabelText('Svært medtatt, vansker med å ta til deg væske eller næring'));
    userEvent.click(await findByLabelText('Petekkier (utslett som ikke lar seg avbleke)'));
    const sectionScoreItem = await findByText('50 kilo');
    expect(sectionScoreItem).toBeInTheDocument();
  });

  it.skip('Section scoring on multiple choice grouping, with section scoring quantity without extension. Select multiple', async () => {
    const { findByText } = createWrapper(CodeScoreDataModel);

    userEvent.click(await screen.findByLabelText('Astma'));
    userEvent.click(await screen.findByLabelText('Kols'));

    const sectionScoreItem = await findByText('50 score');
    expect(sectionScoreItem).toBeInTheDocument();
  });

  it('Total QS scoring', async () => {
    const { findByText } = createWrapper(CodeScoreDataModel);

    userEvent.click(await screen.findByLabelText('Astma'));
    userEvent.click(await screen.findByLabelText('Feber'));

    const sectionScoreItem = await findByText('35 score');
    expect(sectionScoreItem).toBeInTheDocument();
  });
});

function expectScores(scores: { [linkId: string]: string }, container: HTMLElement) {
  for (const linkId in scores) {
    const value = scores[linkId];
    const item = findItem(linkId, container);
    expect(item).toHaveValue(value);
  }
}

export function setFhirpath(linkId: string, expression: string, q: Questionnaire): Questionnaire {
  const newQuestionnaire = structuredClone(q);
  const item = findQuestionnaireItem(linkId, newQuestionnaire.item);
  if (item) {
    const extension = getCalculatedExpressionExtension(item);
    if (extension) {
      extension.valueString = expression;
    }
  }
  return newQuestionnaire;
}

function createWrapper(questionnaire: Questionnaire) {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  return renderWithRedux(
    <ReferoContainer
      loginButton={<React.Fragment />}
      authorized={true}
      onCancel={() => {}}
      onSave={() => {}}
      onSubmit={() => {}}
      resources={{} as Resources}
      questionnaire={questionnaire}
      onChange={() => {}}
    />,
    {
      store,
    }
  );
}
