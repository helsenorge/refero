import React from 'react';

import '../../util/__tests__/defineFetch';
import { QuestionnaireItem, Extension } from 'fhir/r4';
import { Group } from '../formcomponents/group/group';
import StringComponent from '../../components/formcomponents/string/string';
import { RenderContextType } from '../../constants/renderContextType';
import { RenderContext } from '../../util/renderContext';
import { createItemControlExtension, findItemById } from '../__tests__/utils';
import { render } from './test-utils/test-utils';
import { IItemType } from '../../constants/itemType';

describe('Group component renders with correct classes', () => {
  const defaultClasses = ['.page_refero__component', '.page_refero__component_group'];

  it('renders with table-class when extension is table', () => {
    const id = 'table';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);

    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_table');
  });

  it('renders with htable-class when extension is htable', () => {
    const id = 'htable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);

    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_htable');
  });

  it('renders with gtable-class when extension is gtable', () => {
    const id = 'gtable';

    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);

    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_gtable');
  });

  it('renders with atable-class when extension is atable', () => {
    1;
    const id = 'atable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('group', id, extension);
    const { container } = createWrapperForGroupItem(item);

    expectToFindClasses(container, id, ...defaultClasses, '.page_refero__itemControl_atable');
  });

  it('other items with group item control types, does not get tagged with a class', () => {
    const id = 'gtable';
    const extension = createItemControlExtension(id);
    const item = createItemWithExtensions('string', id, extension);
    const { container } = createWrapperForStringItem(item);

    expectToNotFindClasses(container, id, '.page_refero__itemControl_gtable');
  });
});

function expectToNotFindClasses(container: HTMLElement, id: string, ...classes: string[]) {
  const item = findItemById(`${id}`, container);

  for (const c of classes) {
    expect(item.getAttribute('class')?.includes(c)).toBeFalsy();
  }
}

function expectToFindClasses(container: HTMLElement, id: string, ...classes: string[]) {
  const item = findItemById(`${id}-navanchor`, container);
  for (const c of classes) {
    expect(item.className?.includes(c.slice(1))).toEqual(true);
  }
}

function createWrapperForGroupItem(item: QuestionnaireItem) {
  return render(
    <Group
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined as unknown}
      answer={{}}
      item={item}
      id={item.linkId}
      path={[]}
      renderDeleteButton={() => <></>}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <React.Fragment />}
      renderHelpElement={() => <React.Fragment />}
      renderChildrenItems={() => [<></>]}
      renderContext={new RenderContext(RenderContextType.None)}
      responseItem={{
        linkId: '1',
      }}
    />
  );
}

function createWrapperForStringItem(item: QuestionnaireItem) {
  return render(
    <StringComponent
      idWithLinkIdAndItemIndex={item.linkId}
      dispatch={() => undefined as unknown}
      answer={{}}
      item={item}
      id={item.linkId}
      path={[]}
      renderDeleteButton={() => <></>}
      repeatButton={<React.Fragment />}
      renderHelpButton={() => <React.Fragment />}
      renderHelpElement={() => <React.Fragment />}
      oneToTwoColumn={false}
      renderContext={new RenderContext(RenderContextType.None)}
    />
  );
}

function createItemWithExtensions(itemType: IItemType, id = '1', ...extensions: Extension[]): QuestionnaireItem {
  return {
    linkId: id,
    type: itemType,
    extension: extensions,
  };
}
