import { enableWhenMatches } from '../enableWhenMatcher';
import { QuestionnaireResponseItemAnswer, QuestionnaireItemEnableWhen } from '../../types/fhir';

describe('Given a Questionnaire item with type boolean', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: true } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: false } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: true } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: true } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: true } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerBoolean: true } as QuestionnaireItemEnableWhen,
      { valueBoolean: true } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type decimal', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 2.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 2.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 2.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is ">" and answerDecimal is 0', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 0 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 2.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDecimal: 2.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 2.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 1.1 } as QuestionnaireItemEnableWhen,
      { valueDecimal: 1.1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type integer', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 2 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 2 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 2 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is ">" when answerInteger is 0', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 0 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerInteger: 2 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerInteger: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerInteger: 2 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 1 } as QuestionnaireItemEnableWhen,
      { valueInteger: 1 } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type quantity', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '!=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });

  it('Should return false when system are not equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://othersystem.org', code: '39051', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });

  it('Should return false when code are not equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://loinc.org', code: '1111', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type string', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'cccc' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'cccc' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'cccc' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" and answerString is the empty string', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: '' } as QuestionnaireItemEnableWhen,
      { valueString: 'cccc' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerString: 'cccc' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerString: 'cccc' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerString: 'bbbb' } as QuestionnaireItemEnableWhen,
      { valueString: 'bbbb' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type time', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '14:00' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '14:00' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '14:00' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerTime: '14:00' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerTime: '14:00' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerTime: '11:15' } as QuestionnaireItemEnableWhen,
      { valueTime: '11:15' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type date', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-10-24' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-10-24' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-10-24' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDate: '2019-10-24' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDate: '2019-10-24' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDate: '2019-09-20' } as QuestionnaireItemEnableWhen,
      { valueDate: '2019-09-20' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type dateTime', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-10-24T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-10-24T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-10-24T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDateTime: '2019-10-24T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDateTime: '2019-10-24T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireItemEnableWhen,
      { valueDateTime: '2019-09-20T10:28:45Z' } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type coding', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'zz' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });

  it('Should return false when system are not equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerCoding: { system: 'http://loinc.org', code: 'ff' } } as QuestionnaireItemEnableWhen,
      { valueQuantity: { system: 'http://othersystem.org', code: 'ff', value: 1.1 } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type reference', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'aaa' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'vvv' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'aaa' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'aaa' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'aaa' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerReference: { reference: 'aaa' } } as QuestionnaireItemEnableWhen,
      { valueReference: { reference: 'aaa' } } as QuestionnaireResponseItemAnswer
    );
    expect(result).toBe(false);
  });
});
