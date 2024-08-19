import { enableWhenMatches } from '../enableWhenMatcher';

describe('Given a Questionnaire item with type boolean', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerBoolean: true },
      {
        valueBoolean: true,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerBoolean: true },
      {
        valueBoolean: false,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerBoolean: true },
      {
        valueBoolean: true,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerBoolean: true },
      {
        valueBoolean: true,
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerBoolean: true },
      {
        valueBoolean: true,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerBoolean: true },
      {
        valueBoolean: true,
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type decimal', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDecimal: 1.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDecimal: 1.1 },
      {
        valueDecimal: 2.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDecimal: 1.1 },
      {
        valueDecimal: 2.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDecimal: 1.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 1.1 },
      {
        valueDecimal: 2.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 1.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is ">" and answerDecimal is 0', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDecimal: 0 },
      {
        valueDecimal: 2.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDecimal: 2.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDecimal: 1.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 2.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 1.1 },
      {
        valueDecimal: 1.1,
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type integer', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerInteger: 1 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerInteger: 1 },
      {
        valueInteger: 2,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerInteger: 1 },
      {
        valueInteger: 2,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerInteger: 1 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 1 },
      {
        valueInteger: 2,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 1 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is ">" when answerInteger is 0', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerInteger: 0 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerInteger: 2 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerInteger: 1 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerInteger: 2 },
      {
        valueInteger: 1,
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDecimal: 1 },
      {
        valueInteger: 1,
      }
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
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '!=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '>',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 2.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '<',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(false);
  });

  it('Should return false when system are not equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://othersystem.org', code: '39051', value: 1.1 } }
    );
    expect(result).toBe(false);
  });

  it('Should return false when code are not equal', () => {
    const result = enableWhenMatches(
      {
        question: '1.0.0',
        operator: '=',
        answerQuantity: { system: 'http://loinc.org', code: '39051', value: 1.1 },
      },
      { valueQuantity: { system: 'http://loinc.org', code: '1111', value: 1.1 } }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type string', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerString: 'bbbb' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerString: 'bbbb' },
      {
        valueString: 'cccc',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerString: 'bbbb' },
      {
        valueString: 'cccc',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerString: 'bbbb' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: 'bbbb' },
      {
        valueString: 'cccc',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" and answerString is the empty string', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: '' },
      {
        valueString: 'cccc',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerString: 'bbbb' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerString: 'cccc' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerString: 'bbbb' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerString: 'cccc' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerString: 'bbbb' },
      {
        valueString: 'bbbb',
      }
    );
    expect(result).toBe(false);
  });
});

describe.skip('Given a Questionnaire item with type time', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerTime: '11:15' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerTime: '11:15' },
      {
        valueTime: '14:00',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerTime: '11:15' },
      {
        valueTime: '14:00',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerTime: '11:15' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerTime: '11:15' },
      {
        valueTime: '14:00',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerTime: '11:15' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerTime: '14:00' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerTime: '11:15' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerTime: '14:00' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerTime: '11:15' },
      {
        valueTime: '11:15',
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type date', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDate: '2019-09-20' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDate: '2019-09-20' },
      {
        valueDate: '2019-10-24',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDate: '2019-09-20' },
      {
        valueDate: '2019-10-24',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDate: '2019-09-20' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDate: '2019-09-20' },
      {
        valueDate: '2019-10-24',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDate: '2019-09-20' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDate: '2019-10-24' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDate: '2019-09-20' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDate: '2019-10-24' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDate: '2019-09-20' },
      {
        valueDate: '2019-09-20',
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type dateTime', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-10-24T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-10-24T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-10-24T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" when values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDateTime: '2019-10-24T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<=" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDateTime: '2019-10-24T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" and values are equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerDateTime: '2019-09-20T10:28:45Z' },
      {
        valueDateTime: '2019-09-20T10:28:45Z',
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type coding', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'ff' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'zz' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'ff' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'ff' },
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'ff' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueCoding: { system: 'http://loinc.org', code: 'ff' },
      }
    );
    expect(result).toBe(false);
  });

  it('Should return false when system are not equal', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerCoding: { system: 'http://loinc.org', code: 'ff' } },
      {
        valueQuantity: { system: 'http://othersystem.org', code: 'ff', value: 1.1 },
      }
    );
    expect(result).toBe(false);
  });
});

describe('Given a Questionnaire item with type reference', () => {
  it('Should return true when operator is "=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '=', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'aaa' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is "!=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '!=', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'vvv' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return true when operator is ">=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>=', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'aaa' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is ">" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '>', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'aaa' },
      }
    );
    expect(result).toBe(false);
  });
  it('Should return true when operator is "<=" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<=', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'aaa' },
      }
    );
    expect(result).toBe(true);
  });
  it('Should return false when operator is "<" ', () => {
    const result = enableWhenMatches(
      { question: '1.0.0', operator: '<', answerReference: { reference: 'aaa' } },
      {
        valueReference: { reference: 'aaa' },
      }
    );
    expect(result).toBe(false);
  });
});
