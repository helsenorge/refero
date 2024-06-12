import '../../util/defineFetch';
import { mapStateToProps } from '../map-props';
import { getQuestionnaireDefinitionItem } from '../refero-core';
import { pathify } from '../../reducers/__tests__/utils';
import { dataModel } from './__data__/testDataModel';
import { RenderContext } from '../renderContext';

describe('mapStateToProps', () => {
  it('should enable component when no enableWhen field', () => {
    const result = mapStateToProps(dataModel, {
      item: { linkId: '1', type: 'string', text: 'test' },
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct string answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[1];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should not enable component when incorrect answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[2];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(false);
  });

  it('should enable component when correct boolean answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[4];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct decimal answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[6];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should not enable component when wrong integer answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[8];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(false);
  });

  it('should enable component when correct date answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[10];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct datetime answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[12];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct time answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[14];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct code answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[16];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable component when correct quantity answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[26];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should enable reference-component if has correct answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }

    const item = dataModel.refero.form.FormDefinition.Content.item[20];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });

  it('should not enable reference-component if has incorrect answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }

    const item = dataModel.refero.form.FormDefinition.Content.item[22];
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });

    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(false);
  });
  // TODO: Flere tester?
  it('should not enable component if has no answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = getQuestionnaireDefinitionItem('group1.2.2', dataModel.refero.form.FormDefinition.Content.item);
    expect(item).toBeDefined();
    const result = mapStateToProps(dataModel, {
      item,
      path: pathify('group1^0', 'group1.2^0', 'group1.2.2'),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(false);
  });

  it('should not enable component if has answer', () => {
    if (
      !dataModel ||
      !dataModel.refero ||
      !dataModel.refero.form.FormDefinition ||
      !dataModel.refero.form.FormDefinition.Content ||
      !dataModel.refero.form.FormDefinition.Content.item
    ) {
      return;
    }
    const item = dataModel.refero.form.FormDefinition.Content.item[18];

    const result = mapStateToProps(dataModel, {
      item,
      path: pathify(item.linkId),
      renderContext: new RenderContext(),
    });
    const enable = result.enable;
    expect(enable).toBeDefined();
    expect(enable).toEqual(true);
  });
});
