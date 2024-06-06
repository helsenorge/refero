import { renderRefero, waitFor } from './test-utils/test-utils';
import '@testing-library/jest-dom/extend-expect';
import {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer,
  Extension,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from 'fhir/r4';
import itemType from '../../constants/itemType';
import '../../util/defineFetch';
import { createItemControlExtension } from '../__tests__/utils';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../constants';
import { generateQuestionnaireResponse } from '../../actions/generateQuestionnaireResponse';
import ItemType from '../../constants/itemType';
import itemcontrol from '../../constants/itemcontrol';

describe('Open-Choice component render', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('should render coding answer as text', async () => {
    const extensions: Extension[] = [createItemControlExtension(itemcontrol.RADIOBUTTON)];
    const option = createValueStringOption('Home', 'Car', 'Nuts', 'Usikker');
    const item: QuestionnaireItem = {
      ...createItemWithOptionAndExtensions({ extensions: extensions, options: option }),
      readOnly: true,
      type: ItemType.OPENCHOICE,
    };

    const answer: QuestionnaireResponseItemAnswer[] = [
      { valueCoding: { code: '4', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
    ];
    const { queryByText } = renderWrapperWithItem(item, [{ linkId: '1', answer }]);
    const textView = await waitFor(async () => queryByText(/Usikker/i));
    expect(textView).toBeInTheDocument();
  });

  it('should render with coding and text value as text', async () => {
    const extensions = [createItemControlExtension(itemcontrol.RADIOBUTTON)];
    const option = createValueStringOption('Home', 'Car', 'Nuts', 'Usikker');
    const item: QuestionnaireItem = {
      ...createItemWithOptionAndExtensions({ extensions: extensions, options: option }),
      readOnly: true,
      type: ItemType.OPENCHOICE,
    };

    const answer: QuestionnaireResponseItemAnswer[] = [
      { valueCoding: { code: '4', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Fri text' },
    ];
    const { queryByText } = renderWrapperWithItem(item, [{ linkId: '1', answer }]);

    const textView = await waitFor(async () => queryByText(/Usikker, Fri text/i));
    expect(textView).toBeInTheDocument();
  });

  it('should render valueStrings as input value', async () => {
    const extensions = [createItemControlExtension(itemcontrol.RADIOBUTTON)];
    const option = createValueStringOption('Home', 'Car');

    const item: QuestionnaireItem = {
      ...createItemWithOptionAndExtensions({ extensions: extensions, options: option }),
      readOnly: true,
      type: ItemType.OPENCHOICE,
    };

    const answer = [
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Fri text' },
    ];

    const { queryByText } = renderWrapperWithItem(item, [{ linkId: '1', answer }]);

    const textView = await waitFor(async () => queryByText('Fri text'));
    expect(textView).toBeInTheDocument();
  });

  it('should render empty valueString as empty input value', async () => {
    const extensions = [createItemControlExtension(itemcontrol.RADIOBUTTON)];
    const option = createValueStringOption('Home', 'Car');
    const item: QuestionnaireItem = {
      ...createItemWithOptionAndExtensions({ extensions: extensions, options: option }),
      readOnly: true,
      type: ItemType.OPENCHOICE,
    };
    const answer = [{ valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } }];
    const { queryByText } = renderWrapperWithItem(item, [{ linkId: '1', answer }]);

    const textView = queryByText('Home');
    const textView2 = queryByText('Car');
    const textView3 = queryByText(OPEN_CHOICE_LABEL);

    expect(textView).not.toBeInTheDocument();
    expect(textView2).not.toBeInTheDocument();
    expect(textView3).not.toBeInTheDocument();
  });
});

function renderWrapperWithItem(item: QuestionnaireItem, responseItem: QuestionnaireResponseItem[]) {
  const quest = createQuestionnaire({ item: [item] });

  const resp = generateQuestionnaireResponse(quest);
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    ...resp,
    item: resp?.item?.map(x => {
      const answerItem = responseItem.find(y => y.linkId === x.linkId);
      if (!!answerItem) {
        return {
          ...x,
          answer: answerItem.answer,
        };
      }
      return x;
    }),
  };
  return renderRefero({ questionnaire: quest, props: { questionnaireResponse } });
}
function createQuestionnaire({ ...rest }: Partial<Questionnaire>): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'draft',
    ...rest,
  };
}

function createItem({ type = itemType.OPENCHOICE, linkId = '1', ...rest }: QuestionnaireItem): QuestionnaireItem {
  return {
    linkId,
    type,
    text: type,
    ...rest,
  };
}
function createItemWithOptionAndExtensions({
  options,
  extensions,
}: {
  options: QuestionnaireItemAnswerOption[];
  extensions: Extension[];
}): QuestionnaireItem {
  return createItem({ linkId: '1', type: ItemType.OPENCHOICE, answerOption: options, extension: extensions });
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map((o, i) => {
    return {
      valueCoding: { code: i === 0 ? OPEN_CHOICE_ID : (i + 1).toString(), display: o },
    };
  });
}
