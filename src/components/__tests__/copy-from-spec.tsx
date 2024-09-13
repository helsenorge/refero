import '../../util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension, QuestionnaireItemEnableWhen } from 'fhir/r4';

import Valueset from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createDataReceiverExpressionExtension, createItemControlExtension } from '../__tests__/utils';
import ItemType from '../../constants/itemType';
import { renderRefero, userEvent, waitFor } from '../../../test/test-utils';
import { clickByLabelText } from '@test/selectors';
import ItemControlConstants from '@/constants/itemcontrol';
import { Extensions } from '@/constants/extensions';
import valueSet from '@/constants/valuesets';

describe('Copy value from item', () => {
  it('should copy STRING value', async () => {
    const sender = createSenderItem(ItemType.STRING);
    const reciever = createRecieverItem(ItemType.STRING);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy INTEGER value', async () => {
    const sender = createSenderItem(ItemType.INTEGER);
    const reciever = createRecieverItem(ItemType.INTEGER);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy TEXT value', async () => {
    const sender = createSenderItem(ItemType.TEXT);
    const reciever = createRecieverItem(ItemType.TEXT);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy DECIMAL value', async () => {
    const sender = createSenderItem(ItemType.DECIMAL);
    const reciever = createRecieverItem(ItemType.DECIMAL);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123.12');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123.12'));
  });
  it('should copy BOOLEAN value', async () => {
    const sender = createSenderItem(ItemType.BOOLEAN);
    const reciever = createRecieverItem(ItemType.BOOLEAN);
    const q = createQuestionnaire(sender, reciever);
    const { queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2-label/i)).not.toBeInTheDocument();
    await clickByLabelText(`${sender.text}`);
    await waitFor(async () => expect(getByTestId(/item_2-label/i)).toBeInTheDocument());
  });
  it('should copy DATE value', async () => {
    const sender = createSenderItem(ItemType.DATE);
    const reciever = createRecieverItem(ItemType.DATE);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '12');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12. desember 2024'));
  });
  it('should copy DATETIME value', async () => {
    const sender = createSenderItem(ItemType.DATETIME);
    const reciever = createRecieverItem(ItemType.DATETIME);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.click(getByLabelText(labelRegex));
    await userEvent.paste('12.12.2024');

    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12.12.2024 00:00'));
  });
  it.skip('should copy TIME value', async () => {
    const sender = createSenderItem(ItemType.DATETIME);
    const reciever = createRecieverItem(ItemType.DATETIME);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    await userEvent.type(getByLabelText(`${sender.text}`), '12:12');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12:12'));
  });
  it('should copy QUANTITY value', async () => {
    const sender = createSenderItem(ItemType.QUANTITY, {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
      valueCoding: {
        code: 'kg',
        display: 'kilo',
        system: 'http://unitsofmeasure.org',
      },
    });
    const reciever = createRecieverItem(ItemType.QUANTITY, [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
        valueCoding: {
          code: 'kg',
          display: 'kilo',
          system: 'http://unitsofmeasure.org',
        },
      },
    ]);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '12');
    await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12'));
  });
  describe('should copy CHOICE value', () => {
    it('should copy CHECKBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy RADIOBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.RADIOBUTTON));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.RADIOBUTTON);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy DROPDOWN value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.DROPDOWN));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.DROPDOWN);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.selectOptions(getByLabelText(labelRegex), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it.skip('should copy SLIDER value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.SLIDER));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.SLIDER);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      await userEvent.selectOptions(getByLabelText(`${sender.text}`), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
  });
  describe('should copy OPEN-CHOICE value', () => {
    it('should copy CHECKBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy RADIOBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.RADIOBUTTON));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.RADIOBUTTON);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy DROPDOWN value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.DROPDOWN));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.DROPDOWN);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.selectOptions(getByLabelText(labelRegex), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy EXTRA-FIELD value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Annet/i)).toBeInTheDocument();

      await userEvent.click(getByLabelText(/Annet/i));
      await userEvent.type(getByTestId('item_1-label'), 'e');
      await waitFor(async () => expect(getByTestId(/item_2/i)).toBeInTheDocument());

      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('e'));
    });
  });
});

function createItem(
  id: string,
  type: QuestionnaireItem['type'],
  enableWhen?: QuestionnaireItemEnableWhen[],
  ...withExtensions: Extension[]
): QuestionnaireItem {
  return _createItem(type, id, withExtensions, enableWhen, true, undefined);
}

function createSenderChoiceItem(type: QuestionnaireItem['type'], ...withExtensions: Extension[]): QuestionnaireItem {
  return _createItem(type, '1', withExtensions, undefined, false, '#8459');
}
function createReciverChoiceItem(
  type: QuestionnaireItem['type'],
  choiceType: (typeof ItemControlConstants)[keyof typeof ItemControlConstants],
  ...withExtensions: Extension[]
): QuestionnaireItem {
  return _createItem(
    type,
    '2',
    [
      ...withExtensions,
      {
        url: Extensions.ITEMCONTROL_URL,
        valueCodeableConcept: {
          coding: [
            {
              system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
              code: choiceType as string,
            },
            {
              system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
              code: 'data-receiver',
            },
          ],
        },
      },
      createDataReceiverExpressionExtension(`QuestionnaireResponse.descendants().where(linkId='1').answer.value`),
    ],
    [
      {
        answerBoolean: true,
        question: '1',
        operator: 'exists',
      },
    ],
    true,
    '#8459'
  );
}

function createSenderItem(type: QuestionnaireItem['type'], ...withExtensions: Extension[]): QuestionnaireItem {
  return _createItem(type, '1', withExtensions, undefined, false, undefined);
}
function createRecieverItem(type: QuestionnaireItem['type'], exstensions: Extension[] = []): QuestionnaireItem {
  return createItem(
    '2',
    type,
    [
      {
        answerBoolean: true,
        question: '1',
        operator: type === ItemType.BOOLEAN ? '=' : 'exists',
      },
    ],
    createDataReceiverExpressionExtension(`QuestionnaireResponse.descendants().where(linkId='1').answer.value`),
    createItemControlExtension('data-receiver'),
    ...exstensions
  );
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
  id: string,
  extensions: Extension[],
  enableWhen: QuestionnaireItemEnableWhen[] | undefined,
  readOnly: boolean | undefined,
  answerValueSet: string | undefined,
  ...children: QuestionnaireItem[]
): QuestionnaireItem {
  return {
    linkId: id,
    type: type,
    text: `${type}-${id}`,
    item: children,
    extension: extensions,
    readOnly,
    answerValueSet,
    enableWhen,
  };
}

function createWrapper(q: Questionnaire) {
  return renderRefero({ questionnaire: q });
}
