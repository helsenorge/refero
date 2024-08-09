import React from 'react';

import ItemType from '@constants/itemType';
import { PresentationButtonsType } from '@constants/presentationButtonsType';
import { Questionnaire, QuestionnaireResponse, QuestionnaireItem, QuestionnaireResponseItemAnswer, Quantity } from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ReferoProps } from '@/types/referoProps';

import RenderForm from './renderForm';
import StepView from './stepView';

import { NewValueAction, newQuantityValue, newDecimalValue, newIntegerValue } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getFormDefinition, getFormData } from '@/reducers/form';
import { FormDefinition, FormData } from '@/reducers/form';
import { ActionRequester } from '@/util/actionRequester';
import { getQuestionnaireUnitExtensionValue, getPresentationButtonsExtension } from '@/util/extension';
import { IE11HackToWorkAroundBug187484 } from '@/util/hacks';
import { getDecimalValue } from '@/util/index';
import { QuestionniareInspector } from '@/util/questionnaireInspector';
import { Path, getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';
import { AnswerPad, ScoringCalculator } from '@/util/scoringCalculator';
import { shouldFormBeDisplayedAsStepView } from '@/util/shouldFormBeDisplayedAsStepView';
import { createIntitialFormValues } from '@/validation/defaultFormValues';
import { ExternalRenderProvider } from '@/context/externalRenderContext';
import { setSkjemaDefinition } from '@/actions/form';
import RenderQuestionnaireItems from './QuestionnaireItems';

const Refero = (props: ReferoProps): JSX.Element | null => {
  IE11HackToWorkAroundBug187484();
  const dispatch = useDispatch();
  const formDefinition = useSelector<GlobalState, FormDefinition | null>((state: GlobalState) => getFormDefinition(state));
  const formData = useSelector<GlobalState, FormData | null>((state: GlobalState) => getFormData(state));
  const questionnaire = formDefinition?.Content;
  // const schema = createZodSchemaFromQuestionnaire(questionnaire, props.resources, questionnaire?.contained);
  const defualtVals = React.useMemo(() => createIntitialFormValues(questionnaire?.item), [questionnaire?.item?.length]);

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

  const getScoringCalculator = (questionnaire: Questionnaire): ScoringCalculator => {
    return new ScoringCalculator(questionnaire);
  };

  const [scoringCalculator, setScoringCalculator] = React.useState<ScoringCalculator | undefined>(
    questionnaire ? getScoringCalculator(questionnaire) : undefined
  );
  React.useEffect(() => {
    if (props.questionnaire) {
      dispatch(setSkjemaDefinition(props.questionnaire, props.questionnaireResponse, props.language, props.syncQuestionnaireResponse));
      setScoringCalculator(getScoringCalculator(props.questionnaire));
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

  const onAnswerChange = (
    newState: GlobalState,
    _path: Array<Path>,
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer
  ): void => {
    if (props.onChange && newState.refero.form.FormDefinition.Content && newState.refero.form.FormData.Content) {
      const actionRequester = new ActionRequester(newState.refero.form.FormDefinition.Content, newState.refero.form.FormData.Content);

      const questionnaireInspector = new QuestionniareInspector(
        newState.refero.form.FormDefinition.Content,
        newState.refero.form.FormData.Content
      );
      props.onChange(item, answer, actionRequester, questionnaireInspector);
      for (const action of actionRequester.getActions()) {
        dispatch(action);
      }
    }

    runScoringCalculator(newState);
  };

  const runScoringCalculator = (newState: GlobalState): void => {
    const questionnaireResponse = newState.refero?.form?.FormData?.Content;
    const questionnaire = newState.refero.form.FormDefinition?.Content;

    if (!questionnaire || !questionnaireResponse) return;
    if (scoringCalculator) {
      const scores = scoringCalculator.calculateScore(questionnaireResponse);

      updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse);

      const fhirScores = scoringCalculator.calculateFhirScore(questionnaireResponse);

      updateQuestionnaireResponseWithScore(fhirScores, questionnaire, questionnaireResponse);
    }
  };

  const updateQuestionnaireResponseWithScore = (
    scores: AnswerPad,
    questionnaire: Questionnaire,
    questionnaireResponse: QuestionnaireResponse
  ): void => {
    const actions: Array<NewValueAction> = [];
    for (const linkId in scores) {
      const item = getQuestionnaireDefinitionItem(linkId, questionnaire.item);
      if (!item) continue;
      const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, questionnaireResponse);
      const value = scores[linkId];

      switch (item.type) {
        case ItemType.QUANTITY: {
          const extension = getQuestionnaireUnitExtensionValue(item);
          if (!extension) continue;

          const quantity: Quantity = {
            unit: extension.display,
            system: extension.system,
            code: extension.code,
            value: getDecimalValue(item, value),
          };
          for (const itemAndPath of itemsAndPaths) {
            actions.push(newQuantityValue(itemAndPath.path, quantity, item));
          }
          break;
        }
        case ItemType.DECIMAL: {
          const decimalValue = getDecimalValue(item, value);
          for (const itemAndPath of itemsAndPaths) {
            actions.push(newDecimalValue(itemAndPath.path, decimalValue, item));
          }
          break;
        }
        case ItemType.INTEGER: {
          const intValue = value !== undefined ? Math.round(value) : undefined;
          for (const itemAndPath of itemsAndPaths) {
            actions.push(newIntegerValue(itemAndPath.path, intValue, item));
          }
          break;
        }
      }
    }
    for (const a of actions) {
      dispatch(a);
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

  if (!resources) {
    return null;
  }
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
      >
        <FormProvider {...methods}>
          <RenderQuestionnaireItems {...props} items={questionnaire?.item} onAnswerChange={onAnswerChange} pdf={true} />
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
              onAnswerChange={onAnswerChange}
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
              <RenderQuestionnaireItems {...props} items={questionnaire?.item} onAnswerChange={onAnswerChange} pdf={false} />
            </RenderForm>
          )}
        </FormProvider>
      </ExternalRenderProvider>
    </div>
  );
};

const ReferoContainer = Refero;
export { ReferoContainer };
export default ReferoContainer;
