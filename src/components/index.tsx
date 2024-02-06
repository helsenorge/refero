import React, { useState, useEffect, ReactElement } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { DispatchProps } from '../types/dispatchProps';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity,
} from '../types/fhir';
import { ReferoProps } from '../types/referoProps';

import RenderForm from './renderForm';
import StepView from './stepView';
import { setSkjemaDefinition } from '../actions/form';
import { NewValueAction, newQuantityValue, newDecimalValue, newIntegerValue } from '../actions/newValue';
import RepeatButton from '../components/formcomponents/repeat/repeat-button';
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
import { ScoringCalculator } from '../util/scoringCalculator';
import { shouldFormBeDisplayedAsStepView } from '../util/shouldFormBeDisplayedAsStepView';

interface StateProps {
  formDefinition?: FormDefinition | null;
  formData?: FormData | null;
}

const Refero = ({
  formData,
  onSave,
  onSubmit,
  onChange,
  onCancel,
  sticky,
  questionnaire,
  formDefinition,
  mount,
  questionnaireResponse,
  language,
  syncQuestionnaireResponse,
  updateSkjema,
  dispatch,
  promptLoginMessage,
  path,
  onRequestAttachmentLink,
  onOpenAttachment,
  onDeleteAttachment,
  onRequestHelpButton,
  onRequestHelpElement,
  uploadAttachment,
  attachmentErrorMessage,
  attachmentMaxFileSize,
  attachmentValidTypes,
  validateScriptInjection,
  onRenderMarkdown,
  fetchValueSet,
  autoSuggestProps,
  fetchReceivers,
  resources,
  pdf,
  authorized,
  blockSubmit,
  loginButton,
  validationSummaryPlacement,
  submitButtonDisabled,
  saveButtonDisabled,
  onFieldsNotCorrectlyFilledOut,
  onStepChange,
  isHelsenorgeForm,
}: StateProps & DispatchProps & ReferoProps): ReactElement | null => {
  const qst = questionnaire ? questionnaire : formDefinition?.Content;
  const methods = useForm({ mode: 'onChange' });

  const [scoringCalculator, setScoringCalculator] = useState<ScoringCalculator | undefined>(qst ? new ScoringCalculator(qst) : undefined);

  const handleSubmit = (): void => {
    if (formData && formData.Content && onSubmit) {
      onSubmit(formData.Content);
    }
  };

  const handleSave = (): void => {
    if (onSave && formData && formData.Content) {
      onSave(formData.Content);
    }
  };
  IE11HackToWorkAroundBug187484();

  useEffect(() => {
    mount();
  }, []);

  useEffect(() => {
    if (questionnaire) {
      updateSkjema(questionnaire, questionnaireResponse, language, syncQuestionnaireResponse);
      setScoringCalculator(new ScoringCalculator(questionnaire));
    }
  }, [questionnaire]);

  const onAnswerChange = (
    newState: GlobalState,
    _path: Array<Path>,
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer
  ): void => {
    if (onChange && newState.refero.form.FormDefinition.Content && newState.refero.form.FormData.Content) {
      const actionRequester = new ActionRequester(newState.refero.form.FormDefinition.Content, newState.refero.form.FormData.Content);

      const questionnaireInspector = new QuestionniareInspector(
        newState.refero.form.FormDefinition.Content,
        newState.refero.form.FormData.Content
      );

      onChange(item, answer, actionRequester, questionnaireInspector);

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
    scores: { [linkId: string]: number | undefined },
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

          const quantity = {
            unit: extension.display,
            system: extension.system,
            code: extension.code,
            value: getDecimalValue(item, value),
          } as Quantity;
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

  const renderFormItems = (pdf?: boolean): Array<JSX.Element> | undefined => {
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
                  key={`item_${item.linkId}_add_repeat_item`}
                  resources={resources}
                  item={item}
                  responseItems={responseItems}
                  parentPath={path}
                  renderContext={new RenderContext()}
                  disabled={item.type !== ItemType.GROUP && !responseItem.answer}
                />
              </div>
            ) : undefined;
          const pathForItem = createPathForItem(path, item, responseItem, index);
          // legg på blindzone rett over den første seksjonen
          if (isNavigatorEnabled && item.type === ItemType.GROUP && !isNavigatorBlindzoneInitiated) {
            isNavigatorBlindzoneInitiated = true;
            renderedItems.push(<section id={NAVIGATOR_BLINDZONE_ID}></section>);
          }
          renderedItems.push(
            <Comp
              language={formDefinition.Content?.language}
              pdf={pdf}
              includeSkipLink={isNavigatorEnabled && item.type === ItemType.GROUP}
              promptLoginMessage={promptLoginMessage}
              key={`item_${responseItem.linkId}_${index}`}
              id={'item_' + responseItem.linkId + createIdSuffix(pathForItem, index, item.repeats)}
              item={item}
              questionnaire={formDefinition.Content}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              containedResources={contained}
              path={pathForItem}
              headerTag={Constants.DEFAULT_HEADER_TAG}
              visibleDeleteButton={shouldRenderDeleteButton(item, index)}
              repeatButton={repeatButton}
              onRequestAttachmentLink={onRequestAttachmentLink}
              onOpenAttachment={onOpenAttachment}
              onDeleteAttachment={onDeleteAttachment}
              uploadAttachment={uploadAttachment}
              onRequestHelpButton={onRequestHelpButton}
              onRequestHelpElement={onRequestHelpElement}
              attachmentErrorMessage={attachmentErrorMessage}
              attachmentMaxFileSize={attachmentMaxFileSize}
              attachmentValidTypes={attachmentValidTypes}
              validateScriptInjection={validateScriptInjection}
              onAnswerChange={onAnswerChange}
              renderContext={new RenderContext()}
              onRenderMarkdown={onRenderMarkdown}
              fetchValueSet={fetchValueSet}
              autoSuggestProps={autoSuggestProps}
              fetchReceivers={fetchReceivers}
            />
          );
        });
      }
    });
    return renderedItems;
  };

  const getButtonClasses = (presentationButtonsType: PresentationButtonsType | null, defaultClasses?: string[]): string => {
    defaultClasses = defaultClasses ?? [];
    if (presentationButtonsType === PresentationButtonsType.None) {
      defaultClasses.push('page_refero__hidden_buttons');
    }
    if (presentationButtonsType === PresentationButtonsType.Sticky || (sticky && !presentationButtonsType)) {
      defaultClasses.push('page_refero__stickybar');
    }

    return defaultClasses.join(' ');
  };

  if (!formDefinition || !formDefinition.Content || !resources) {
    return null;
  }

  if (pdf) {
    return <>{renderFormItems(true)}</>;
  }

  const presentationButtonsType = getPresentationButtonsExtension(formDefinition.Content);
  const isStepView = shouldFormBeDisplayedAsStepView(formDefinition);

  const referoProps: ReferoProps = {
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
    isHelsenorgeForm,
  };
  return (
    <FormProvider {...methods}>
      <div className={getButtonClasses(presentationButtonsType, ['page_refero__content'])}>
        <div className="page_refero__messageboxes" />

        {isStepView ? (
          <StepView
            isAuthorized={authorized}
            referoProps={referoProps}
            resources={resources}
            formDefinition={formDefinition}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onStepChange={onStepChange}
            isHelsenorgeForm={isHelsenorgeForm}
            methods={methods}
          >
            {renderFormItems()}
          </StepView>
        ) : (
          <RenderForm
            isAuthorized={authorized}
            isStepView={false}
            referoProps={referoProps}
            resources={resources}
            onSave={handleSave}
            onSubmit={handleSubmit}
            isHelsenorgeForm={isHelsenorgeForm}
            methods={methods}
          >
            {renderFormItems()}
          </RenderForm>
        )}
      </div>
    </FormProvider>
  );
};

/* REDUX utils */

function mapStateToProps(state: GlobalState): StateProps {
  return {
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: ReferoProps): DispatchProps {
  const { questionnaire, questionnaireResponse, language, syncQuestionnaireResponse } = props;
  return {
    updateSkjema: (
      questionnaire: Questionnaire,
      questionnaireResponse: QuestionnaireResponse | undefined,
      language: string | undefined,
      syncQuestionnaireResponse: boolean | undefined
    ): void => {
      dispatch(setSkjemaDefinition(questionnaire, questionnaireResponse, language, syncQuestionnaireResponse));
    },
    mount: (): void => {
      if (questionnaire) {
        dispatch(setSkjemaDefinition(questionnaire, questionnaireResponse, language, syncQuestionnaireResponse));
      }
    },
    dispatch,
    path: [],
  };
}

const ReferoContainer = connect<StateProps, DispatchProps, ReferoProps>(mapStateToProps, mapDispatchToProps)(Refero);
export { ReferoContainer };
