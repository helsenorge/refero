import { screen, userEvent } from '../../../../../test/test-utils';

export async function typeExtraField(value: string): Promise<void> {
  const extraField = screen.getByTestId(/-extra-field/i).querySelector('input');
  expect(extraField).toBeInTheDocument();
  if (extraField) {
    await userEvent.clear(extraField);
    await userEvent.click(extraField);
    await userEvent.type(extraField, value);
  }
}
