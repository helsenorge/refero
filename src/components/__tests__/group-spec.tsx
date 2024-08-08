import '../../util/__tests__/defineFetch';
import { QuestionnaireItem, Extension, Questionnaire } from 'fhir/r4';
import { createItemControlExtension, findItemById } from '../__tests__/utils';
import questionnaire from '../__tests__/__data__/group';
import { renderRefero } from '../../../test/test-utils';
import { IItemType } from '../../constants/itemType';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../preview/resources/referoResources';

const resources = { ...getResources('') };

describe('Group component renders with correct classes', () => {
  const defaultClasses = ['.page_refero__component', '.page_refero__component_group'];

  //TODO: problem with new tables and old tables having the same extension
  it.skip('renders with table-class when extension is table', () => {
    const id = 'table';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container, debug } = createWrapperForGroupItem(item);
    debug();
    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_table');
  });

  it('renders with htable-class when extension is htable', () => {
    const id = 'htable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);
    expectToFindClasses(container, 'item_htable-navanchor', ...defaultClasses, '.page_refero__itemControl_htable');
  });

  //TODO: problem with new tables and old tables having the same extension
  it.skip('renders with gtable-class when extension is gtable', () => {
    const id = 'gtable';

    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);

    expectToFindClasses(container, 'item_gtable-navanchor', ...defaultClasses, '.page_refero__itemControl_gtable');
  });

  it('renders with atable-class when extension is atable', () => {
    const id = 'atable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);
    expectToFindClasses(container, 'item_atable-navanchor', ...defaultClasses, '.page_refero__itemControl_atable');
  });
});

function expectToFindClasses(container: HTMLElement, id: string, ...classes: string[]) {
  const item = findItemById(id, container);
  for (const c of classes) {
    expect(item.className?.includes(c.slice(1))).toEqual(true);
  }
}

function createWrapperForGroupItem(item: QuestionnaireItem) {
  return createWrapper({ ...questionnaire, item: [item] });
}

function createItemWithExtensions(itemType: IItemType, id = '1', ...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: id,
    type: itemType,
    extension: extensions,
    text: 'test',
    readOnly: false,
  };
}

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources, pdf: false } });
};
