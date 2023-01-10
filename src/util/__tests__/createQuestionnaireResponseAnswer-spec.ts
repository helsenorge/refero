import { createQuestionnaireResponseAnswer } from '../createQuestionnaireResponseAnswer';
import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireItemInitial } from '../../types/fhir';
import itemType from '../../constants/itemType';

describe('createQuestionnaireResponseAnswer', () => {
  const item: QuestionnaireItem = {
    linkId: '1',
    type: itemType.CHOICE,
    required: false,
    answerOption: [
      {
        valueCoding: {
          id: '1',
          code: 'option-1',
          system: 'urn:uuid:434e611a-95a0-456d-8363-c797f4adf646',
          display: 'Option 1',
        },
      },
      {
        valueCoding: {
          id: '2',
          code: 'option-2',
          system: 'urn:uuid:434e611a-95a0-456d-8363-c797f4adf646',
          display: 'Option 2',
        },
      },
    ] as QuestionnaireItemAnswerOption[],
    initial: [
      {
        valueCoding: {
          system: 'urn:uuid:434e611a-95a0-456d-8363-c797f4adf646',
          code: 'option-2',
        },
      },
    ] as QuestionnaireItemInitial[],
  };

  it('Choice initial without display', () => {
    item.initial = [
      {
        valueCoding: {
          system: 'urn:uuid:434e611a-95a0-456d-8363-c797f4adf646',
          code: 'option-2',
        },
      },
    ] as QuestionnaireItemInitial[];

    const answer = createQuestionnaireResponseAnswer(item);

    expect(answer?.valueCoding?.code).toBe('option-2');
    expect(answer?.valueCoding?.system).toBe('urn:uuid:434e611a-95a0-456d-8363-c797f4adf646');
  });

  it('Choice initial with display', () => {
    item.initial = [
      {
        valueCoding: {
          system: 'urn:uuid:434e611a-95a0-456d-8363-c797f4adf647',
          code: 'option-3',
          display: 'Option 3',
        },
      },
    ] as QuestionnaireItemInitial[];

    const answer = createQuestionnaireResponseAnswer(item);

    expect(answer?.valueCoding?.code).toBe('option-3');
    expect(answer?.valueCoding?.display).toBe('Option 3');
    expect(answer?.valueCoding?.system).toBe('urn:uuid:434e611a-95a0-456d-8363-c797f4adf647');
  });
});
