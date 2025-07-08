import { Matcher, screen, userEvent, within } from './test-utils';

export async function selectCheckboxOption(id: Matcher): Promise<void> {
  expect(screen.getByLabelText(id)).toBeInTheDocument();
  await userEvent.click(screen.getByLabelText(id));
}
export async function clickButtonTimes(id: Matcher, times: number): Promise<void> {
  for (let i = 0; i < times; i++) {
    await userEvent.click(screen.getByTestId(id));
  }
}

// export async function repeatNTimes(input: string, n: number, labelText: Matcher): Promise<void> {
//   for (let i = 0; i < n; i++) {
//     await userEvent.type(screen.queryAllByLabelText(labelText)[i], input);
//     await clickButtonTimes(/-repeat-button/i, 1);
//     await userEvent.type(screen.queryAllByLabelText(labelText)[i + 1], input);
//   }
// }

export async function repeatNTimes(input: string, n: number, testId: string, labelText: Matcher): Promise<void> {
  for (let i = 0; i < n; i++) {
    const currentTestId = testId + `^${i}`;
    const textInput = getByLabelTextInsideElement(currentTestId, labelText);
    await userEvent.type(textInput, input);

    await clickButtonTimes(/-repeat-button/i, 1);

    const nextTestId = testId + `^${i + 1}`;
    const nextTextInput = getByLabelTextInsideElement(nextTestId, labelText);
    await userEvent.type(nextTextInput, input);
  }
}

export async function repeatDateTimeNTimes(
  dateLabelText: Matcher,
  hoursTestId: string,
  minutesTestId: string,
  dateString: string,
  hoursString: string,
  minutesString: string,
  n: number
): Promise<void> {
  for (let i = 0; i < n; i++) {
    const dateElement = screen.queryAllByLabelText(dateLabelText)[i];
    const hoursElement = screen.queryAllByTestId(hoursTestId)[i];
    const minutesElement = screen.queryAllByTestId(minutesTestId)[i];

    const hoursInput = hoursElement.querySelector('input');
    const minutesInput = minutesElement.querySelector('input');

    await userEvent.type(dateElement, dateString);

    if (hoursInput && minutesInput) {
      await userEvent.type(hoursInput, hoursString);
      await userEvent.type(minutesInput, minutesString);
    }

    await clickButtonTimes(/-repeat-button/i, 1);
  }
}
export async function repeatGroupNTimes(input: string, n: number, labelText: Matcher, startIndex = 0): Promise<void> {
  for (let i = startIndex; i < n; i++) {
    await userEvent.type(screen.queryAllByLabelText(labelText)[i], input);
    await userEvent.click(screen.queryAllByTestId(/-repeat-button/i)[i + 1]);
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
export async function repeatCheckboxTimes(matcher: Matcher, n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    const elm = screen.getAllByLabelText(matcher);
    await userEvent.click(elm[i]);
    await clickButtonTimes(/-repeat-button/i, 1);
  }
}
export async function repeatSliderTimes(linkId: string, n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    const elm = await screen.findByTestId(`item_${linkId}^${i}-${i}-slider-choice`);
    const itemToClick = elm.querySelectorAll('div.slider__track__step')[0];
    await userEvent.click(itemToClick);
    await clickButtonTimes(/-repeat-button/i, 1);
    const elm2 = await screen.findByTestId(`item_${linkId}^${i + 1}-${i + 1}-slider-choice`);
    const itemToClick2 = elm2.querySelectorAll('div.slider__track__step')[0];
    await userEvent.click(itemToClick2);
  }
}
export async function clickSliderValue(linkId: Matcher, index: number, sliderItemIndex: undefined | number = 0): Promise<void> {
  const elm = await screen.findByTestId(`item_${linkId}-${sliderItemIndex}-slider-choice`);
  const itemToClick = elm.querySelectorAll('div.slider__track__step')[index];
  await userEvent.click(itemToClick);
}
export async function repeatDropDownTimes(
  id: Matcher,
  n: number,
  optionName: string | RegExp | ((accessibleName: string, element: Element) => boolean) | undefined
): Promise<void> {
  for (let i = 0; i < n; i++) {
    await userEvent.selectOptions(screen.getAllByLabelText(id)[i], screen.getAllByRole('option', { name: optionName })[i]);
    await clickButtonTimes(/-repeat-button/i, 1);
    await userEvent.selectOptions(screen.getAllByLabelText(id)[i + 1], screen.getAllByRole('option', { name: optionName })[i + 1]);
  }
}
export async function typeAndTabByLabelText(id: Matcher, value: string): Promise<void> {
  await userEvent.type(screen.getByLabelText(id), value);
  await userEvent.tab();
}

export const getByLabelTextInsideElement = (elementTestId: string, labelText: Matcher): HTMLElement => {
  const elementToSearchIn = screen.getByTestId(elementTestId);
  const elementToFind = within(elementToSearchIn).getByLabelText(labelText);
  return elementToFind;
};
