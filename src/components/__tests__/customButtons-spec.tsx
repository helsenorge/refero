import '../../util/__tests__/defineFetch';
import type { ReferoProps } from '@/types/referoProps';
import type { Questionnaire } from 'fhir/r4';

import standard from './__data__/customActionButtons/standard';
import stepView from './__data__/customActionButtons/stepview';
import { renderRefero, screen, waitFor } from '../../../test/test-utils';


describe('render custom actionbuttons', async () => {
  describe('standard', () => {
    it('should render custom buttons when prop != undefined', async () => {
      await createWrapper(standard, () => {
        return <div data-testid="custom-buttons">{'Custom Action Buttons'}</div>;
      });
      expect(await screen.findByTestId(/custom-buttons/i)).toBeInTheDocument();
    });
    it('should render rended standard buttons when prop == undefined', async () => {
      await createWrapper(standard);
      expect(screen.queryByTestId(/custom-buttons/i)).not.toBeInTheDocument();
    });
  });
  describe('stepview', () => {
    it('should render custom buttons when prop != undefined', async () => {
      await createWrapper(stepView, () => {
        return <div data-testid="custom-buttons">{'Custom Action Buttons'}</div>;
      });
      expect(await screen.findByTestId(/custom-buttons/i)).toBeInTheDocument();
    });
    it('should render rended standard buttons when prop == undefined', async () => {
      await createWrapper(stepView);
      expect(screen.queryByTestId(/custom-buttons/i)).not.toBeInTheDocument();
    });
  });
  describe('handle submit form with custom buttons', () => {
    it('should call onSubmit when custom button is clicked', async () => {
      const onSubmit = vi.fn();
      await createWrapper(standard, () => {
        return (
          <div>
            <button data-testid="custom-submit-button" onClick={onSubmit}>
              {'Custom Submit Button'}
            </button>
          </div>
        );
      });
      const submitButton = await screen.findByTestId(/custom-submit-button/i);
      submitButton.click();
      expect(onSubmit).toHaveBeenCalled();
    });
    it('should call react hook form methods when react hook form methods is called', async () => {
      const onSubmit = vi.fn();
      await createWrapper(
        standard,
        ({ reactHookFormMethods, referoProps }) => {
          return (
            <div>
              <button
                data-testid="custom-submit-button"
                onClick={
                  //@ts-expect-error - reactHookFormMethods.handleSubmit is not a function
                  reactHookFormMethods.handleSubmit(referoProps.onSubmit())
                }
              >
                {'Custom Submit Button'}
              </button>
            </div>
          );
        },
        onSubmit
      );
      const submitButton = await screen.findByTestId(/custom-submit-button/i);
      await waitFor(async () => {
        submitButton.click();
      });
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function createWrapper(
  questionnaire: Questionnaire,
  renderCustomActionButtons?: Partial<ReferoProps>['renderCustomActionButtons'],
  onSubmit: ReferoProps['onSubmit'] = vi.fn()
) {
  return await renderRefero({
    questionnaire,
    props: {
      renderCustomActionButtons,
      onSubmit,
    },
  });
}
