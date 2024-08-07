import { renderRefero, screen } from '../../../../../test/test-utils';

import '../../../../util/__tests__/defineFetch';
import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer, Extension } from 'fhir/r4';
import itemType from '../../../../constants/itemType';
import { Extensions } from '../../../../constants/extensions';
import { createQuestionnaire } from '@/components/__tests__/utils';
import { getResources } from '../../../../../preview/resources/referoResources';
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };
const initAnswer: QuestionnaireResponseItemAnswer[] = [{}];

// Provide the mock implementation

describe('Choice component renders item.option[]', () => {
  it('should render options from extension optionreference', () => {
    const extensions = createExtensionReferenceOption(
      { key: 'HV', value: 'http://some.end/point1' },
      { key: 'HSØ', value: 'http://some.end/point2' }
    );
    const item = createItemWithExtensions(...extensions);
    renderWrapperWithItem(item);
    expectToFind(['http://some.end/point1', 'http://some.end/point2'], ['HV', 'HSØ']);
  });

  it('should render valueReferences', () => {
    const option = createValueReferenceOption(
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3',
        value: 'Org01',
      },
      {
        key: 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1',
        value: 'Org02',
      }
    );
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(
      ['https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/3', 'https://nde-fhir-ehelse.azurewebsites.net/fhir/Endpoint/1'],
      ['Org01', 'Org02']
    );
  });

  it('should render valueStrings', () => {
    const option = createValueStringOption('dog', 'cat');
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(['dog', 'cat'], ['dog', 'cat']);
  });

  it('should render valueInteger', () => {
    const option = createValueIntegerOption(42, 1729);
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(['42', '1729'], ['42', '1729']);
  });

  it('should render valueDate', () => {
    const option = createValueDateOption('2018-01-01', '2018-08-22');
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(['2018-01-01', '2018-08-22'], ['2018-01-01', '2018-08-22']);
  });

  it('should render valueTime', () => {
    const option = createValueTimeOption('14:23:11', '03:30');
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(['14:23:11', '03:30'], ['14:23:11', '03:30']);
  });

  it('should render valueCoding', () => {
    const option = createValueCodingOption({ key: 'OSL', value: 'Gardermoen' }, { key: 'LAX', value: 'LA' });
    const item = createItemWithOption(...option);
    renderWrapperWithItem(item);
    expectToFind(['OSL', 'LAX'], ['Gardermoen', 'LA']);
  });

  it('should render different types', () => {
    const referenceOption = createValueReferenceOption({
      key: 'valueReference',
      value: 'ref',
    });
    const codingOption = createValueCodingOption({
      key: 'valueCoding',
      value: 'code',
    });
    const stringOption = createValueStringOption('foo');
    const integerOption = createValueIntegerOption(42);
    const dateOption = createValueDateOption('2018-12-31');
    const timeOption = createValueTimeOption('00:00');
    const item = createItemWithOption(...referenceOption, ...codingOption, ...stringOption, ...integerOption, ...dateOption, ...timeOption);
    renderWrapperWithItem(item);
    expectToFind(
      ['valueReference', 'valueCoding', 'foo', '42', '2018-12-31', '00:00'],
      ['ref', 'code', 'foo', '42', '2018-12-31', '00:00']
    );
  });
});

function expectToFind(keys: string[], values: string[]) {
  const choices = screen.getAllByRole('radio');

  expect(choices).toHaveLength(keys.length);
  keys.forEach((e, i) => {
    const choice = choices[i];
    const val = choice.getAttribute('value');
    expect(val).toEqual(e);
  });

  values.forEach(e => {
    const label = screen.getByText(e);
    expect(label).toBeInTheDocument();
  });
}

function createExtensionReferenceOption(...options: { key: string; value: string }[]): Extension[] {
  return options.map(o => {
    return {
      url: Extensions.OPTION_REFERENCE_URL,
      valueReference: {
        reference: o.value,
        display: o.key,
      },
    };
  });
}

function createValueReferenceOption(...options: { key: string; value: string }[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueReference: {
        reference: o.key,
        display: o.value,
      },
    };
  });
}

function createValueCodingOption(...options: { key: string; value: string }[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueCoding: {
        code: o.key,
        display: o.value,
      },
    };
  });
}

function createValueStringOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueString: o,
    };
  });
}

function createValueIntegerOption(...options: number[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueInteger: o,
    };
  });
}

function createValueDateOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueDate: o,
    };
  });
}

function createValueTimeOption(...options: string[]): QuestionnaireItemAnswerOption[] {
  return options.map(o => {
    return {
      valueTime: o,
    };
  });
}

function renderWrapperWithItem(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer[] = initAnswer) {
  const q = createQuestionnaire({ items: [item] });
  renderRefero({ questionnaire: q, resources: resources });

  // <Choice
  //   id={item.linkId}
  //   idWithLinkIdAndItemIndex={item.linkId}
  //   dispatch={() => undefined as any}
  //   item={item}
  //   path={[]}
  //   onAnswerChange={() => {}}
  //   responseItem={{
  //     linkId: item.linkId,
  //   }}
  // />
}

function createItemWithOption(...options: QuestionnaireItemAnswerOption[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.CHOICE,
    answerOption: options,
  };
}

function createItemWithExtensions(...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: '1',
    type: itemType.CHOICE,
    extension: extensions,
  };
}
