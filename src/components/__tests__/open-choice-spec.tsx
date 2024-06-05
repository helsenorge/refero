import { renderRefero, screen } from './test-utils/test-utils';
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
import { createIDataReceiverExpressionExtension } from '../__tests__/utils';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM, OPEN_CHOICE_LABEL } from '../../constants';
import { generateQuestionnaireResponse } from '../../actions/generateQuestionnaireResponse';
import ItemType from '../../constants/itemType';

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

  it.only('should render data-receiver with coding answer as text', () => {
    const extensions: Extension[] = [createIDataReceiverExpressionExtension('Test')];
    const item: QuestionnaireItem = { ...createItemWithExtensions(...extensions), readOnly: true, type: 'choice' };

    const answer: QuestionnaireResponseItemAnswer[] = [
      { valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
    ];
    const { getByText } = renderWrapperWithItem(item, [{ linkId: '1', answer: answer }]);

    const textView = getByText('Usikker');
    expect(textView).toBeInTheDocument();
  });

  it('should render data-receiver with coding and text value as text', () => {
    const extensions = [createIDataReceiverExpressionExtension('Test')];
    const item = createItemWithExtensions(...extensions);
    item.readOnly = true;
    const answer = [
      { valueCoding: { code: '3', display: 'Usikker', system: 'urn:oid:2.16.578.1.12.4.1.9523' } },
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
    ];
    renderWrapperWithItem(item, [{ linkId: '1', answer: answer }]);

    const textView = screen.getByText('Usikker, Free text');
    expect(textView).toBeInTheDocument();
  });

  it('should render valueStrings as input value', () => {
    const option = createValueStringOption('Home', 'Car');
    const item = createItemWithOption(...option);
    const answer = [
      { valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } },
      { valueString: 'Free text' },
    ];
    renderWrapperWithItem(item, [{ linkId: '1', answer: answer }]);

    const input = screen.getAllByRole('textbox');
    expect(input.length).toBeGreaterThan(0);
    input.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).toHaveValue('Free text');
    });
  });

  it('should render empty valueString as empty input value', () => {
    const option = createValueStringOption('Home', 'Car');
    const item = createItemWithOption(...option);
    const answer = [{ valueCoding: { code: OPEN_CHOICE_ID, display: OPEN_CHOICE_LABEL, system: OPEN_CHOICE_SYSTEM } }];
    renderWrapperWithItem(item, [{ linkId: '1', answer: answer }]);

    const input = screen.getAllByRole('textbox');
    expect(input.length).toBeGreaterThan(0);
    input.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).toHaveValue('');
    });
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
    ...rest,
  };
}

function createItemWithOption(...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
  return createItem({ linkId: '1', type: ItemType.OPENCHOICE, answerOption: options });
}

function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
  return createItem({ linkId: '1', type: ItemType.OPENCHOICE, extension: extensions });
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueCoding: { code: o, display: o },
    };
  });
}
