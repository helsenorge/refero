import '../../util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension } from 'fhir/r4';

import { Valueset } from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createItemControlExtension } from '../__tests__/utils';
import ItemType from '../../constants/itemType';
import { renderRefero, waitFor } from '../../../test/test-utils';
import { Extensions } from '../../constants/extensions';

describe('Hidden components should not render', () => {
  it('unhidden attachment renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden attachment does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.ATTATCHMENT, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden boolean renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden boolean does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.BOOLEAN, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden date renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden date does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATE, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden time renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden time does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.TIME, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden dateTime renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden dateTime does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DATETIME, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden decimal renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden decimal does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.DECIMAL, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden integer renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden integer does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.INTEGER, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden quantity renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden quantity does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.QUANTITY, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden string renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden string does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.STRING, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden text renders', async () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(false)));
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden text does not render', async () => {
    const q = createQuestionnaire(createItem(ItemType.TEXT, createQuestionnaireHiddenExtension(true)));
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden radio-button choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { getByLabelText } = await createWrapper(q);

    expect(getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden radio-button choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('radio-button'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);

    expect(queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden check-box choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { getByLabelText } = await createWrapper(q);

    expect(getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden check-box choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);

    expect(queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden drop-down choice renders', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const labelRegex = new RegExp('1', 'i');
    const { getByLabelText } = await createWrapper(q);
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden drop-down choice does not render', async () => {
    const item = createChoiceItem(ItemType.CHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
  });

  it('unhidden radio-button open-choice renders', async () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(false)
    );
    const q = createQuestionnaire(item);
    const { getByLabelText } = await createWrapper(q);

    expect(getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden radio-button open-choice does not render', async () => {
    const item = createChoiceItem(
      ItemType.OPENCHOICE,
      createItemControlExtension('radio-button'),
      createQuestionnaireHiddenExtension(true)
    );
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);

    expect(queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden check-box open-choice renders', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { getByLabelText } = await createWrapper(q);

    expect(getByLabelText('Mann')).toBeInTheDocument();
  });

  it('hidden check-box open-choice does not render', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('check-box'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);

    expect(queryByLabelText('Mann')).not.toBeInTheDocument();
  });

  it('unhidden drop-down open-choice renders', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(false));
    const q = createQuestionnaire(item);
    const { getByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(getByLabelText(labelRegex)).toBeInTheDocument();
  });

  it('hidden drop-down open-choice does not render', async () => {
    const item = createChoiceItem(ItemType.OPENCHOICE, createItemControlExtension('drop-down'), createQuestionnaireHiddenExtension(true));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = await createWrapper(q);
    const labelRegex = new RegExp('1', 'i');
    expect(queryByLabelText(labelRegex)).not.toBeInTheDocument();
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

async function createWrapper(q: Questionnaire) {
  return await waitFor(async () => {
    return renderRefero({ questionnaire: q });
  });
}
