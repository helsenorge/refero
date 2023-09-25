import * as React from 'react';
// import Form from '@helsenorge/form/components/form';
import { Resources } from '../util/resources';
import { ReferoProps } from '../types/referoProps';
// import { buttonOrderStepView, buttonOrderNormalView } from '../types/formTypes/formButton';

import { useForm, SubmitHandler } from 'react-hook-form';

interface RenderFormProps {
  isAuthorized: boolean;
  isStepView: boolean;
  referoProps: ReferoProps;
  resources: Resources;
  formItemsToBeRendered: Array<JSX.Element> | JSX.Element | undefined;
  onSave: () => void;
  onSubmit: () => void;
  displayNextButton?: boolean;
  displayPreviousButton?: boolean;
  nextStep?: () => void;
  previousStep?: () => void;
}

interface IFormInput {
  example: string;
}

const RenderForm = ({
  formItemsToBeRendered,
  onSubmit,
}: RenderFormProps) => {
  const { handleSubmit } = useForm<IFormInput>();
  const onSubmitReactHookForm: SubmitHandler<IFormInput> = data => {
    console.log(data);
    onSubmit();
  };

  // const displayPauseButtonInNormalView = referoProps.onSave ? onSave : undefined;
  // const displayPauseButtonInStepView = displayPreviousButton ? previousStep : undefined;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitReactHookForm)}>
        {formItemsToBeRendered}
      </form>
    </>
  );
};

export default RenderForm;
