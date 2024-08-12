import '../../util/__tests__/defineFetch';
import ChoiceRadioButtonDataModel from './__data__/scoring/choice-radio-button';
import ChoiceCheckBoxDataModel from './__data__/scoring/choice-check-box';
import OpenChoiceDataModel from './__data__/scoring/open-choice';
import SectionScoreDataModel from './__data__/scoring/section-score';
import FhirpathScoreDataModel from './__data__/scoring/fhirpath-score';
import CodeScoreDataModel from './__data__/scoring/code-scoring';
import { Questionnaire } from 'fhir/r4';
import { getCalculatedExpressionExtension } from '../../util/extension';
import { inputAnswer, findQuestionnaireItem, findItem } from './utils';
import { renderRefero } from '../../../test/test-utils';
import { clickByLabelText, clickByTestId, typeByLabelText } from '../../../test/selectors';
import { performance } from 'perf_hooks';

describe('Component renders and calculates score', () => {
  it('fhirpath score should be updated when decimal questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='1').answer.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    await inputAnswer('1', 42, container);

    const item = findItem('1', container);
    expect(item).toHaveValue(42);

    const fhirpathItem = await findByLabelText('Fhir sum element');

    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should be updated when integer questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='2').answer.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    await inputAnswer('2', 42, container);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(42);
  });
  it.skip('fhirpath score should be updated when integer questions are answered - should work with zeros', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='2').answer.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    await inputAnswer('2', 0, container);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(0);
  });
  it('fhirpath score should be updated when quantity questions are answered', async () => {
    const questionnaire = setFhirpath('4', "QuestionnaireResponse.item.where(linkId='3').answer.value.value", FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    await inputAnswer('3', 42, container);

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

    await inputAnswer('1', 21, container);

    let item = findItem('1', container);
    expect(item).toHaveValue(21);

    await inputAnswer('2', 21, container);

    item = findItem('2', container);
    expect(item).toHaveValue(21);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(42);
  });

  it('fhirpath score should update with blank score when answer is NaN', async () => {
    const questionnaire = setFhirpath('4', '0 / 0', FhirpathScoreDataModel);
    const { container, findByLabelText } = createWrapper(questionnaire);

    await inputAnswer('1', 42, container);

    const fhirpathItem = await findByLabelText('Fhir sum element');
    expect(fhirpathItem).toHaveValue(null);
  });

  it('fhirpath score should update with blank score when answer is infinite', async () => {
    const questionnaire = setFhirpath('4', '42 / 0', FhirpathScoreDataModel);
    const { container } = createWrapper(questionnaire);

    await inputAnswer('1', 42, container);

    const fhirpathItem = findItem('4', container);
    expect(fhirpathItem).toHaveValue(null);
  });

  it('total score should be updated when options in choice item as radio-button is selected', async () => {
    const { getByLabelText } = createWrapper(ChoiceRadioButtonDataModel);
    const sum = getByLabelText('Sum');
    expect(sum).toHaveValue(null);

    await clickByLabelText('Mer enn halvparten av dagene');
    const sum2 = getByLabelText('Sum');
    expect(sum2).toHaveValue(2);

    await clickByLabelText('Noen dager');
    const sum3 = getByLabelText('Sum');
    expect(sum3).toHaveValue(1);
  });

  it('total score should be updated when options in choice item as check-box is selected', async () => {
    const { getByLabelText } = createWrapper(ChoiceCheckBoxDataModel);

    const sum = getByLabelText('Sum');
    expect(sum).toHaveValue(null);

    await clickByLabelText('Mer enn halvparten av dagene');
    const sum2 = getByLabelText('Sum');
    expect(sum2).toHaveValue(2);

    await clickByLabelText('Nesten hver dag');
    const sum3 = getByLabelText('Sum');
    expect(sum3).toHaveValue(5);

    await clickByLabelText('Mer enn halvparten av dagene');
    const sum4 = getByLabelText('Sum');
    expect(sum4).toHaveValue(3);
  });

  it('total score should be updated when options in open-choice item is selected', async () => {
    const { getByLabelText } = createWrapper(OpenChoiceDataModel);

    const sum = getByLabelText('Sum');
    expect(sum).toHaveValue(null);

    await clickByLabelText('Mer enn halvparten av dagene');
    const sum2 = getByLabelText('Sum');
    expect(sum2).toHaveValue(2);

    await clickByLabelText('Nesten hver dag');
    const sum3 = getByLabelText('Sum');
    expect(sum3).toHaveValue(3);
  });
  function expectScores(scores: { [linkId: string]: number | null }, container: HTMLElement) {
    for (const linkId in scores) {
      const value = scores[linkId];
      const item = findItem(linkId, container);
      expect(item).toHaveValue(value);
    }
  }
  it('total score and section score should be updated', async () => {
    const { container } = createWrapper(SectionScoreDataModel);
    const startScoreCalculation = performance.now();
    const expectedScores: { [linkId: string]: number | null } = {
      totalscore_31: null,
      sectionscore_213: null,
      sectionscore_223: null,
      sectionscore_230: null,
    };
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.1.1-2-radio-choice-label/i);
    expectedScores.totalscore_31 = 4;
    expectedScores.sectionscore_213 = 4;
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.2.2-3-checkbox-choice-label/i);
    expectedScores.sectionscore_223 = 8;
    expectedScores.totalscore_31 = 12;
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.3.2.2.1-0-radio-choice-label/i);
    expectedScores.sectionscore_230 = 1;
    expectedScores.totalscore_31 = 13;
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.3.1-1-radio-choice-label/i);
    expectedScores.sectionscore_230 = 3;
    expectedScores.totalscore_31 = 15;
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.3.2.1-0-checkbox-choice-label/i);
    await clickByTestId(/item_2.3.2.1-1-checkbox-choice-label/i);
    expectedScores.sectionscore_230 = 6;
    expectedScores.totalscore_31 = 18;
    expectScores(expectedScores, container);

    await clickByTestId(/item_2.1.2-3-checkbox-choice-label/i);
    expectedScores.sectionscore_213 = 12;
    expectedScores.totalscore_31 = 26;
    expectScores(expectedScores, container);

    const endScoreCalculation = performance.now();
    const scoreCalculationDuration = endScoreCalculation - startScoreCalculation;
    console.log(`Score calculation took ${scoreCalculationDuration} ms`);
    expect(scoreCalculationDuration).toBeLessThan(2000);
  });
});

describe('Code Scoring', () => {
  it('Section scoring on decimal grouping with limit 2 digit in decimal. Round decimal to integer less than 5', async () => {
    const { getByDisplayValue, getByText } = createWrapper(CodeScoreDataModel);

    await typeByLabelText('Decimal 1', '42.451', false);

    const sum1 = getByDisplayValue(42.451);
    expect(sum1).toBeInTheDocument();

    await typeByLabelText('Decimal 2', '1.041', false);

    const sum2 = getByDisplayValue(1.041);
    expect(sum2).toBeInTheDocument();

    const sum3 = getByText(43);
    expect(sum3).toBeInTheDocument();

    const sum4 = getByText(43.49);
    expect(sum4).toBeInTheDocument();
  });

  it('Section scoring on decimal grouping with limit 2 digit in decimal. Round decimal to integer more than 5', async () => {
    const { getByDisplayValue, getByText } = createWrapper(CodeScoreDataModel);

    await typeByLabelText('Decimal 1', '42.551', false);
    let sum = getByDisplayValue(42.551);
    expect(sum).toBeInTheDocument();

    await typeByLabelText('Decimal 2', '1.041', false);

    const sum2 = getByDisplayValue(1.041);
    expect(sum2).toBeInTheDocument();

    const sum3 = getByText(44);
    expect(sum3).toBeInTheDocument();

    const sum4 = getByText(43.59);
    expect(sum4).toBeInTheDocument();
  });

  it('Section scoring on integer grouping', async () => {
    const { getByDisplayValue, getByText, getAllByDisplayValue } = createWrapper(CodeScoreDataModel);

    await typeByLabelText('Integer 1', '42', false);
    let sum = getByDisplayValue(42);
    expect(sum).toBeInTheDocument();

    await typeByLabelText('Integer 2', '2', false);

    const sum2 = getAllByDisplayValue(2);
    expect(sum2[0]).toHaveValue(2);

    const sum3 = getByText(44);
    expect(sum3).toBeInTheDocument();
  });

  it('Section scoring on quantity grouping', async () => {
    const { getByDisplayValue, getByText } = createWrapper(CodeScoreDataModel);

    await typeByLabelText('Quantity (cm)', '165.234', false);
    let sum = getByDisplayValue(165.234);
    expect(sum).toBeInTheDocument();

    await typeByLabelText('Nytt quantityfelt med en egen enhet der man feks skal regne sammen to cm felt', '45.234', false);

    const sum2 = getByDisplayValue(45.234);
    expect(sum2).toBeInTheDocument();
    const sectionScoreItem = getByText('210.47 centimeter');
    expect(sectionScoreItem).toBeInTheDocument();
  });

  it('Section scoring on multiple choice grouping, with section scoring quantity extention kilo. Select one', async () => {
    const { getByText } = createWrapper(CodeScoreDataModel);
    await clickByLabelText('Svært medtatt, vansker med å ta til deg væske eller næring');
    expect(getByText('50 kilo')).toBeInTheDocument();
  });

  it('Section scoring on multiple choice grouping, with section scoring quantity extention kilo. Select multiple', async () => {
    const { getByText } = createWrapper(CodeScoreDataModel);
    await clickByLabelText('Svært medtatt, vansker med å ta til deg væske eller næring');
    await clickByLabelText(/utslett som ikke lar seg avbleke/i);
    expect(getByText('100 kilo')).toBeInTheDocument();
  });

  it('Section scoring on multiple choice grouping, with section scoring quantity without extension. Select multiple', async () => {
    const { getAllByText } = createWrapper(CodeScoreDataModel);

    await clickByLabelText('Astma');
    await clickByLabelText('Kols');

    expect(getAllByText('50 score')).toHaveLength(2);
  });

  it('Total QS scoring', async () => {
    const { getByText } = createWrapper(CodeScoreDataModel);

    await clickByLabelText('Astma');
    await clickByLabelText('Feber');

    expect(getByText('35 score')).toBeInTheDocument();
  });
});

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
  return renderRefero({ questionnaire, props: { authorized: true } });
}
