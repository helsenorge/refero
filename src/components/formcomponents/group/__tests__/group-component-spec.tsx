import '../../../../util/__tests__/defineFetch';
import { renderRefero, screen, userEvent, waitFor } from '@test/test-utils.tsx';
import { Questionnaire } from 'fhir/r4';

import { ReferoProps } from '../../../../types/referoProps';

import { repeatQ, q, repeatQ2 } from './__data__';
import { getResources } from '../../../../../preview/resources/referoResources';
import { clickButtonTimes, repeatGroupNTimes } from '../../../../../test/selectors';
import Constants from '../../../../constants';
import { Extensions } from '../../../../constants/extensions';

const resources = { ...getResources(''), formRequiredErrorMessage: 'Du må fylle ut dette feltet', oppgiGyldigVerdi: 'ikke gyldig tall' };

describe('group', () => {
  it('should render correct tag', async () => {
    await createWrapper(q);
    const group = screen.queryByRole('heading', { name: 'Overskrift', level: Constants.DEFAULT_HEADER_TAG });
    expect(group).toBeInTheDocument();
  });
  describe('help button', () => {
    it('Should render helpButton', async () => {
      const { container } = await createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();
    });
    it('Should render helpElement when helpbutton is clicked', async () => {
      const { container } = await createWrapper(q);

      expect(container.querySelector('.page_refero__helpButton')).toBeInTheDocument();

      expect(container.querySelector('.page_refero__helpComponent--open')).not.toBeInTheDocument();

      const helpButton = container.querySelector('.page_refero__helpButton');
      if (helpButton) {
        await userEvent.click(helpButton);
      }
      expect(container.querySelector('.page_refero__helpComponent--open')).toBeInTheDocument();
    });
  });
  describe('repeat button', () => {
    it('Should render repeat button if item repeats', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({ ...x, repeats: true })),
      };

      await createWrapper(questionnaire);
      const repeatButton = screen.getAllByTestId(/-repeat-button/i);
      expect(repeatButton).toHaveLength(2);
    });

    it('Should not render repeat button if item does not repeats', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({ ...x, repeats: false, item: x.item?.map(y => ({ ...y, repeats: false })) })),
      };
      await createWrapper(questionnaire);
      const repeatButton = screen.queryByTestId(/-repeat-button/i);
      expect(repeatButton).not.toBeInTheDocument();
    });
    it('Should add item when repeat is clicked and remove button when maxOccurance(4) is reached', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({
          ...x,
          repeats: true,
          extension: repeatQ.extension
            ? [...repeatQ.extension, { url: Extensions.MAX_OCCURS_URL, valueInteger: 4 }]
            : [{ url: Extensions.MAX_OCCURS_URL, valueInteger: 4 }],
        })),
      };
      await createWrapper(questionnaire);
      const input = '5';
      await repeatGroupNTimes(input, 4, /REPEATABLE INT/i);

      expect(screen.queryAllByText(/REPEATABLE INT/i)).toHaveLength(4);
      expect(screen.queryAllByTestId(/-repeat-button/i)).toHaveLength(4);
    });
  });
  describe('delete button', () => {
    it('Should render delete button if item repeats and number of repeated items is greater than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({
          ...x,
          repeats: true,
          readOnly: false,
          extension: repeatQ.extension
            ? [...repeatQ.extension, { url: Extensions.MIN_OCCURS_URL, valueInteger: 2 }]
            : [{ url: Extensions.MIN_OCCURS_URL, valueInteger: 2 }],
        })),
      };
      await createWrapper(questionnaire);
      const input = '5';
      await repeatGroupNTimes(input, 3, /REPEATABLE INT/i);

      expect(screen.queryAllByTestId(/-delete-button/i)).toHaveLength(2);
    });
    it('Should not render delete button if item repeats and number of repeated items is lower or equal than minOccurance(2)', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({
          ...x,
          repeats: true,
          readOnly: false,
          extension: repeatQ.extension
            ? [...repeatQ.extension, { url: Extensions.MIN_OCCURS_URL, valueInteger: 2 }]
            : [{ url: Extensions.MIN_OCCURS_URL, valueInteger: 2 }],
        })),
      };
      await createWrapper(questionnaire);
      const input = '5';
      await repeatGroupNTimes(input, 1, /REPEATABLE INT/i);
      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });

    it('Should remove item when delete button is clicked', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ,
        item: repeatQ.item?.map(x => ({ ...x, repeats: true })),
      };
      await createWrapper(questionnaire);
      const input = '5';
      await repeatGroupNTimes(input, 1, /REPEATABLE INT/i);
      await clickButtonTimes(/-delete-button/i, 1);

      expect(screen.queryByTestId(/-delete-button/i)).not.toBeInTheDocument();
    });

    it('Should show horizontal separation line between repeated groups', async () => {
      const questionnaire: Questionnaire = {
        ...repeatQ2,
        item: repeatQ2.item?.map(x => ({
          ...x,
          repeats: true,
          readOnly: false,
        })),
      };
      await createWrapper(questionnaire);
      const input = '5';

      //Type in the first integer field
      await userEvent.type(screen.queryAllByLabelText(/REPEATABLE INT/i)[0], input);
      //Click the second repeat button to repeat the group
      await userEvent.click(screen.queryAllByTestId(/-repeat-button/i)[1]);

      expect(screen.getByTestId('group-seperator')).toBeInTheDocument();
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createWrapper = async (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}) => {
  return await waitFor(async () => await renderRefero({ questionnaire, props: { ...props, resources } }));
};
