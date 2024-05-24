import { act, fireEvent, screen, waitFor } from './test-utils/test-utils';

export async function inputAnswer(linkId: string, answer: number | string) {
  const id = `item_${linkId}`;
  const input = await waitFor(() => screen.getByTestId(id));
  fireEvent.change(input, { target: { value: answer } });
  fireEvent.blur(input);
}

export async function inputTextAnswer(linkId: string, answer: string) {
  const textarea = await waitFor(() => screen.getByTestId(`item_${linkId}`));
  await act(async () => {
    fireEvent.change(textarea, { target: { value: answer } });
    fireEvent.blur(textarea);
  });
}

export async function selectRadioButtonOption(linkId: string, index: number) {
  const id = `item_${linkId}-hn-${index}`;
  const input = await waitFor(() => screen.getByTestId(id));
  await act(async () => {
    fireEvent.change(input, { target: { checked: true } });
  });
}

export async function selectCheckBoxOption(linkId: string, index: string) {
  await changeCheckBoxOption(linkId, index, true);
}

export async function unSelectCheckBoxOption(linkId: string, index: string) {
  await changeCheckBoxOption(linkId, index, false);
}

export async function changeCheckBoxOption(linkId: string, index: string, on: boolean) {
  const id = `item_${linkId}-${index}`;
  const input = await waitFor(() => screen.getByTestId(id));
  await act(async () => {
    fireEvent.change(input, { target: { checked: on } });
  });
}

export async function findItem(linkId: string) {
  const id = `item_${linkId}`;
  return await waitFor(() => screen.getByTestId(id));
}
