import React from 'react';

import ItemType from '@constants/itemType';
import { PresentationButtonsType } from '@constants/presentationButtonsType';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity,
} from 'fhir/r4';
import { FormProvider, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { DispatchProps } from '@/types/dispatchProps';
import { ReferoProps } from '@/types/referoProps';

import RenderForm from './renderForm';
import StepView from './stepView';
import { setSkjemaDefinition } from '@/actions/form';
import { NewValueAction, newQuantityValue, newDecimalValue, newIntegerValue } from '@/actions/newValue';
import Constants, { NAVIGATOR_BLINDZONE_ID } from '@/constants/index';
import { GlobalState } from '@/reducers';
import { getFormDefinition, getFormData } from '@/reducers/form';
import { FormDefinition, FormData } from '@/reducers/form';
import { ActionRequester } from '@/util/actionRequester';
import {
  getQuestionnaireUnitExtensionValue,
  getPresentationButtonsExtension,
  getNavigatorExtension,
  getCodingTextTableValues,
} from '@/util/extension';
import { getTopLevelElements } from '@/util/getTopLevelElements';
import { IE11HackToWorkAroundBug187484 } from '@/util/hacks';
import { getComponentForItem, isHiddenItem, getDecimalValue } from '@/util/index';
import { QuestionniareInspector } from '@/util/questionnaireInspector';
import {
  getRootQuestionnaireResponseItemFromData,
  Path,
  createPathForItem,
  createIdSuffix,
  getQuestionnaireDefinitionItem,
  getResponseItemAndPathWithLinkId,
} from '@/util/refero-core';
import { RenderContext } from '@/util/renderContext';
import { AnswerPad, ScoringCalculator } from '@/util/scoringCalculator';
import { shouldFormBeDisplayedAsStepView } from '@/util/shouldFormBeDisplayedAsStepView';
import { createIntitialFormValues } from '@/validation/defaultFormValues';
import { ExternalRenderProvider } from '@/context/externalRenderContext';
interface StateProps {
  formDefinition: FormDefinition | null;
  formData: FormData | null;
}

const Refero = (props: StateProps & DispatchProps & ReferoProps): JSX.Element | null => {
  IE11HackToWorkAroundBug187484();
  const questionnaire = props.questionnaire ? props.questionnaire : props.formDefinition?.Content;
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

  const handleSubmit = (): void => {
    const { formData, onSubmit } = props;

    if (formData && formData.Content && onSubmit) {
      onSubmit(formData.Content);
    }
  };

  const handleSave = (): void => {
    if (props.onSave && props.formData && props.formData.Content) {
      props.onSave(props.formData.Content);
    }
  };

  React.useEffect(() => {
    if (props.questionnaire) {
      props.mount();
      setScoringCalculator(getScoringCalculator(props.questionnaire));
    }
  }, []);

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
        props.dispatch(action);
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
      props.dispatch(a);
    }
  };

  const renderFormItems = (pdf?: boolean): Array<JSX.Element> | undefined => {
    const { formDefinition, resources, formData, promptLoginMessage } = props;
    if (!formDefinition || !formDefinition.Content || !formDefinition.Content.item) {
      return undefined;
    }
    const contained = formDefinition.Content.contained;
    const renderedItems: Array<JSX.Element> | undefined = [];
    const isNavigatorEnabled = !!getNavigatorExtension(formDefinition.Content);
    let isNavigatorBlindzoneInitiated = false;
    const questionnaireItemArray: QuestionnaireItem[] | undefined = shouldFormBeDisplayedAsStepView(formDefinition)
      ? getTopLevelElements(formDefinition)
      : formDefinition.Content.item;

    questionnaireItemArray?.map(item => {
      if (isHiddenItem(item)) return [];
      const Comp = getComponentForItem(item.type, getCodingTextTableValues(item));
      if (!Comp) {
        return undefined;
      }

      let responseItems: Array<QuestionnaireResponseItem> | undefined;
      if (formData) {
        responseItems = getRootQuestionnaireResponseItemFromData(item.linkId, formData);
      }
      if (responseItems && responseItems.length > 0) {
        responseItems.forEach((responseItem, index) => {
          const path = createPathForItem(props.path, item, responseItem, index);

          // legg på blindzone rett over den første seksjonen
          if (isNavigatorEnabled && item.type === ItemType.GROUP && !isNavigatorBlindzoneInitiated) {
            isNavigatorBlindzoneInitiated = true;
            renderedItems.push(<section id={NAVIGATOR_BLINDZONE_ID}></section>);
          }
          renderedItems.push(
            <Comp
              {...props}
              idWithLinkIdAndItemIndex={`${item.linkId}${createIdSuffix(path, index, item.repeats)}`}
              language={formDefinition.Content?.language}
              pdf={pdf}
              includeSkipLink={isNavigatorEnabled && item.type === ItemType.GROUP}
              promptLoginMessage={promptLoginMessage}
              key={`item_${responseItem.linkId}_${index}`}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
              responseItem={responseItem}
              resources={resources}
              containedResources={contained}
              path={path}
              headerTag={Constants.DEFAULT_HEADER_TAG}
              index={index}
              responseItems={responseItems}
              onAnswerChange={onAnswerChange}
              renderContext={new RenderContext()}
            />
          );
        });
      }
    });
    return renderedItems;
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

  const {
    formDefinition,
    resources,
    authorized,
    blockSubmit,
    onSave,
    onCancel,
    onSubmit,
    loginButton,
    validationSummaryPlacement,
    submitButtonDisabled,
    saveButtonDisabled,
    onFieldsNotCorrectlyFilledOut,
    onStepChange,
  } = props;

  const referoProps = {
    authorized,
    blockSubmit,
    onSave,
    onCancel,
    onSubmit,
    loginButton,
    validationSummaryPlacement,
    submitButtonDisabled,
    saveButtonDisabled,
    onFieldsNotCorrectlyFilledOut,
    onStepChange,
  };

  if (!resources) {
    return null;
  }
  if (!formDefinition || !formDefinition.Content || !resources) {
    return null;
  }

  if (props.pdf) {
    return <>{renderFormItems(true)}</>;
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
      >
        <FormProvider {...methods}>
          {isStepView ? (
            <StepView
              isAuthorized={authorized}
              referoProps={referoProps}
              resources={resources}
              formItems={renderFormItems()}
              formDefinition={formDefinition}
              onSave={handleSave}
              onSubmit={handleSubmit}
              onStepChange={onStepChange}
              methods={methods}
            />
          ) : (
            <RenderForm
              isAuthorized={authorized}
              isStepView={false}
              referoProps={referoProps}
              resources={resources}
              onSave={handleSave}
              onSubmit={handleSubmit}
              methods={methods}
              validationSummaryPlacement={validationSummaryPlacement}
            >
              {renderFormItems()}
            </RenderForm>
          )}
        </FormProvider>
      </ExternalRenderProvider>
    </div>
  );
};

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: ReferoProps): DispatchProps {
  return {
    mount: (): void => {
      if (props.questionnaire) {
        dispatch(setSkjemaDefinition(props.questionnaire, props.questionnaireResponse, props.language, props.syncQuestionnaireResponse));
      }
    },
    dispatch,
    path: [],
  };
}

const ReferoContainer = connect(
  (state: GlobalState) => ({
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  }),
  mapDispatchToProps
)(Refero);
export { ReferoContainer };
export default ReferoContainer;
