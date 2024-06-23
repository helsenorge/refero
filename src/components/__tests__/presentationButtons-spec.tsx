import '../../util/__tests__/defineFetch';
import questionnaire from './__data__/common/';
import { Questionnaire, Extension } from 'fhir/r4';

import { Extensions } from '../../constants/extensions';
import { PresentationButtonsType } from '../../constants/presentationButtonsType';
import { renderRefero } from './test-utils/test-utils';
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
describe('component respects sdf-presentationbuttons', () => {


  it('questionnaire without presentationbuttons default to sticky, when sticky is set to true', () => {
    const { container } = createWrapper(questionnaire, true);
    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
  });

  it('questionnaire without presentationbuttons default to non-sticky, when sticky is set to false', () => {
    const { container } = createWrapper(questionnaire, false);
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire without presentationbuttons default to non-sticky, when sticky is not set', () => {
    const { container } = createWrapper(questionnaire);
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is true', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = createWrapper(q, true);
    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is false', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = createWrapper(q, false);

    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = none, should be none even when sticky is not set', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.None)],
    };

    const { container } = createWrapper(q);

    expect(container.querySelector('.page_refero__hidden_buttons')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is true', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = createWrapper(q, true);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is false', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = createWrapper(q, false);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = static, should be static even when sticky is not set', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Static)],
    };

    const { container } = createWrapper(q);

    expect(container.querySelector('.page_refero__stickybar')).not.toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is true', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = createWrapper(q, true);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is false', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = createWrapper(q, false);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });

  it('questionnaire with presentationbuttons = sticky, should be sticky even when sticky is not set', () => {
    const q: Questionnaire = {
      ...questionnaire,
      extension: [...(questionnaire.extension ?? []), createExtension(PresentationButtonsType.Sticky)],
    };

    const { container } = createWrapper(q);

    expect(container.querySelector('.page_refero__stickybar')).toBeInTheDocument();
    expect(container.querySelector('.page_refero__hidden_buttons')).not.toBeInTheDocument();
  });
});

function createWrapper(questionnaire: Questionnaire, sticky?: boolean) {
  return renderRefero({ questionnaire, props: { sticky } });
}
