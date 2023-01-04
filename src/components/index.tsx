import * as React from 'react';

import { connect, Store } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../types/autoSuggestProps';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  Attachment,
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity,
  ValueSet,
} from '../types/fhir';
import { OrgenhetHierarki } from '../types/orgenhetHierarki';
import { TextMessage } from '../types/text-message';

import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import Form from '@helsenorge/form/components/form';
import { ValidationSummaryPlacement } from '@helsenorge/form/components/form/validationSummaryPlacement';

import { setSkjemaDefinition } from '../actions/form';
import { NewValueAction, newQuantityValue } from '../actions/newValue';
import RepeatButton from '../components/formcomponents/repeat/repeat-button';
import ExtensionConstants from '../constants/extensions';
import Constants from '../constants/index';
import ItemType from '../constants/itemType';
import { PresentationButtonsType } from '../constants/presentationButtonsType';
import { GlobalState } from '../reducers';
import { getFormDefinition, getFormData } from '../reducers/form';
import { FormDefinition, FormData } from '../reducers/form';
import { ActionRequester, IActionRequester } from '../util/actionRequester';
import {
  getQuestionnaireUnitExtensionValue,
  getExtension,
  getPresentationButtonsExtension,
  getNavigatorExtension,
} from '../util/extension';
import { IE11HackToWorkAroundBug187484 } from '../util/hacks';
import { getComponentForItem, shouldRenderRepeatButton, isHiddenItem } from '../util/index';
import { QuestionniareInspector, IQuestionnaireInspector } from '../util/questionnaireInspector';
import { RenderContext } from '../util/renderContext';
import { Resources } from '../util/resources';
import { ScoringCalculator } from '../util/scoringCalculator';
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

export interface QueryStringsInterface {
  MessageId: string;
  ExternalId: string;
  Query?: string;
  ContentType?: string;
}

interface StateProps {
  formDefinition?: FormDefinition | null;
  formData?: FormData | null;
}

interface DispatchProps {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  mount: () => void;
  updateSkjema: (
    questionnaire: Questionnaire,
    questionnaireResponse?: QuestionnaireResponse,
    language?: string,
    syncQuestionnaireResponse?: boolean
  ) => void;
  path: Array<Path>;
}

interface Props {
  store?: Store<{}>;
  authorized: boolean;
  blockSubmit?: boolean;
  onSave?: (questionnaireResponse: QuestionnaireResponse) => void;
  onCancel?: () => void;
  onSubmit: (questionnaireResponse: QuestionnaireResponse) => void;
  loginButton: JSX.Element;
  resources?: Resources;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: Array<string>;
  onRequestAttachmentLink?: (fileId: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void, onError: (errormessage: TextMessage | null) => void) => void;
  uploadAttachment?: (
    files: File[],
    onSuccess: (uploadedFile: UploadedFile, attachment: Attachment) => void,
    onError: (errormessage: TextMessage | null) => void
  ) => void;
  questionnaire?: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  language?: string;
  sticky?: boolean;
  validateScriptInjection?: boolean;
  validationSummaryPlacement?: ValidationSummaryPlacement;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  syncQuestionnaireResponse?: boolean;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  submitButtonDisabled?: boolean;
  saveButtonDisabled?: boolean;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  onFieldsNotCorrectlyFilledOut?: () => void;
}

interface State {
  valid: boolean;
  validated: boolean;
  showCancelLightbox?: boolean;
}

class Refero extends React.Component<StateProps & DispatchProps & Props, State> {
  scoringCalculator: ScoringCalculator | undefined;

  constructor(props: StateProps & DispatchProps & Props) {
    super(props);

    this.state = {
      valid: true,
      validated: false,
      showCancelLightbox: false,
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
  }

  componentDidUpdate(): void {
    IE11HackToWorkAroundBug187484();
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.questionnaire && nextProps.questionnaire !== this.props.questionnaire) {
      this.props.updateSkjema(
        nextProps.questionnaire,
        nextProps.questionnaireResponse,
        nextProps.language,
        nextProps.syncQuestionnaireResponse
      );
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

  runScoringCalculator = (newState: GlobalState): void => {
    if (!this.scoringCalculator && this.props.formDefinition?.Content) {
      this.scoringCalculator = new ScoringCalculator(this.props.formDefinition.Content);
    }

    if (!this.scoringCalculator || !newState.refero?.form?.FormData?.Content || !newState.refero?.form?.FormDefinition?.Content) {
      return;
    }

    const scores = this.scoringCalculator.calculate(newState.refero.form.FormData.Content);
    const actions: Array<NewValueAction> = [];
    for (const linkId in scores) {
      const templateItem = this.scoringCalculator.getCachedTotalOrSectionItem(linkId);
      if (!templateItem) continue;

      const extension = getQuestionnaireUnitExtensionValue(templateItem);
      if (!extension) continue;

      const quantity = {
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as Quantity;

      const item = getQuestionnaireDefinitionItem(linkId, newState.refero.form.FormDefinition.Content?.item);
      const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, newState.refero.form.FormData.Content);

      let value = scores[linkId];
      if (item && value != null && !isNaN(value) && isFinite(value)) {
        const decimalPlacesExtension = getExtension(ExtensionConstants.STEP_URL, item);
        if (decimalPlacesExtension && decimalPlacesExtension.valueInteger != null) {
          const places = Number(decimalPlacesExtension.valueInteger);
          value = Number(value?.toFixed(places));
        }

        quantity.value = value;
      }

      for (const itemAndPath of itemsAndPaths) {
        actions.push(newQuantityValue(itemAndPath.path, quantity, item));
      }
    }

    for (const a of actions) {
      this.props.dispatch(a);
    }
  };

  renderFormItems(pdf?: boolean): Array<JSX.Element> | undefined {
    const { formDefinition, resources, formData, promptLoginMessage } = this.props;
    if (!formDefinition || !formDefinition.Content || !formDefinition.Content.item) {
      return undefined;
    }
    const contained = formDefinition.Content.contained;
    const renderedItems: Array<JSX.Element> | undefined = [];
    const isNavigatorEnabled = !!getNavigatorExtension(formDefinition.Content);
    let isNavigatorBlindzoneInitiated = false;
    formDefinition.Content.item.map(item => {
      if (isHiddenItem(item)) return [];

      const Comp = getComponentForItem(item.type);
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
                />
              </div>
            ) : undefined;
          const path = createPathForItem(this.props.path, item, responseItem, index);
          // legg på blindzone rett over den første seksjonen
          if (isNavigatorEnabled && item.type === ItemType.GROUP && !isNavigatorBlindzoneInitiated) {
            isNavigatorBlindzoneInitiated = true;
            renderedItems.push(<section id="navigator_blindzone"></section>);
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

  renderSkjema = (pdf?: boolean): Array<JSX.Element> | JSX.Element | null | undefined => {
    const { formDefinition, resources } = this.props;

    if (!formDefinition || !formDefinition.Content || !resources) {
      return null;
    }

    if (pdf) {
      return this.renderFormItems(true);
    }

    const presentationButtonsType = getPresentationButtonsExtension(formDefinition.Content);
    const form = this.props.authorized ? this.renderFormWhenAuthorized() : this.renderFormWhenNotAuthorized();

    return (
      <div className={this.getButtonClasses(presentationButtonsType, ['page_refero__content'])}>
        <div className="page_refero__messageboxes" />
        {form}
      </div>
    );
  };

  renderFormWhenNotAuthorized = (): JSX.Element | undefined => {
    const { resources } = this.props;
    if (!resources) {
      return;
    }

    return (
      <>
        <Form
          action="#"
          disabled={this.props.blockSubmit}
          errorMessage={resources.formError}
          requiredLabel={resources.formRequired}
          optionalLabel={resources.formOptional}
          triggerPreventDefaultOnSubmit
          validationSummaryPlacement={this.props.validationSummaryPlacement}
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
          submitButtonDisabled={this.props.submitButtonDisabled}
          pauseButtonDisabled={this.props.saveButtonDisabled}
          onFieldsNotCorrectlyFilledOut={this.props.onFieldsNotCorrectlyFilledOut}
        >
          {this.renderFormItems()}
        </Form>
        <div className="page_refero__buttonwrapper page_refero__saveblock">{this.props.loginButton}</div>
      </>
    );
  };

  renderFormWhenAuthorized = (): JSX.Element | undefined => {
    const { resources } = this.props;
    if (!resources) {
      return;
    }

    return (
      <>
        <Form
          action="#"
          disabled={this.props.blockSubmit}
          submitButtonText={resources.formSend}
          errorMessage={resources.formError}
          onSubmit={this.onSubmit}
          requiredLabel={resources.formRequired}
          optionalLabel={resources.formOptional}
          cancelButtonText={resources.formCancel}
          pauseButtonText={resources.formSave ? resources.formSave : 'Lagre'}
          onPause={this.props.onSave ? this.onSave : undefined}
          pauseButtonClasses={'page_refero__pausebutton'}
          pauseButtonType="display"
          submitButtonType="display"
          cancelButtonType="display"
          pauseButtonLevel="secondary"
          cancelButtonRight={true}
          onCancel={this.props.onCancel}
          buttonClasses="page_refero__saveblock"
          validationSummaryPlacement={this.props.validationSummaryPlacement}
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
          submitButtonDisabled={this.props.submitButtonDisabled}
          pauseButtonDisabled={this.props.saveButtonDisabled}
          onFieldsNotCorrectlyFilledOut={this.props.onFieldsNotCorrectlyFilledOut}
        >
          {this.renderFormItems()}
        </Form>
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

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: Props): DispatchProps {
  return {
    updateSkjema: (
      questionnaire: Questionnaire,
      questionnaireResponse: QuestionnaireResponse,
      language: string,
      syncQuestionnaireResponse: boolean
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

const ReferoContainer = connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(Refero);
export { ReferoContainer };
