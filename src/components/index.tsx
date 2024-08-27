import React from 'react';

import { PresentationButtonsType } from '@constants/presentationButtonsType';

import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ReferoProps } from '@/types/referoProps';

import RenderForm from './renderForm';
import StepView from './stepView';

import { GlobalState } from '@/reducers';
import { getFormDefinition, getFormData } from '@/reducers/form';
import { FormDefinition, FormData } from '@/reducers/form';

import { getPresentationButtonsExtension } from '@/util/extension';
import { IE11HackToWorkAroundBug187484 } from '@/util/hacks';

import { shouldFormBeDisplayedAsStepView } from '@/util/shouldFormBeDisplayedAsStepView';
import { createIntitialFormValues } from '@/validation/defaultFormValues';
import { ExternalRenderProvider } from '@/context/externalRenderContext';
import { setSkjemaDefinition } from '@/actions/form';
import { AttachmentProvider } from '@/context/AttachmentContext';
import GenerateQuestionnaireComponents from './GenerateQuestionnaireComponents';

const Refero = (props: ReferoProps): JSX.Element | null => {
  IE11HackToWorkAroundBug187484();
  const dispatch = useDispatch();
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const formData = useSelector<GlobalState, FormData | null>((state: GlobalState) => getFormData(state));
  const questionnaire = formDefinition?.Content;
  // const schema = createZodSchemaFromQuestionnaire(questionnaire, props.resources, questionnaire?.contained);
  const defualtVals = React.useMemo(() => createIntitialFormValues(questionnaire?.item), [questionnaire?.item?.length]);

  const methods = useForm({
    defaultValues: defualtVals,
    shouldFocusError: false,
    criteriaMode: 'all',
    // resolver: async (data, context, options) => {
    //   // you can debug your validation schema here
    //   console.log('resolver in data', data);
    //   console.log('resolver validation result', await zodResolver(schema)(data, context, options));
    //   return zodResolver(schema)(data, context, options);
    // },
  });

  React.useEffect(() => {
    if (props.questionnaire) {
      dispatch(setSkjemaDefinition(props.questionnaire, props.questionnaireResponse, props.language, props.syncQuestionnaireResponse));
    }
  }, []);

  const handleSubmit = (): void => {
    const { onSubmit } = props;

    if (formData && formData.Content && onSubmit) {
      onSubmit(formData.Content);
    }
  };

  const handleSave = (): void => {
    if (props.onSave && formData?.Content) {
      props.onSave(formData.Content);
    }
  };

  const getButtonClasses = (
    presentationButtonsType: PresentationButtonsType | null,
    defaultClasses: string[] = [],
    sticky: boolean | undefined
  ): string => {
    const classes = [...defaultClasses];

    if (presentationButtonsType === PresentationButtonsType.None) {
      classes.push('page_refero__hidden_buttons');
    } else if (presentationButtonsType === PresentationButtonsType.Sticky || (sticky && !presentationButtonsType)) {
      classes.push('page_refero__stickybar');
    }

    return classes.join(' ');
  };

  const { resources, authorized } = props;

  if (!formDefinition || !formDefinition.Content || !resources) {
    return null;
  }

  if (props.pdf) {
    return (
      <ExternalRenderProvider
        onRequestHelpButton={props.onRequestHelpButton}
        onRequestHelpElement={props.onRequestHelpElement}
        onRenderMarkdown={props.onRenderMarkdown}
        fetchReceivers={props.fetchReceivers}
        fetchValueSet={props.fetchValueSet}
        onFieldsNotCorrectlyFilledOut={props.onFieldsNotCorrectlyFilledOut}
        onStepChange={props.onStepChange}
        promptLoginMessage={props.promptLoginMessage}
        resources={resources}
        autoSuggestProps={props.autoSuggestProps}
        validateScriptInjection={props.validateScriptInjection}
      >
        <AttachmentProvider
          attachmentErrorMessage={props.attachmentErrorMessage}
          attachmentMaxFileSize={props.attachmentMaxFileSize}
          attachmentValidTypes={props.attachmentValidTypes}
          onDeleteAttachment={props.onDeleteAttachment}
          onRequestAttachmentLink={props.onRequestAttachmentLink}
          onOpenAttachment={props.onOpenAttachment}
          uploadAttachment={props.uploadAttachment}
        >
          <FormProvider {...methods}>
            <GenerateQuestionnaireComponents items={questionnaire?.item} pdf={true} />
          </FormProvider>
        </AttachmentProvider>
      </ExternalRenderProvider>
    );
  }

  const presentationButtonsType = getPresentationButtonsExtension(formDefinition.Content);
  const isStepView = shouldFormBeDisplayedAsStepView(formDefinition);

  return (
    <div className={getButtonClasses(presentationButtonsType, ['page_refero__content'], props.sticky)}>
      <div className="page_refero__messageboxes" />
      <ExternalRenderProvider
        onRequestHelpButton={props.onRequestHelpButton}
        onRequestHelpElement={props.onRequestHelpElement}
        onRenderMarkdown={props.onRenderMarkdown}
        fetchReceivers={props.fetchReceivers}
        fetchValueSet={props.fetchValueSet}
        onFieldsNotCorrectlyFilledOut={props.onFieldsNotCorrectlyFilledOut}
        onStepChange={props.onStepChange}
        promptLoginMessage={props.promptLoginMessage}
        resources={resources}
        autoSuggestProps={props.autoSuggestProps}
        validateScriptInjection={props.validateScriptInjection}
        onChange={props.onChange}
      >
        <AttachmentProvider
          attachmentErrorMessage={props.attachmentErrorMessage}
          attachmentMaxFileSize={props.attachmentMaxFileSize}
          attachmentValidTypes={props.attachmentValidTypes}
          onDeleteAttachment={props.onDeleteAttachment}
          onRequestAttachmentLink={props.onRequestAttachmentLink}
          onOpenAttachment={props.onOpenAttachment}
          uploadAttachment={props.uploadAttachment}
        >
          <FormProvider {...methods}>
            {isStepView ? (
              <StepView
                isAuthorized={authorized}
                referoProps={props}
                resources={resources}
                onSave={handleSave}
                onSubmit={handleSubmit}
                methods={methods}
              />
            ) : (
              <RenderForm
                isAuthorized={authorized}
                isStepView={false}
                referoProps={props}
                resources={resources}
                onSave={handleSave}
                onSubmit={handleSubmit}
                methods={methods}
              >
                <GenerateQuestionnaireComponents items={questionnaire?.item} pdf={false} />
              </RenderForm>
            )}
          </FormProvider>
        </AttachmentProvider>
      </ExternalRenderProvider>
    </div>
  );
};

const ReferoContainer = Refero;
export { ReferoContainer };
export default ReferoContainer;
