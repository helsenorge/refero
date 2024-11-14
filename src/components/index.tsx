import * as React from 'react';

import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity,
} from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { DispatchProps } from '../types/dispatchProps';
import { ReferoProps } from '../types/referoProps';
import { State } from '../types/state';

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

class Refero extends React.Component<StateProps & DispatchProps & ReferoProps, State> {
  constructor(props: StateProps & DispatchProps & ReferoProps) {
    super(props);
    const questionnaire = this.props.questionnaire ? this.props.questionnaire : this.props.formDefinition?.Content;
    this.state = {
      valid: true,
      validated: false,
      showCancelLightbox: false,
      scoringCalculator: questionnaire ? this.getScoringCalculator(questionnaire) : undefined,
    };
  }

  onSubmit = (): void => {
    const { formData, onSubmit } = this.props;

    if (formData && formData.Content && onSubmit) {
      onSubmit(formData.Content);
    }
  };

  onSave = (): void => {
    if (this.props.onSave && this.props.formData && this.props.formData.Content) {
      this.props.onSave(this.props.formData.Content);
    }
  };

  componentDidMount(): void {
    this.props.mount();
    // eslint-disable-next-line no-console
    console.log("******** Refero loaded OK v.4 **********");
    // eslint-disable-next-line no-console
    console.log("Refero: Is microweb? " + this.props.isMicroweb);
    // eslint-disable-next-line no-console
    console.log("Refero: Is microweb step? " + this.props.isMicrowebStep);

    // eslint-disable-next-line no-console
    console.log("Skjemanavn: " + this.props.skjemanavn);
  }

  componentDidUpdate(): void {
    IE11HackToWorkAroundBug187484();
  }

  componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("Refero Component will unmount");
  }

  UNSAFE_componentWillReceiveProps(nextProps: ReferoProps): void {
    // eslint-disable-next-line no-console
    console.log("Refero: componentWillReceiveProps called");
    if ((nextProps.questionnaire && nextProps.questionnaire !== this.props.questionnaire) ||
      (nextProps.skjemanavn && nextProps.skjemanavn !== this.props.skjemanavn)) {
        if (nextProps.questionnaire) {
          // eslint-disable-next-line no-console
          console.log("Properties changes, calling updateSkjema...");
          this.props.updateSkjema(
            nextProps.questionnaire,
            nextProps.questionnaireResponse,
            nextProps.language,
            nextProps.syncQuestionnaireResponse
          );
          this.setState({ scoringCalculator: this.getScoringCalculator(nextProps.questionnaire) });
        }
    }
  }

  onAnswerChange = (newState: GlobalState, _path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): void => {
    if (this.props.onChange && newState.refero.form.FormDefinition.Content && newState.refero.form.FormData.Content) {
      const actionRequester = new ActionRequester(newState.refero.form.FormDefinition.Content, newState.refero.form.FormData.Content);

      const questionnaireInspector = new QuestionniareInspector(
        newState.refero.form.FormDefinition.Content,
        newState.refero.form.FormData.Content
      );

      this.props.onChange(item, answer, actionRequester, questionnaireInspector);

      for (const action of actionRequester.getActions()) {
        this.props.dispatch(action);
      }
    }

    this.runScoringCalculator(newState);
  };

  getScoringCalculator = (questionnaire: Questionnaire): ScoringCalculator => {
    return new ScoringCalculator(questionnaire);
  };

  runScoringCalculator = (newState: GlobalState): void => {
    const questionnaireResponse = newState.refero?.form?.FormData?.Content;
    const questionnaire = newState.refero.form.FormDefinition?.Content;
    if (!questionnaire || !questionnaireResponse) return;

    if (this.state.scoringCalculator) {
      const scores = this.state.scoringCalculator.calculateScore(questionnaireResponse);
      this.updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse);

      const fhirScores = this.state.scoringCalculator.calculateFhirScore(questionnaireResponse);
      this.updateQuestionnaireResponseWithScore(fhirScores, questionnaire, questionnaireResponse);
    }
  };

  updateQuestionnaireResponseWithScore = (
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
      this.props.dispatch(a);
    }
  };

  renderFormItems(pdf?: boolean): Array<JSX.Element> | undefined {

    // eslint-disable-next-line no-console
    console.log("Render form items called");
    const { formDefinition, resources, formData, promptLoginMessage } = this.props;
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
                  resources={this.props.resources}
                  item={item}
                  responseItems={responseItems}
                  parentPath={this.props.path}
                  renderContext={new RenderContext()}
                  disabled={item.type !== ItemType.GROUP && !responseItem.answer}
                />
              </div>
            ) : undefined;
          const path = createPathForItem(this.props.path, item, responseItem, index);
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
              onRequestAttachmentLink={this.props.onRequestAttachmentLink}
              onOpenAttachment={this.props.onOpenAttachment}
              onDeleteAttachment={this.props.onDeleteAttachment}
              uploadAttachment={this.props.uploadAttachment}
              onRequestHelpButton={this.props.onRequestHelpButton}
              onRequestHelpElement={this.props.onRequestHelpElement}
              attachmentErrorMessage={this.props.attachmentErrorMessage}
              attachmentMaxFileSize={this.props.attachmentMaxFileSize}
              attachmentValidTypes={this.props.attachmentValidTypes}
              validateScriptInjection={this.props.validateScriptInjection}
              onAnswerChange={this.onAnswerChange}
              renderContext={new RenderContext()}
              onRenderMarkdown={this.props.onRenderMarkdown}
              fetchValueSet={this.props.fetchValueSet}
              autoSuggestProps={this.props.autoSuggestProps}
              fetchReceivers={this.props.fetchReceivers}
            />
          );
        });
      }
    });
    return renderedItems;
  }

  renderSkjema = (pdf?: boolean): Array<JSX.Element> | Array<Array<JSX.Element>> | JSX.Element | null | undefined => {

    // eslint-disable-next-line no-console
    console.log("Refero: RenderSkjema called");
    

    const { formDefinition, resources } = this.props;

    if (!formDefinition || !formDefinition.Content || !resources) {

      // eslint-disable-next-line no-console
      console.log("No form def or content, or resources - reutrning null - nothing to render...");

      return null;
    }

    if (pdf) {
      return this.renderFormItems(true);
    }

    const presentationButtonsType = getPresentationButtonsExtension(formDefinition.Content);
    const isStepView = shouldFormBeDisplayedAsStepView(formDefinition);

    return (
      <div className={this.getButtonClasses(presentationButtonsType, ['page_refero__content'])}>
        <div className="page_refero__messageboxes" />
        {this.renderForm(isStepView)}
      </div>
    );
  };

  renderForm = (isStepView?: boolean): JSX.Element | undefined => {
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
      isMicroweb, 
      isMicrowebStep,
      onStepProcessBack,
      onStepProcessCancel,
      onCancelMicroweb,
      skjemanavn,
    } = this.props;
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
      isMicroweb, 
      isMicrowebStep,  // TODO - need callbacks here too?
      onStepProcessBack,
      onStepProcessCancel,
      onCancelMicroweb,
      skjemanavn
    };

    return (
      <>
        {isStepView ? (
          <StepView
            isAuthorized={authorized}
            referoProps={referoProps}
            resources={resources}
            formItems={this.renderFormItems()}
            formDefinition={formDefinition}
            onSave={this.onSave}
            onSubmit={this.onSubmit}
            onStepChange={onStepChange}
          />
        ) : (
          <><RenderForm
              isAuthorized={authorized}
              isStepView={false}
              referoProps={referoProps}
              resources={resources}
              formItemsToBeRendered={this.renderFormItems()}
              onSave={this.onSave}
              onSubmit={this.onSubmit} />

              <div>{"Skjemanavn to render: " + this.props.skjemanavn}</div></>
        )}
      </>
    );
  };

  getButtonClasses(presentationButtonsType: PresentationButtonsType | null, defaultClasses?: string[]): string {
    defaultClasses = defaultClasses ?? [];
    if (presentationButtonsType === PresentationButtonsType.None) {
      defaultClasses.push('page_refero__hidden_buttons');
    }
    if (presentationButtonsType === PresentationButtonsType.Sticky || (this.props.sticky && !presentationButtonsType)) {
      defaultClasses.push('page_refero__stickybar');
    }

    return defaultClasses.join(' ');
  }

  render(): JSX.Element | null {
    const { resources } = this.props;

    if (!resources) {
      return null;
    }

    return <React.Fragment>{this.renderSkjema(this.props.pdf)}</React.Fragment>;
  }
}

function mapStateToProps(state: GlobalState): StateProps {
  return {
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: ReferoProps): DispatchProps {
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
