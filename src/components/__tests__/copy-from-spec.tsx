import '../../util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension, QuestionnaireItemEnableWhen } from 'fhir/r4';

import { createDataReceiverExpressionExtension, createItemControlExtension } from '../__tests__/utils';
import ItemType from '../../constants/itemType';
import { renderRefero, userEvent, waitFor } from '../../../test/test-utils';
import { clickByLabelText } from '@test/selectors';
import ItemControlConstants from '@/constants/itemcontrol';
import { Extensions } from '@/constants/extensions';
import valueSet from '@/constants/valuesets';
import { Valueset } from '@/util/__tests__/__data__/valuesets/valueset-8459';

describe('Copy value from item', () => {
  it('should copy STRING value', async () => {
    const sender = createSenderItem(ItemType.STRING);
    const reciever = createRecieverItem(ItemType.STRING);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    const elm = await findByTestId(/item_2/i);
    expect(elm).toBeInTheDocument();
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy INTEGER value', async () => {
    const sender = createSenderItem(ItemType.INTEGER);
    const reciever = createRecieverItem(ItemType.INTEGER);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    const elm = await findByTestId(/item_2/i);
    expect(elm).toBeInTheDocument();
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy TEXT value', async () => {
    const sender = createSenderItem(ItemType.TEXT);
    const reciever = createRecieverItem(ItemType.TEXT);
    const q = createQuestionnaire(sender, reciever);
    const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123');
    const elm = await findByTestId(/item_2/i);
    expect(elm).toBeInTheDocument();
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123'));
  });
  it('should copy DECIMAL value', async () => {
    const sender = createSenderItem(ItemType.DECIMAL);
    const reciever = createRecieverItem(ItemType.DECIMAL);
    const q = createQuestionnaire(sender, reciever);
    console.log(JSON.stringify(q, null, 2));
    const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '123.12');
    const elm = await findByTestId(/item_2/i);
    expect(elm).toBeInTheDocument();
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('123.12'));
  });
  it('should copy BOOLEAN value', async () => {
    const sender = createSenderItem(ItemType.BOOLEAN);
    const reciever = createRecieverItem(ItemType.BOOLEAN);
    const q = createQuestionnaire(sender, reciever);
    const { queryByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2-label/i)).not.toBeInTheDocument();
    await clickByLabelText(`${sender.text}`);
    const elm = await findByTestId(/item_2-label/i);
    expect(elm).toBeInTheDocument();
  });
  describe('should copy DATE and TIME values', () => {
    beforeEach(() => {
      process.env.TZ = 'Europe/Oslo';
    });
    afterEach(() => {
      delete process.env.TZ;
    });
    it('should copy DATE value', async () => {
      const sender = createSenderItem(ItemType.DATE);
      const reciever = createRecieverItem(ItemType.DATE);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.type(getByLabelText(labelRegex), '12.12.2024');
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12. desember 2024'));
    });
    it('should copy DATETIME value', async () => {
      const sender = createSenderItem(ItemType.DATETIME);
      const reciever = createRecieverItem(ItemType.DATETIME);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');

      const dateElement = getByLabelText(labelRegex);
      const hoursElement = await findByTestId('hours-test');
      const minutesElement = await findByTestId('minutes-test');

      const hoursInput = hoursElement.querySelector('input');
      const minutesInput = minutesElement.querySelector('input');

      await userEvent.type(dateElement, '12.12.2024');
      if (hoursInput && minutesInput) {
        await userEvent.type(hoursInput, '12');
        await userEvent.type(minutesInput, '30');
      }

      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12.12.2024 12:30'));
    });
    it('should copy DATEYEAR value', async () => {
      const sender = createSenderChoiceItem(ItemType.DATE, createItemControlExtension(ItemControlConstants.YEAR));
      const reciever = createReciverChoiceItem(ItemType.DATE, ItemControlConstants.YEAR);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.type(getByLabelText(labelRegex), '2024');
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('2024'));
    });
    it('should copy DATEMONTH value', async () => {
      const sender = createSenderChoiceItem(ItemType.DATE, createItemControlExtension(ItemControlConstants.YEARMONTH));
      const reciever = createReciverChoiceItem(ItemType.DATE, ItemControlConstants.YEARMONTH);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      const monthElement = await findByTestId('month-select');
      const monthSelect = monthElement.querySelector('select');

      await userEvent.type(getByLabelText(labelRegex), '2024');
      await userEvent.tab();
      if (monthSelect) {
        await userEvent.selectOptions(monthSelect, '05');
      }

      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('mai 2024'));
    });
    it('should copy TIME value', async () => {
      const sender = createSenderItem(ItemType.TIME);
      const reciever = createRecieverItem(ItemType.TIME);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.type(getByLabelText(labelRegex), '12');
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12:00'));
    });
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
    const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
    expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
    const labelRegex = new RegExp(`${sender.text}`, 'i');
    await userEvent.type(getByLabelText(labelRegex), '12');
    const elm = await findByTestId(/item_2/i);
    expect(elm).toBeInTheDocument();
    await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('12'));
  });
  describe('should copy CHOICE value', () => {
    it('should copy CHECKBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy RADIOBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.RADIOBUTTON));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.RADIOBUTTON);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy DROPDOWN value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.DROPDOWN));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.DROPDOWN);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.selectOptions(getByLabelText(labelRegex), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it.skip('should copy SLIDER value', async () => {
      const sender = createSenderChoiceItem(ItemType.CHOICE, createItemControlExtension(ItemControlConstants.SLIDER));
      const reciever = createReciverChoiceItem(ItemType.CHOICE, ItemControlConstants.SLIDER);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      await userEvent.selectOptions(getByLabelText(`${sender.text}`), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
  });
  describe('should copy OPEN-CHOICE value', () => {
    it('should copy CHECKBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy RADIOBOX value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.RADIOBUTTON));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.RADIOBUTTON);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Mann/i)).toBeInTheDocument();
      await userEvent.click(getByLabelText(/Mann/i));
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy DROPDOWN value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.DROPDOWN));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.DROPDOWN);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, getByRole, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      const labelRegex = new RegExp(`${sender.text}`, 'i');
      await userEvent.selectOptions(getByLabelText(labelRegex), getByRole('option', { name: 'Mann' }) as HTMLOptionElement);
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();
      await waitFor(async () => expect(getByTestId(/item_2/i)).toHaveTextContent('Mann'));
    });
    it('should copy EXTRA-FIELD value', async () => {
      const sender = createSenderChoiceItem(ItemType.OPENCHOICE, createItemControlExtension(ItemControlConstants.CHECKBOX));
      const reciever = createReciverChoiceItem(ItemType.OPENCHOICE, ItemControlConstants.CHECKBOX);
      const q = createQuestionnaire(sender, reciever);
      const { getByLabelText, queryByTestId, getByTestId, findByTestId } = createWrapper(q);
      expect(queryByTestId(/item_2/i)).not.toBeInTheDocument();
      expect(getByLabelText(/Annet/i)).toBeInTheDocument();

      await userEvent.click(getByLabelText(/Annet/i));
      await userEvent.type(getByTestId('item_1-label'), 'e');
      const elm = await findByTestId(/item_2/i);
      expect(elm).toBeInTheDocument();

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createWrapper(q: Questionnaire) {
  return renderRefero({ questionnaire: q });
}
