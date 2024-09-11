import { renderRefero, userEvent } from '@test/test-utils.tsx';
import { q } from './__data__/';
import { ReferoProps } from '@/types/referoProps';
import { getResources } from '../../../../preview/resources/referoResources';
import { Questionnaire } from 'fhir/r4';
import { submitForm } from '@test/selectors';
const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet' };

describe('Validation-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should show validation summary when submitting form with invalid data', async () => {
    const { getByTestId } = createWrapper(q);
    await submitForm();
    expect(getByTestId(/validation-summary/i)).toBeInTheDocument();
  });
  it('should scroll to validation summary when submitting form with invalid data', async () => {
    createWrapper(q);
    await submitForm();
    expect(window.HTMLElement.prototype.scrollIntoView).toBeCalledTimes(1);
  });
  it('should scroll to selected field when button in error summary is clicked', async () => {
    const { queryAllByTestId, getByTestId, getByLabelText } = createWrapper(q);
    await submitForm();
    const errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);
    await userEvent.click(getByTestId('summary-button-Textarea'));
    expect(getByLabelText('Textarea')).toHaveFocus();
  });
  it('should show error message for each invalid field', async () => {
    const { queryAllByTestId } = createWrapper(q);
    await submitForm();
    const errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);
  });
  it('should remove the errors from the summary if a field changes to valid', async () => {
    const { queryAllByTestId, getByTestId } = createWrapper(q);
    await submitForm();
    const errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);

    await userEvent.type(getByTestId('item_ab1bb454-3697-4def-81da-77c565a5c1e4-string-label'), 'abc');
    const errorArrayAfter = queryAllByTestId(/summary-element-/i);

    expect(errorArrayAfter).toHaveLength(5);
  });
  it('should add an error to the summary if a repeatable field is added', async () => {
    const { queryAllByTestId, getByTestId } = createWrapper(q);
    await submitForm();

    const errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);

    await userEvent.type(getByTestId('item_98e87a24-a6ef-425f-8534-1c4032828b5f^0-integer-label'), '12');
    await userEvent.click(getByTestId('98e87a24-a6ef-425f-8534-1c4032828b5f-repeat-button'));

    await submitForm();
    const errorArrayAfter = queryAllByTestId(/summary-element-/i);

    expect(errorArrayAfter).toHaveLength(7);
  });
  it('should work with the extra input field on open choice', async () => {
    const { queryAllByTestId, getByTestId } = createWrapper(q);
    await submitForm();

    let errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);

    await userEvent.click(getByTestId('item_b0c2cb74-2ffd-45ad-9c37-31be5e5b1548-3-radio-open-choice-label'));

    errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(5);
    await submitForm();
    errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(6);

    await userEvent.type(getByTestId('item_b0c2cb74-2ffd-45ad-9c37-31be5e5b1548-label'), 'abc');
    errorArray = queryAllByTestId(/summary-element-/i);
    expect(errorArray).toHaveLength(5);
  });
});
function createWrapper(questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) {
  return renderRefero({ questionnaire, props, resources });
}
