import '../../util/__tests__/defineFetch';

import { Questionnaire, QuestionnaireItem, Extension } from 'fhir/r4';
import Valueset from '../../util/__tests__/__data__/valuesets/valueset-8459';
import { createItemControlExtension } from '../__tests__/utils';
import itemControlConstants from '../../constants/itemcontrol';
import itemType, { IItemType } from '../../constants/itemType';
import { renderRefero } from '../../../test/test-utils';

describe('Components render children', () => {
  it('attachments with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.ATTATCHMENT));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('booleans with children renders', async () => {
    const q = createQuestionnaire(creatNestedItem(itemType.BOOLEAN));
    const { findByLabelText } = createWrapper(q);
    const firstChild = await findByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = await findByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('date with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DATE));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it.skip('time with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.TIME));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('dateTime with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DATETIME));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('decimal with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.DECIMAL));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('integer with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.INTEGER));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('quantity with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.QUANTITY));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('string with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.STRING));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('text with children renders', () => {
    const q = createQuestionnaire(creatNestedItem(itemType.TEXT));
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('radio-button choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.RADIOBUTTON));
    const q = createQuestionnaire(item);
    const { queryByText } = createWrapper(q);
    const firstChild = queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('check-box choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.CHECKBOX));
    const q = createQuestionnaire(item);
    const { queryByText } = createWrapper(q);
    const firstChild = queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('drop-down choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.DROPDOWN));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
    expect(secondChild).toBeInTheDocument();
  });
  it('sliderchoice with children renders', () => {
    const item = createNestedChoiceItem(itemType.CHOICE, createItemControlExtension(itemControlConstants.SLIDER));
    const q = createQuestionnaire(item);
    const { queryByText } = createWrapper(q);
    const firstChild = queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });
  it('radio-button open-choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.RADIOBUTTON));
    const q = createQuestionnaire(item);
    const { queryByText } = createWrapper(q);
    const firstChild = queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('check-box open-choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.CHECKBOX));
    const q = createQuestionnaire(item);
    const { queryByText } = createWrapper(q);
    const firstChild = queryByText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByText('3');
    expect(secondChild).toBeInTheDocument();
  });

  it('drop-down open-choice with children renders', () => {
    const item = createNestedChoiceItem(itemType.OPENCHOICE, createItemControlExtension(itemControlConstants.DROPDOWN));
    const q = createQuestionnaire(item);
    const { queryByLabelText } = createWrapper(q);
    const firstChild = queryByLabelText('2');
    expect(firstChild).toBeInTheDocument();
    const secondChild = queryByLabelText('3');
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

function createWrapper(q: Questionnaire) {
  return renderRefero({ questionnaire: q });
}
