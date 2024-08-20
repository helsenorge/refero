import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { act, findByRole, renderRefero, userEvent, waitFor } from '@test/test-utils.tsx';
import { q } from './__data__/time';
import { ReferoProps } from '../../../../types/referoProps';
import { Extensions } from '../../../../constants/extensions';
import { clickButtonTimes, submitForm } from '../../../../../test/selectors';
import { getResources } from '../../../../../preview/resources/referoResources';
import { vi } from 'vitest';
import { screen } from '@testing-library/dom';

const resources = {
  ...getResources(''),
  formRequiredErrorMessage: 'Du må fylle ut dette feltet',
  oppgiGyldigVerdi: 'ikke gyldig tall',
  dateError_invalid: 'Ugyldig dato',
  errorBeforeMinDate: 'Dato kan ikke være før minimums dato',
  errorAfterMaxDate: 'Dato kan ikke være etter maksimum dato',
  dateError_time_invalid: 'Ugyldig klokkeslett',
};

describe('Time', () => {
  describe('Render', () => {
    it('Should render as text if props.pdf', async () => {
      const { getByText } = createWrapper(q, { pdf: true });
      const spanElement = getByText(/, kl\./i);
      expect(spanElement).toBeInTheDocument();
    });
    it('Should render text if item is readonly', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, readOnly: true })),
      };
      const { getByText } = createWrapper(questionnaire, { pdf: true });
      const spanElement = getByText(/, kl\./i);
      expect(spanElement).toBeInTheDocument();
    });
    it('Should render as input if props.pdf === false && item is not readonly', () => {
      const { queryByText } = createWrapper(q);
      expect(queryByText(/, kl\./i)).not.toBeInTheDocument();
    });
  });
  describe('initialvalue', () => {
    it('Initial value should not be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      expect(getByLabelText(/Klokkeslett/i)).toHaveValue(null);
    });
    it('Initial value should be set', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({
          ...x,
          repeats: false,
          initial: [
            {
              valueTime: '14:30:00',
            },
          ],
        })),
      };
      const { getByLabelText } = createWrapper(questionnaire);

      const minutesElement = await screen.findByTestId('time-2');

      const hoursInput = getByLabelText(/Klokkeslett/i);
      const minutesInput = minutesElement.querySelector('input');

      screen.debug();

      expect(hoursInput).toHaveValue(Number('14'));
      expect(minutesInput).toHaveValue(Number('30'));
    });
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await act(async () => {
          userEvent.click(helpButton);
        });
      }

      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };

      const { getByTestId } = createWrapper(questionnaire);
      const repeatButton = getByTestId(/-repeat-button/i);
      expect(repeatButton).toBeInTheDocument();
    });

    it('Should not render repeat button if item does not repeats', () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: false })),
      };
      const { queryByTestId } = createWrapper(questionnaire);
      const repeatButton = queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
        extension: q.extension?.map(y => {
          if (y.url === Extensions.MIN_OCCURS_URL) {
            return { ...y, valueInteger: 2 };
          }
          return y;
        }),
      };
      const { queryAllByLabelText, queryByTestId } = createWrapper(questionnaire);
      await clickButtonTimes(/-repeat-button/i, 3);

      expect(queryAllByLabelText(/Klokkeslett/i)).toHaveLength(4);
      expect(queryByTestId(/-repeat-button/i)).not.toBeInTheDocument();
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryAllByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 2);

      expect(queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { queryByTestId } = createWrapper(questionnaire);

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
    it('Should show confirmationbox when deletebutton is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      expect(getByTestId(/-delete-confirm-modal/i)).toBeInTheDocument();
    });
    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...q,
        item: q.item?.map(x => ({ ...x, repeats: true })),
      };
      const { getByTestId, queryByTestId } = createWrapper(questionnaire);

      await clickButtonTimes(/-repeat-button/i, 1);

      expect(getByTestId(/-delete-button/i)).toBeInTheDocument();
      await clickButtonTimes(/-delete-button/i, 1);

      const confirmModal = getByTestId(/-delete-confirm-modal/i);
      await act(async () => {
        userEvent.click(await findByRole(confirmModal, 'button', { name: /Forkast endringer/i }));
      });

      expect(queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });
  });
  describe('onChange', () => {
    it('Should update hour field with value from answer', async () => {
      const { getByLabelText } = createWrapper(q);

      const hoursElement = getByLabelText(/Klokkeslett/i);

      expect(hoursElement).toBeInTheDocument();
      expect(hoursElement).toHaveAttribute('type', 'number');
      expect(hoursElement).toHaveAttribute('id', `item_${q?.item?.[0].linkId}^0-datetime-hours`);
      await act(async () => {
        userEvent.paste(hoursElement, '14');
      });

      expect(hoursElement).toHaveValue(Number('14'));
    });
    it('Should update minutes field with value from answer', async () => {
      const { getByTestId } = createWrapper(q);

      const minutesElement = getByTestId('time-2');
      const minutesInput = minutesElement.querySelector('input');

      if (minutesInput) {
        await act(async () => {
          userEvent.paste(minutesInput, '30');
        });
      }

      expect(minutesInput).toHaveValue(Number('30'));
    });
    it('Should call onChange with correct value when date field changes', async () => {
      const onChange = vi.fn();
      const { getByLabelText, getByTestId } = createWrapper(q, { onChange });

      const hoursElement = getByLabelText(/Klokkeslett/i);
      const minutesElement = getByTestId('time-2');
      const minutesInput = minutesElement.querySelector('input');

      expect(hoursElement).toBeInTheDocument();
      expect(minutesElement).toBeInTheDocument();

      await act(async () => {
        userEvent.paste(hoursElement, '14');
      });

      if (minutesInput) {
        await act(async () => {
          userEvent.paste(minutesInput, '30');
        });
      }

      const expectedAnswer: QuestionnaireResponseItemAnswer = {
        valueTime: '14:30:00',
      };
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), expectedAnswer, expect.any(Object), expect.any(Object));
    });
  });
  describe('Validation', () => {
    describe('Required', () => {
      it('Should show error if field is required and value is empty', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByText } = createWrapper(questionnaire);
        await submitForm();

        expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();
      });
      it('Should not show error if required and has value', async () => {
        const questionnaire: Questionnaire = {
          ...q,
          item: q.item?.map(x => ({ ...x, required: true })),
        };
        const { getByLabelText, queryByText, getByTestId } = createWrapper(questionnaire);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await act(async () => {
          userEvent.type(hoursElement, '14');
        });
        if (minutesInput) {
          await act(async () => {
            userEvent.paste(minutesInput, '30');
          });
        }

        await submitForm();

        expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      });
      // it('Should remove error on change if form is submitted', async () => {
      //   const questionnaire: Questionnaire = {
      //     ...q,
      //     item: q.item?.map(x => ({ ...x, required: true })),
      //   };
      //   const { getByText, queryByText, getByLabelText, getByTestId } = createWrapper(questionnaire);
      //   await submitForm();
      //   expect(getByText(resources.formRequiredErrorMessage)).toBeInTheDocument();

      //   const hoursElement = getByLabelText(/Klokkeslett/i);
      //   const minutesElement = getByTestId('time-2');
      //   const minutesInput = minutesElement.querySelector('input');

      //   await act(async () => {
      //     userEvent.type(hoursElement, '14');
      //   });
      //   if (minutesInput) {
      //     await act(async () => {
      //       userEvent.paste(minutesInput, '30');
      //       userEvent.tab();
      //     });
      //   }

      //   await waitFor(() => {
      //     expect(queryByText(resources.formRequiredErrorMessage)).not.toBeInTheDocument();
      //   });
      // });
      it('Should show error if hour value is invalid', async () => {
        const { getByLabelText, getByText } = createWrapper(q);

        await act(async () => {
          userEvent.paste(getByLabelText(/Klokkeslett/i), '99');
        });

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error if minute value is invalid', async () => {
        const { getByLabelText, getByText, getByTestId } = createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await act(async () => {
          userEvent.type(hoursElement, '14');
        });
        if (minutesInput) {
          await act(async () => {
            userEvent.paste(minutesInput, '99');
          });
        }

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      it('Should show error message if hour value is lesser than min value', async () => {
        const { getByTestId, getByLabelText, getByText } = createWrapper(q);

        const hoursElement = getByLabelText(/Klokkeslett/i);
        const minutesElement = getByTestId('time-2');
        const minutesInput = minutesElement.querySelector('input');

        await act(async () => {
          userEvent.paste(hoursElement, '14');
        });
        if (minutesInput) {
          await act(async () => {
            userEvent.paste(minutesInput, '20');
          });
        }

        await submitForm();
        expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      });
      // it('Should show error message for max value', async () => {
      //   const { getByLabelText, getByText } = createWrapper(qMinMax);

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.2095');
      //   });

      //   await submitForm();
      //   expect(getByText(resources.errorAfterMaxDate + ': 31.05.2094')).toBeInTheDocument();
      // });
      // it('Should show custom error message for min value', async () => {
      //   const { getByLabelText, getByText } = createWrapper(qMinMaxCustomError);

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.1904');
      //   });

      //   await submitForm();
      //   expect(getByText('Custom errormessage')).toBeInTheDocument();
      // });
      // it('Should show custom error message for max value', async () => {
      //   const { getByLabelText, getByText } = createWrapper(qMinMaxCustomError);

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.2095');
      //   });

      //   await submitForm();
      //   expect(getByText('Custom errormessage')).toBeInTheDocument();
      // });
      // it('Should not show error if date value is between min value and max value', async () => {
      //   const { getByLabelText, queryByText } = createWrapper(qMinMax);

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.2024');
      //   });

      //   await submitForm();
      //   expect(queryByText(resources.errorBeforeMinDate + ': 31.05.1994')).not.toBeInTheDocument();
      //   expect(queryByText(resources.errorAfterMaxDate + ': 31.05.2094')).not.toBeInTheDocument();
      // });
      // it('Should show error if hour value is invalid', async () => {
      //   const { getByText, getByLabelText } = createWrapper(qMinMax);

      //   const hoursElement = await screen.findByTestId('datetime-1');
      //   const minutesElement = await screen.findByTestId('datetime-2');
      //   const hoursInput = hoursElement.querySelector('input');
      //   const minutesInput = minutesElement.querySelector('input');

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.1994');
      //   });
      //   await act(async () => {
      //     hoursInput && userEvent.paste(hoursInput, '90');
      //   });
      //   await act(async () => {
      //     minutesInput && userEvent.paste(minutesInput, '00');
      //   });

      //   await submitForm();
      //   await waitFor(() => {
      //     expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      //   });
      // });
      // it('Should show error if minutes value is invalid', async () => {
      //   const { getByText, getByLabelText } = createWrapper(qMinMax);

      //   const hoursElement = await screen.findByTestId('datetime-1');
      //   const minutesElement = await screen.findByTestId('datetime-2');
      //   const hoursInput = hoursElement.querySelector('input');
      //   const minutesInput = minutesElement.querySelector('input');

      //   await act(async () => {
      //     userEvent.paste(getByLabelText(/Dato/i), '31.05.1994');
      //   });
      //   await act(async () => {
      //     hoursInput && userEvent.paste(hoursInput, '00');
      //   });
      //   await act(async () => {
      //     minutesInput && userEvent.paste(minutesInput, '90');
      //   });

      //   await submitForm();
      //   await waitFor(() => {
      //     expect(getByText(resources.dateError_time_invalid)).toBeInTheDocument();
      //   });
      // });
    });
  });
});

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return renderRefero({ questionnaire, props: { ...props, resources } });
};
