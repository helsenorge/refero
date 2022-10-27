import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../../types/fhir';
import { createDateFromYear } from '../../../../util/createDateFromYear';

describe('Date form component', () => {
  const question: QuestionnaireItem = {
    id: '2',
    linkId: '2.1',
    repeats: false,
    type: 'group',
    text: 'Overskrift',
  };
  it('Should parse the date-year-input to string correctly', () => {
    const answer: QuestionnaireResponseItemAnswer = {
      linkId: '123',
      valueDate: '2005',
      answer: [
        {
          valueString: 'abc',
          item: [
            {
              linkId: '789',
            },
          ],
        },
        {
          valueString: 'def',
        },
      ],
    } as QuestionnaireResponseItemAnswer;
    const test = createDateFromYear(question, answer);
    expect(test?.toISOString()).toBe('2005-01-01T00:00:00.000Z');
  });
});
