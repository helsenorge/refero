import '../../util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension } from 'fhir/r4';

import { renderRefero, screen, waitFor } from '../../../test/test-utils';
import itemControlConstants from '../../constants/itemcontrol';
import itemType, { IItemType } from '../../constants/itemType';
import { Valueset } from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createItemControlExtension } from '../__tests__/utils';

describe('Components render children', () => {
  it('attachments with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.ATTATCHMENT));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('booleans with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.BOOLEAN));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = await screen.findByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('date with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DATE));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('time with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.TIME));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('dateTime with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DATETIME));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('decimal with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DECIMAL));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('integer with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.INTEGER));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('quantity with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.QUANTITY));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('string with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.STRING));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('text with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.TEXT));
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });

  it('radio-button choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.RADIOBUTTON));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChild = screen.queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = screen.queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('check-box choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.CHECKBOX));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChild = screen.queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = screen.queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('drop-down choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.DROPDOWN));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });
  it('sliderchoice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.SLIDER));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChild = screen.queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = screen.queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });
  it('radio-button open-choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.RADIOBUTTON));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChild = screen.queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = screen.queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('check-box open-choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.CHECKBOX));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChild = screen.queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = screen.queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('drop-down open-choice with children renders', async () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.DROPDOWN));
    const q = createQuestionnaire(item);
    await createWrapper(q);
    const firstChildLabel = new RegExp('2', 'i');
    const firstChild = screen.queryByLabelText(firstChildLabel);
    expect(firstChild).toBeInTheDocument();
    const secondChildLabel = new RegExp('3', 'i');
    const secondChild = screen.queryByLabelText(secondChildLabel);
    expect(secondChild).toBeInTheDocument();
  });
});

function creatNestedItem(type: IItemType, ...withExtensions: Extension[]): QuestionnaireItem {
  return createItem(
    type,
    '1',
    withExtensions,
    undefined,
    createItem(type, '2', withExtensions, undefined, createItem(type, '3', withExtensions, undefined))
  );
}

function createNestedChoiceItem(type: IItemType, ...withExtensions: Extension[]): QuestionnaireItem {
  const reference = '#8459';
  return createItem(
    type,
    '1',
    withExtensions,
    reference,
    createItem(type, '2', withExtensions, reference, createItem(type, '3', withExtensions, reference))
  );
}

function createQuestionnaire(...items: QuestionnaireItem[]): Questionnaire {
  return {
    status: 'draft',
    resourceType: 'Questionnaire',
    item: items,
    contained: [Valueset],
  };
}

function createItem(
  type: IItemType,
  text: string,
  extensions: Extension[],
  options: string | undefined,
  ...children: QuestionnaireItem[]
): QuestionnaireItem {
  return {
    linkId: text,
    type: type,
    text: text,
    item: children,
    extension: extensions,
    answerValueSet: options,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(q: Questionnaire) {
  return renderRefero({ questionnaire: q });
}
