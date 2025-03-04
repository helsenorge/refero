import { submitForm } from '@test/selectors';
import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';

import { q } from './__data__/';
import { getResources } from '../../../../preview/resources/referoResources';

import { ReferoProps } from '@/types/referoProps';
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Validation-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should show validation summary when submitting form with invalid data', async () => {
    await createWrapper(q);
    await submitForm();
    expect(screen.getByTestId(/validation-summary/i)).toBeInTheDocument();
  });
  it('should not show validation summary when submitting form with invalid data and hideValidationSummary is true', async () => {
    await createWrapper(q, { hideValidationSummary: true });
    await submitForm();
    expect(screen.queryByTestId(/validation-summary/i)).not.toBeInTheDocument();
  });
  it('should scroll to validation summary when submitting form with invalid data', async () => {
    await createWrapper(q);
    await submitForm();
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalledTimes(1);
  });
  it('should scroll to selected field when button in error summary is clicked', async () => {
    await createWrapper(q);
    await submitForm();
    const errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);
    await userEvent.click(screen.getByTestId('summary-button-Textarea'));
    expect(screen.getByLabelText('Textarea')).toHaveFocus();
  });
  it('should show error message for each invalid field', async () => {
    await createWrapper(q);
    await submitForm();
    const errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);
  });
  it('should remove the errors from the summary if a field changes to valid', async () => {
    await createWrapper(q);
    await submitForm();
    const errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);

    await userEvent.type(screen.getByTestId('item_ab1bb454-3697-4def-81da-77c565a5c1e4-string-label'), 'abc');
    const errorArrayAfter = screen.queryAllByTestId(/summary-element-/i);

    expect(errorArrayAfter).toHaveLength(6);
  });
  it('should add an error to the summary if a repeatable field is added', async () => {
    await createWrapper(q);
    await submitForm();

    const errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);

    await userEvent.type(screen.getByTestId('item_98e87a24-a6ef-425f-8534-1c4032828b5f^0-integer-label'), '12');
    await userEvent.click(screen.getByTestId('98e87a24-a6ef-425f-8534-1c4032828b5f-repeat-button'));

    await submitForm();
    const errorArrayAfter = screen.queryAllByTestId(/summary-element-/i);

    expect(errorArrayAfter).toHaveLength(8);
  });
  it('should work with the extra input field on open choice', async () => {
    await createWrapper(q);
    await submitForm();

    let errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);

    await userEvent.click(screen.getByTestId('item_b0c2cb74-2ffd-45ad-9c37-31be5e5b1548-3-radio-open-choice-label'));

    errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);
    await submitForm();
    errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(7);

    await userEvent.type(screen.getByTestId('item_b0c2cb74-2ffd-45ad-9c37-31be5e5b1548-label'), 'abc');
    await userEvent.type(screen.getByLabelText(/PERIOD-EMAIL/i), '123');
    await submitForm();
    errorArray = screen.queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return await waitFor(async () => await renderRefero({ questionnaire, props, resources }));
}
