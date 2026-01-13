import '../../util/__tests__/defineFetch';
import { vi } from 'vitest';

import type { ReferoProps } from '../../types/referoProps';
import type { Questionnaire } from 'fhir/r4';

import StepViewQuestionnaire from './__data__/stepview';
import NormalFormViewQuestionnaire from './__data__/normalformview';
import { submitForm } from '../../../test/selectors';
import { renderRefero } from '../../../test/test-utils';

const onFormViewChangeMock = vi.fn();

const createWrapper = (questionnaire: Questionnaire, props: Partial<ReferoProps> = {}): ReturnType<typeof renderRefero> => {
  return renderRefero({
    questionnaire,
    props: {
      onFormViewChange: onFormViewChangeMock,
      ...props,
    },
  });
};

describe('useFormViewChange hook', () => {
  describe('useFormViewChange in step view', () => {
    it('Should not call onFormViewChange if it is not defined', async () => {
      createWrapper(StepViewQuestionnaire, { onFormViewChange: undefined });
      await submitForm();
      expect(onFormViewChangeMock).not.toHaveBeenCalled();
    });

    it('Should call onFormViewChange on first render and when step updates', async () => {
      createWrapper(StepViewQuestionnaire);
      expect(onFormViewChangeMock).toHaveBeenCalled();
      await submitForm();
      expect(onFormViewChangeMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('useFormViewChange in normal form view', () => {
    it('Should not call onFormViewChange if it is not defined', async () => {
      createWrapper(NormalFormViewQuestionnaire, { onFormViewChange: undefined });
      expect(onFormViewChangeMock).not.toHaveBeenCalled();
    });

    it('Should call onFormViewChange on first render', async () => {
      createWrapper(NormalFormViewQuestionnaire);
      expect(onFormViewChangeMock).toHaveBeenCalled();
    });
  });
});
