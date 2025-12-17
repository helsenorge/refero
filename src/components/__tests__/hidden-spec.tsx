import '../../util/__tests__/defineFetch';

import type { Questionnaire, QuestionnaireItem, Extension } from 'fhir/r4';

import { renderRefero, screen, waitFor } from '../../../test/test-utils';
import { Extensions } from '../../constants/extensions';
import ItemType from '../../constants/itemType';
import { Valueset } from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createItemControlExtension } from '../__tests__/utils';

describe('Hidden components should not render', () => {
  it('unhidden attachment renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden attachment does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden boolean renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden boolean does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden date renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden date does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden time renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden time does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden dateTime renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden dateTime does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden decimal renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden decimal does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden integer renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden integer does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden quantity renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden quantity does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden string renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden string does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden text renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(false)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden text does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(true)));
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden radio-button choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden radio-button choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden check-box choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden check-box choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden drop-down choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const labelRegex = new RegExp('1', 'i');
    await createWrapper(q);
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden drop-down choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden radio-button open-choice renders', async () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(false)
    );
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden radio-button open-choice does not render', async () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(true)
    );
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden check-box open-choice renders', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden check-box open-choice does not render', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    await createWrapper(q);

    expect(screen.queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden drop-down open-choice renders', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden drop-down open-choice does not render', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(screen.queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });
});

function createQuestionnaireHiddenExtension(value: boolean): Extension {
  return {
    url: Extensions.QUESTIONNAIRE_HIDDEN_URL,
    valueBoolean: value,
  };
}

function createItem(type: QuestionnaireItem['type'], ...withExtensions: Extension[]): QuestionnaireItem {
  return _createItem(type, '1', withExtensions, undefined);
}

function createChoiceItem(type: QuestionnaireItem['type'], ...withExtensions: Extension[]): QuestionnaireItem {
  return _createItem(type, '1', withExtensions, '#8459');
}

function createQuestionnaire(...items: QuestionnaireItem[]): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'draft',
    item: items,
    contained: [Valueset],
  };
}

function _createItem(
  type: QuestionnaireItem['type'],
  text: string,
  extensions: Extension[],
  answerValueSet: string | undefined,
  ...children: QuestionnaireItem[]
): QuestionnaireItem {
  return {
    linkId: '1',
    type: type,
    text: text,
    item: children,
    extension: extensions,
    answerValueSet,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(q: Questionnaire) {
  return await waitFor(async () => {
    return await renderRefero({ questionnaire: q });
  });
}
