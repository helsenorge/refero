import React from 'react';

import { PresentationButtonsType } from '@constants/presentationButtonsType';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ReferoProps } from '@/types/referoProps';

import RenderForm from './renderForm';
import StepView from './stepView';

import { GlobalState } from '@/reducers';
import { getFormDefinition, getFormData } from '@/reducers/form';
import { FormDefinition, FormData } from '@/reducers/form';
import { ActionRequester, IActionRequester } from '@/util/actionRequester';
import { getPresentationButtonsExtension } from '@/util/extension';
import { IE11HackToWorkAroundBug187484 } from '@/util/hacks';
import { IQuestionnaireInspector, QuestionniareInspector } from '@/util/questionnaireInspector';
import { Path } from '@/util/refero-core';
import { shouldFormBeDisplayedAsStepView } from '@/util/shouldFormBeDisplayedAsStepView';
import { createIntitialFormValues } from '@/validation/defaultFormValues';
import { ExternalRenderProvider } from '@/context/externalRenderContext';
import { setSkjemaDefinition } from '@/actions/form';
import { AttachmentProvider } from '@/context/AttachmentContext';
import GenerateQuestionnaireComponents, { QuestionnaireItemsProps } from './GenerateQuestionnaireComponents';
import { useScoringCalculator } from '@/hooks/useScoringCalculator';

const Refero = (props: ReferoProps): JSX.Element | null => {
  IE11HackToWorkAroundBug187484();
  const dispatch = useDispatch();
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const formData = useSelector<GlobalState, FormData | null>((state: GlobalState) => getFormData(state));
  const questionnaire = formDefinition?.Content;
  // const schema = createZodSchemaFromQuestionnaire(questionnaire, props.resources, questionnaire?.contained);
  const defualtVals = React.useMemo(() => createIntitialFormValues(questionnaire?.item), [questionnaire?.item?.length]);
  const { runScoringCalculator } = useScoringCalculator();

  // console.log('defualtVals', defualtVals);
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
  const handleOnChange = (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ): void => {
    if (props.onChange) {
      props.onChange(item, answer, actionRequester, questionnaireInspector);
    }
  };
  const onAnswerChange = (
    state: GlobalState,
    _path: Array<Path>,
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer
  ): void => {
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;
    if (questionnaire && questionnaireResponse) {
      const actionRequester = new ActionRequester(questionnaire, questionnaireResponse);

      const questionnaireInspector = new QuestionniareInspector(questionnaire, questionnaireResponse);
      handleOnChange(item, answer, actionRequester, questionnaireInspector);
      for (const action of actionRequester.getActions()) {
        dispatch(action);
      }
    }

    runScoringCalculator(questionnaire, questionnaireResponse);
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
  const qItemProps: QuestionnaireItemsProps = {
    items: questionnaire?.item,
    onAnswerChange,
    autoSuggestProps: props.autoSuggestProps,
    validateScriptInjection: props.validateScriptInjection,
  };
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
      >
        <FormProvider {...methods}>
          <GenerateQuestionnaireComponents {...qItemProps} pdf={true} />
        </FormProvider>
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
                qItemProps={qItemProps}
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
                <GenerateQuestionnaireComponents {...qItemProps} pdf={false} />
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
