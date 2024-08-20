import { Matcher, screen, userEvent } from './test-utils';

export async function selectCheckboxOption(id: Matcher): Promise<void> {
  expect(screen.getByLabelText(id)).toBeInTheDocument();
  await userEvent.click(screen.getByLabelText(id));
}
export async function clickButtonTimes(id: Matcher, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    await userEvent.click(screen.getByTestId(id));
  }
}

export async function selectDropdownOptionByName(
  dropdownId: Matcher,
  optionName: string | RegExp | ((accessibleName: string, element: Element) => boolean) | undefined
): Promise<void> {
  await userEvent.selectOptions(screen.getByLabelText(dropdownId), screen.getByRole('option', { name: optionName }));
}

export async function submitForm(): Promise<void> {
  await userEvent.click(screen.getByTestId('refero-submit-button'));
}

export async function typeByLabelText(id: Matcher, value: string, clear?: boolean): Promise<void> {
  if (clear) {
    await userEvent.clear(screen.getByLabelText(id));
  }
  await userEvent.type(screen.getByLabelText(id), value);
}

export async function clickByTestId(id: Matcher): Promise<void> {
  expect(screen.getByTestId(id)).toBeInTheDocument();
  await userEvent.click(screen.getByTestId(id));
}

export async function clickByLabelText(id: Matcher): Promise<void> {
  const elm = screen.getByLabelText(id);
  expect(elm).toBeInTheDocument();
  await userEvent.click(elm);
}

export async function typeAndTabByLabelText(id: Matcher, value: string): Promise<void> {
  await userEvent.type(screen.getByLabelText(id), value);
  await userEvent.tab();
}
