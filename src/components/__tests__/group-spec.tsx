import '../../util/__tests__/defineFetch';
import type { IItemType } from '../../constants/itemType';
import type { ReferoProps } from '@/types/referoProps';
import type { QuestionnaireItem, Extension, Questionnaire } from 'fhir/r4';

import { getResources } from '../../../preview/resources/referoResources';
import { act, renderRefero } from '../../../test/test-utils';
import questionnaire from '../__tests__/__data__/group';
import { createItemControlExtension, findItemById } from '../__tests__/utils';

const resources = { ...getResources('') };

describe('Group component renders with correct classes', async () => {
  const defaultClasses = ['.page_refero__component', '.page_refero__component_group'];

  //TODO: problem with new tables and old tables having the same extension
  it.skip('renders with table-class when extension is table', async () => {
    const id = 'table';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = await createWrapperForGroupItem(item);
    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_table');
  });

  it('renders with htable-class when extension is htable', async () => {
    const id = 'htable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = await createWrapperForGroupItem(item);
    expectToFindClasses(container, 'item_htable-navanchor', ...defaultClasses, '.page_refero__itemControl_htable');
  });

  //TODO: problem with new tables and old tables having the same extension
  it.skip('renders with gtable-class when extension is gtable', async () => {
    const id = 'gtable';

    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = await createWrapperForGroupItem(item);

    expectToFindClasses(container, 'item_gtable-navanchor', ...defaultClasses, '.page_refero__itemControl_gtable');
  });

  it('renders with atable-class when extension is atable', async () => {
    const id = 'atable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = await createWrapperForGroupItem(item);
    expectToFindClasses(container, 'item_atable-navanchor', ...defaultClasses, '.page_refero__itemControl_atable');
  });
});

function expectToFindClasses(container: HTMLElement, id: string, ...classes: string[]): void {
  const item = findItemById(id, container);
  for (const c of classes) {
    expect(item.className?.includes(c.slice(1))).toEqual(true);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapperForGroupItem(item: QuestionnaireItem) {
  return await createWrapper({ ...questionnaire, item: [item] });
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await act(async () => await renderRefero({ questionnaire, props: { ...props, resources, pdf: false } }));
};
