import * as React from 'react';

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

import { DispatchProps } from '../types/dispatchProps';
import { ReferoProps } from '../types/referoProps';

import RepeatButton from './formcomponents/repeat/RepeatButton';
import RenderForm from './renderForm';
import StepView from './stepView';
import { setSkjemaDefinition } from '../actions/form';
import { NewValueAction, newQuantityValue, newDecimalValue, newIntegerValue } from '../actions/newValue';
import Constants, { NAVIGATOR_BLINDZONE_ID } from '../constants/index';
import ItemType from '../constants/itemType';
import { PresentationButtonsType } from '../constants/presentationButtonsType';
import { GlobalState } from '../reducers';
import { getFormDefinition, getFormData } from '../reducers/form';
import { FormDefinition, FormData } from '../reducers/form';
import { ActionRequester } from '../util/actionRequester';
import {
  getQuestionnaireUnitExtensionValue,
  getPresentationButtonsExtension,
  getNavigatorExtension,
  getCodingTextTableValues,
} from '../util/extension';
import { getTopLevelElements } from '../util/getTopLevelElements';
import { IE11HackToWorkAroundBug187484 } from '../util/hacks';
import { getComponentForItem, shouldRenderRepeatButton, isHiddenItem, getDecimalValue } from '../util/index';
import { QuestionniareInspector } from '../util/questionnaireInspector';
import {
  getRootQuestionnaireResponseItemFromData,
  Path,
  createPathForItem,
  getAnswerFromResponseItem,
  shouldRenderDeleteButton,
  createIdSuffix,
  getQuestionnaireDefinitionItem,
  getResponseItemAndPathWithLinkId,
} from '../util/refero-core';
import { RenderContext } from '../util/renderContext';
import { AnswerPad, ScoringCalculator } from '../util/scoringCalculator';
import { shouldFormBeDisplayedAsStepView } from '../util/shouldFormBeDisplayedAsStepView';
import { generateDefaultValues } from '../validation/defaultFormValues';
interface StateProps {
  formDefinition?: FormDefinition | null;
  formData?: FormData | null;
}

const Refero = (props: StateProps & DispatchProps & ReferoProps): JSX.Element | null => {
  IE11HackToWorkAroundBug187484();
  const questionnaire = props.questionnaire ? props.questionnaire : props.formDefinition?.Content;
  // const schema = createZodSchemaFromQuestionnaire(questionnaire, props.resources, questionnaire?.contained);
  const defualtVals = React.useMemo(() => generateDefaultValues(questionnaire?.item), [questionnaire?.item?.length]);
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
    // console.log('onAnswerChange', newState, item, answer, props.onChange);
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
          const repeatButton =
            item.repeats && shouldRenderRepeatButton(item, responseItems, index) ? (
              <div className="page_refero__repeatbutton-wrapper">
                <RepeatButton
                  idWithLinkIdAndItemIndex={item.linkId}
                  key={`item_${item.linkId}_add_repeat_item`}
                  resources={props.resources}
                  item={item}
                  responseItems={responseItems}
                  parentPath={props.path}
                  renderContext={new RenderContext()}
                  disabled={item.type !== ItemType.GROUP && !responseItem.answer}
                />
              </div>
            ) : undefined;
          const path = createPathForItem(props.path, item, responseItem, index);
          const idWithLinkIdAndItemIndex = `${item.linkId}${
            props?.path && props?.path[0] && props?.path[0].index ? `-${props.path[0].index}` : ''
          }${index ? `-${index}` : ''}`;
          // legg på blindzone rett over den første seksjonen
          if (isNavigatorEnabled && item.type === ItemType.GROUP && !isNavigatorBlindzoneInitiated) {
            isNavigatorBlindzoneInitiated = true;
            renderedItems.push(<section id={NAVIGATOR_BLINDZONE_ID}></section>);
          }
          renderedItems.push(
            <Comp
              idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
              language={formDefinition.Content?.language}
              pdf={pdf}
              includeSkipLink={isNavigatorEnabled && item.type === ItemType.GROUP}
              promptLoginMessage={promptLoginMessage}
              key={`item_${responseItem.linkId}_${index}`}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
              questionnaire={formDefinition.Content}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              containedResources={contained}
              path={path}
              headerTag={Constants.DEFAULT_HEADER_TAG}
              visibleDeleteButton={shouldRenderDeleteButton(item, index)}
              repeatButton={repeatButton}
              onRequestAttachmentLink={props.onRequestAttachmentLink}
              onOpenAttachment={props.onOpenAttachment}
              onDeleteAttachment={props.onDeleteAttachment}
              uploadAttachment={props.uploadAttachment}
              onRequestHelpButton={props.onRequestHelpButton}
              onRequestHelpElement={props.onRequestHelpElement}
              attachmentErrorMessage={props.attachmentErrorMessage}
              attachmentMaxFileSize={props.attachmentMaxFileSize}
              attachmentValidTypes={props.attachmentValidTypes}
              validateScriptInjection={props.validateScriptInjection}
              onAnswerChange={onAnswerChange}
              renderContext={new RenderContext()}
              onRenderMarkdown={props.onRenderMarkdown}
              fetchValueSet={props.fetchValueSet}
              autoSuggestProps={props.autoSuggestProps}
              fetchReceivers={props.fetchReceivers}
            />
          );
        });
      }
    });
    return renderedItems;
  };

  const renderSkjema = (pdf?: boolean): Array<JSX.Element> | Array<Array<JSX.Element>> | JSX.Element | null | undefined => {
    const { formDefinition, resources } = props;
    if (!formDefinition || !formDefinition.Content || !resources) {
      return null;
    }

    if (pdf) {
      return renderFormItems(true);
    }

    const presentationButtonsType = getPresentationButtonsExtension(formDefinition.Content);
    const isStepView = shouldFormBeDisplayedAsStepView(formDefinition);

    return (
      <div className={getButtonClasses(presentationButtonsType, ['page_refero__content'])}>
        <div className="page_refero__messageboxes" />
        {renderForm(isStepView)}
      </div>
    );
  };

  const renderForm = (isStepView?: boolean): JSX.Element | undefined => {
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
    if (!formDefinition || !resources) {
      return;
    }
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
    return (
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
    );
  };

  const getButtonClasses = (presentationButtonsType: PresentationButtonsType | null, defaultClasses?: string[]): string => {
    defaultClasses = defaultClasses ?? [];
    if (presentationButtonsType === PresentationButtonsType.None) {
      defaultClasses.push('page_refero__hidden_buttons');
    }
    if (presentationButtonsType === PresentationButtonsType.Sticky || (props.sticky && !presentationButtonsType)) {
      defaultClasses.push('page_refero__stickybar');
    }

    return defaultClasses.join(' ');
  };

  const { resources } = props;

  if (!resources) {
    return null;
  }

  return <>{renderSkjema(props.pdf)}</>;
};

function mapStateToProps(state: GlobalState): StateProps {
  return {
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  };
}

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

const ReferoContainer = connect<StateProps, DispatchProps, ReferoProps>(mapStateToProps, mapDispatchToProps)(Refero);
export { ReferoContainer };
