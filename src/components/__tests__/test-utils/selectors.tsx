import { Matcher, act, screen, userEvent } from './test-utils';

export async function selectCheckboxOption(id: Matcher) {
  expect(screen.getByLabelText(id)).toBeInTheDocument();
  await act(async () => {
    userEvent.click(screen.getByLabelText(id));
  });
}
export async function clickButtonTimes(id: Matcher, times: number) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      userEvent.click(screen.getByTestId(id));
    });
  }
}

export async function selectDropdownOptionByName(
  dropdownId: Matcher,
  optionName: string | RegExp | ((accessibleName: string, element: Element) => boolean) | undefined
) {
  await act(async () => {
    userEvent.selectOptions(screen.getByLabelText(dropdownId), screen.getByRole('option', { name: optionName }) as HTMLOptionElement);
  });
}

export async function submitForm() {
  await act(async () => {
    userEvent.click(screen.getByTestId('refero-submit-button'));
  });
}

export async function typeByLabelText(id: Matcher, value: string, clear?: boolean) {
  if (clear) {
    await act(async () => {
      userEvent.clear(screen.getByLabelText(id));
    });
  }
  await act(async () => {
    userEvent.type(screen.getByLabelText(id), value);
  });
}
