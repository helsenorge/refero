import { act, screen, userEvent } from '../../../../../test/test-utils';

export async function typeExtraField(value: string) {
  const extraField = screen.getByTestId(/-extra-field/i).querySelector('input');
  expect(extraField).toBeInTheDocument();
  await act(async () => {
    userEvent.clear(extraField as HTMLElement);
    userEvent.paste(extraField as HTMLElement, value);
  });
}
