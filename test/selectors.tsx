import { Matcher, act, screen, userEvent } from './test-utils';

export async function selectCheckboxOption(id: Matcher) {
  expect(screen.getByLabelText(id)).toBeInTheDocument();
  await act(async () => {
    userEvent.click(screen.getByLabelText(id));
  });
}
export async function clickButtonTimes(id: Matcher, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      userEvent.click(screen.getByTestId(id));
    });
  }
}

export async function selectDropdownOptionByName(
  dropdownId: Matcher,
  optionName: string | RegExp | ((accessibleName: string, element: Element) => boolean) | undefined
): Promise<void> {
  await act(async () => {
    userEvent.selectOptions(screen.getByLabelText(dropdownId), screen.getByRole('option', { name: optionName }) as HTMLOptionElement);
  });
}

export async function submitForm(): Promise<void> {
  await act(async () => {
    userEvent.click(screen.getByTestId('refero-submit-button'));
  });
}

export async function typeByLabelText(id: Matcher, value: string, clear?: boolean): Promise<void> {
  if (clear) {
    await act(async () => {
      userEvent.clear(screen.getByLabelText(id));
    });
  }
  await act(async () => {
    userEvent.type(screen.getByLabelText(id), value);
  });
}

export async function clickByTestId(id: Matcher): Promise<void> {
  expect(screen.getByTestId(id)).toBeInTheDocument();
  await act(async () => {
    userEvent.click(screen.getByTestId(id));
  });
}

export async function clickByLabelText(id: Matcher): Promise<void> {
  const elm = screen.getByLabelText(id);
  expect(elm).toBeInTheDocument();
  await act(async () => {
    userEvent.click(elm);
  });
}

export async function typeAndTabByLabelText(id: Matcher, value: string) {
  await act(async () => {
    userEvent.type(screen.getByLabelText(id), value);
    userEvent.tab();
  });
}
