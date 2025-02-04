import '../../util/__tests__/defineFetch';
import { Questionnaire, Extension } from 'fhir/r4';

import questionnaire from './__data__/common/';
import { renderRefero, waitFor } from '../../../test/test-utils';
import { Extensions } from '../../constants/extensions';
import { PresentationButtonsType } from '../../constants/presentationButtonsType';
import valueSet from '../../constants/valuesets';

const createExtension = (code: PresentationButtonsType): Extension => {
  return {
    url: Extensions.PRESENTATION_BUTTONS_URL,
    valueCoding: {
      system: valueSet.PRESENTATIONBUTTONS_SYSTEM,
      code: code.toLowerCase(),
      display: code,
    },
  };
};
describe('component respects sdf-presentationbuttons', async () => {
  it('questionnaire without presentationbuttons default to sticky, when sticky is set to true', async () => {
    const { container } = await createWrapper(questionnaire, true);
    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
  });

  // it('questionnaire without presentationbuttons default to non-sticky, when sticky is set to false', async  () => {
  //   const { container } = await createWrapper(questionnaire, false);
  //   expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  // });

  // it('questionnaire without presentationbuttons default to non-sticky, when sticky is not set', async  () => {
  //   const { container } = await createWrapper(questionnaire);
  //   expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  // });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is true', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = await createWrapper(q, true);
    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is false', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = await createWrapper(q, false);

    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is not set', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = await createWrapper(q);

    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is true', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = await createWrapper(q, true);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is false', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = await createWrapper(q, false);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is not set', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = await createWrapper(q);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is true', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = await createWrapper(q, true);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is false', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = await createWrapper(q, false);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is not set', async () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = await createWrapper(q);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, sticky?: boolean) {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { sticky } }));
}
