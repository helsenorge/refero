import '../../util/__tests__/defineFetch';
import { vi } from 'vitest';

import type { ReferoProps } from '../../types/referoProps';
import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { getResources } from '../../../preview/resources/referoResources';
import { submitForm } from '../../../test/selectors';
import { renderRefero, screen, userEvent, waitFor } from '../../../test/test-utils';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  nextStep: 'Neste',
};

const stepExtension = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'step' }] },
};

const requiredRadio = (linkId: string): QuestionnaireItem => ({
  linkId,
  type: 'choice',
  text: 'Bor du på en annen adresse?',
  required: true,
  answerOption: [
    { valueCoding: { system: 'urn:oid:1101', code: '1', display: 'Ja' } },
    { valueCoding: { system: 'urn:oid:1101', code: '2', display: 'Nei' } },
  ],
});

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [requiredRadio('1')],
};

const stepQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    { linkId: 'step-1', type: 'group', text: 'Steg 1', extension: [stepExtension], item: [requiredRadio('1.1')] },
    { linkId: 'step-2', type: 'group', text: 'Steg 2', extension: [stepExtension], item: [requiredRadio('2.1')] },
  ],
};

const createWrapper = (q: Questionnaire, props: Partial<ReferoProps> = {}): ReturnType<typeof renderRefero> =>
  renderRefero({ questionnaire: q, props: { ...props, resources }, resources });

const placeElementsOutsideViewport = (): ReturnType<typeof vi.spyOn> =>
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ top: -5000, bottom: -4980, left: 0, right: 20, width: 20, height: 20, x: 0, y: -5000 } as DOMRect);

const scrollIntoView = vi.mocked(HTMLElement.prototype.scrollIntoView);

describe('scroll to first invalid field on submit', () => {
  let rectSpy: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(() => {
    rectSpy?.mockRestore();
    rectSpy = undefined;
  });

  it('focuses the first invalid field', async () => {
    await createWrapper(questionnaire);

    await submitForm();

    await waitFor(() => expect(screen.getAllByRole('radio')[0]).toHaveFocus());
  });

  it('scrolls the focused field into view when it is outside the viewport', async () => {
    await createWrapper(questionnaire);
    rectSpy = placeElementsOutsideViewport();

    await submitForm();

    const firstRadio = screen.getAllByRole('radio')[0];
    await waitFor(() => expect(firstRadio).toHaveFocus());
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    expect(scrollIntoView.mock.contexts).toContain(firstRadio);
  });

  it('does not scroll when the focused field is already in view', async () => {
    await createWrapper(questionnaire);

    await submitForm();

    const firstRadio = screen.getAllByRole('radio')[0];
    await waitFor(() => expect(firstRadio).toHaveFocus());
    expect(scrollIntoView.mock.contexts).not.toContain(firstRadio);
  });

  it('does not scroll when focusing errors is turned off', async () => {
    await createWrapper(questionnaire, { useFormProps: { shouldFocusError: false } });
    rectSpy = placeElementsOutsideViewport();

    await submitForm();

    expect(await screen.findByTestId('validation-summary')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')[0]).not.toHaveFocus();
    expect(scrollIntoView).not.toHaveBeenCalledWith({ block: 'center' });
  });

  it('scrolls the focused field into view when going to the next step in step view', async () => {
    await createWrapper(stepQuestionnaire);
    rectSpy = placeElementsOutsideViewport();

    await submitForm();

    const firstRadio = screen.getAllByRole('radio')[0];
    await waitFor(() => expect(firstRadio).toHaveFocus());
    expect(screen.getByText('Steg 1')).toBeInTheDocument();
    expect(scrollIntoView.mock.contexts).toContain(firstRadio);
  });

  it('scrolls the focused field into view when custom action buttons submit through reactHookFormMethods', async () => {
    await createWrapper(questionnaire, {
      renderCustomActionButtons: ({ reactHookFormMethods }) => (
        <button type="button" onClick={() => reactHookFormMethods.handleSubmit(() => {})()}>
          {'Egen send inn'}
        </button>
      ),
    });
    rectSpy = placeElementsOutsideViewport();

    await userEvent.click(screen.getByRole('button', { name: 'Egen send inn' }));

    const firstRadio = screen.getAllByRole('radio')[0];
    await waitFor(() => expect(firstRadio).toHaveFocus());
    await waitFor(() => expect(scrollIntoView.mock.contexts).toContain(firstRadio));
  });
});
