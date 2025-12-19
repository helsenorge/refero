import React from 'react';

import { PresentationButtonsType } from '@constants/presentationButtonsType';
import { FormProvider, useForm } from 'react-hook-form';

import type { ReferoProps } from '@/types/referoProps';

import GenerateQuestionnaireComponents from './createQuestionnaire/GenerateQuestionnaireComponents';
import RenderForm from './renderForm';
import StepView from './stepView';

import { setSkjemaDefinitionAction } from '@/actions/form';
import { AttachmentProvider } from '@/context/attachment/AttachmentContextProvider';
import { ExternalRenderProvider } from '@/context/externalRender/ExternalRenderContextProvider';
import { useSetFocus } from '@/hooks/useSetFocus';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { getFormDefinition, getFormData } from '@/reducers/form';
import { getPresentationButtonsExtension } from '@/util/extension';
import { IE11HackToWorkAroundBug187484 } from '@/util/hacks';
import { shouldFormBeDisplayedAsStepView } from '@/util/shouldFormBeDisplayedAsStepView';
import { createIntitialFormValues, type DefaultValues } from '@/validation/defaultFormValues';

const Refero = (props: ReferoProps): JSX.Element | null => {
  const {
    resources,
    authorized,
    pdf,
    sticky,
    onRequestHelpButton,
    onRequestHelpElement,
    onRenderMarkdown,
    fetchReceivers,
    fetchValueSet,
    onFieldsNotCorrectlyFilledOut,
    onStepChange,
    promptLoginMessage,
    autoSuggestProps,
    validateScriptInjection,
    onChange,
    attachmentErrorMessage,
    attachmentMaxFileSize,
    attachmentValidTypes,
    onDeleteAttachment,
    onRequestAttachmentLink,
    onOpenAttachment,
    uploadAttachment,
    useFormProps,
    attachmentMaxFileSizePerFile,
    focusHandler,
  } = props;

  IE11HackToWorkAroundBug187484();
  const dispatch = useAppDispatch();
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const formData = useAppSelector(state => getFormData(state));
  const formContainerRef = useSetFocus(focusHandler);

  const questionnaire = formDefinition?.Content;
  const defualtVals = React.useMemo(() => createIntitialFormValues(questionnaire?.item), [questionnaire?.item]);
  const methods = useForm<DefaultValues>({
    defaultValues: defualtVals,
    shouldFocusError: true,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    ...(useFormProps !== undefined && { ...useFormProps }),
  });
  React.useEffect(() => {
    if (props.questionnaire) {
      dispatch(
        setSkjemaDefinitionAction({
          questionnaire: props.questionnaire,
          questionnaireResponse: props.questionnaireResponse,
          language: props.language,
          syncQuestionnaireResponse: props.syncQuestionnaireResponse,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.language, props.syncQuestionnaireResponse]);
  const externalRenderProps = {
    onRequestHelpElement,
    onRequestHelpButton,
    onRenderMarkdown,
    fetchValueSet,
    fetchReceivers,
    onFieldsNotCorrectlyFilledOut,
    onStepChange,
    promptLoginMessage,
    resources,
    autoSuggestProps,
    validateScriptInjection,
    onChange,
  };

  const attachmentProviderProps = {
    attachmentErrorMessage,
    attachmentMaxFileSize,
    attachmentMaxFileSizePerFile,
    attachmentValidTypes,
    onDeleteAttachment,
    onRequestAttachmentLink,
    onOpenAttachment,
    uploadAttachment,
  };
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
    } else if (presentationButtonsType === PresentationButtonsType.Static) {
      classes.push('page_refero__static');
    } else {
      classes.push('page_refero__stickybar');
    }

    return classes.join(' ');
  };

  if (!formDefinition || !formDefinition.Content || !resources) {
    return null;
  }

  if (pdf) {
    return (
      <ExternalRenderProvider {...externalRenderProps}>
        <AttachmentProvider {...attachmentProviderProps}>
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
    <div className={getButtonClasses(presentationButtonsType, ['page_refero__content'], sticky)}>
      <div className="page_refero__messageboxes" />
      <ExternalRenderProvider {...externalRenderProps}>
        <AttachmentProvider {...attachmentProviderProps}>
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
              <div ref={formContainerRef} tabIndex={-1}>
                <RenderForm
                  isAuthorized={authorized}
                  isStepView={false}
                  referoProps={props}
                  resources={resources}
                  onSave={handleSave}
                  onSubmit={handleSubmit}
                  methods={methods}
                  onFieldsNotCorrectlyFilledOut={onFieldsNotCorrectlyFilledOut}
                >
                  <GenerateQuestionnaireComponents items={questionnaire?.item} pdf={false} />
                </RenderForm>
              </div>
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
