import * as React from 'react';
import { connect, Store } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { NewValueAction, newQuantityValue } from '../actions/newValue';
import { Resources } from '../util/resources';
import { GlobalState } from '../reducers';
import { getFormDefinition, getFormData, getInitialFormData } from '../reducers/form';

import { getComponentForItem, shouldRenderRepeatButton, isHiddenItem } from '../util/index';
import { ScoringCalculator } from '../util/scoringCalculator';
import Form from '@helsenorge/toolkit/components/molecules/form';
import {
  getRootQuestionnaireResponseItemFromData,
  Path,
  createPathForItem,
  getAnswerFromResponseItem,
  shouldRenderDeleteButton,
  createIdSuffix,
  getQuestionnaireDefinitionItem,
  getResponseItemAndPathWithLinkId,
} from '../util/skjemautfyller-core';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  Attachment,
  QuestionnaireItem,
  QuestionnaireResponseAnswer,
  Quantity,
  decimal,
} from '../types/fhir';
import Constants from '../constants/index';
import { FormDefinition, FormData } from '../reducers/form';
import RepeatButton from '../components/formcomponents/repeat/repeat-button';

import { IE11HackToWorkAroundBug187484 } from '../util/hacks';
import 'redux-thunk';
import { UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';
import { setSkjemaDefinition } from '../actions/form';
import { TextMessage } from '../types/text-message';
import { ValidationSummaryPlacement } from '@helsenorge/toolkit/components/molecules/form/validationSummaryPlacement';
import { getQuestionnaireUnitExtensionValue } from '../util/extension';

export interface QueryStringsInterface {
  MessageId: string;
  ExternalId: string;
  Query?: string;
  ContentType?: string;
}

interface StateProps {
  formDefinition?: FormDefinition | null;
  formData?: FormData | null;
  initialFormData?: FormData | null;
}

interface DispatchProps {
  dispatch: ThunkDispatch<GlobalState, void, NewValueAction>;
  mount: () => void;
  updateSkjema: (questionnaire: Questionnaire, questionnaireResponse?: QuestionnaireResponse, language?: string) => void;
  path: Array<Path>;
}

interface Props {
  store?: Store<{}>;
  authorized: boolean;
  blockSubmit?: boolean;
  onSave: (questionnaireResponse: QuestionnaireResponse) => void;
  onCancel: () => void;
  onSubmit: (questionnaireResponse: QuestionnaireResponse) => void;
  loginButton: JSX.Element;
  resources?: Resources;
  pdf?: boolean;
  promptLoginMessage?: () => void;
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
}

interface State {
  valid: boolean;
  validated: boolean;
  showCancelLightbox?: boolean;
}

class Skjemautfyller extends React.Component<StateProps & DispatchProps & Props, State> {
  scoringCalculator: ScoringCalculator | undefined;

  constructor(props: StateProps & DispatchProps & Props) {
    super(props);

    this.state = {
      valid: true,
      validated: false,
      showCancelLightbox: false,
    };
  }

  onSubmit = () => {
    if (this.props.formData && this.props.formData.Content) {
      this.props.onSubmit(this.props.formData.Content);
    }
  };

  onSave = () => {
    if (this.props.formData && this.props.formData.Content) {
      this.props.onSave(this.props.formData.Content);
    }
  };

  componentDidMount(): void {
    this.props.mount();
  }

  componentDidUpdate(): void {
    IE11HackToWorkAroundBug187484();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.questionnaire && nextProps.questionnaire !== this.props.questionnaire) {
      this.props.updateSkjema(nextProps.questionnaire, nextProps.questionnaireResponse, nextProps.language);
    }
  }

  onAnswerChange = (
    newState: GlobalState,
    _path: Array<Path>,
    _item: QuestionnaireItem,
    _answer: QuestionnaireResponseAnswer | QuestionnaireResponseAnswer[]
  ) => {
    if (!this.scoringCalculator && this.props.formDefinition?.Content) {
      this.scoringCalculator = new ScoringCalculator(this.props.formDefinition.Content);
    }

    if (
      !this.scoringCalculator ||
      !newState.skjemautfyller?.form?.FormData?.Content ||
      !newState.skjemautfyller?.form?.FormDefinition?.Content
    ) {
      return;
    }

    const scores = this.scoringCalculator.calculate(newState.skjemautfyller.form.FormData.Content);
    let actions: Array<NewValueAction> = [];
    for (let linkId in scores) {
      const templateItem = this.scoringCalculator.getCachedTotalOrSectionItem(linkId);
      if (!templateItem) continue;

      const extension = getQuestionnaireUnitExtensionValue(templateItem);
      if (!extension) continue;

      const quantity = {
        value: (scores[linkId] as unknown) as decimal,
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as Quantity;

      const item = getQuestionnaireDefinitionItem(linkId, newState.skjemautfyller.form.FormDefinition.Content?.item);
      const itemsAndPaths = getResponseItemAndPathWithLinkId(linkId, newState.skjemautfyller.form.FormData.Content!);
      for (let itemAndPath of itemsAndPaths) {
        actions.push(newQuantityValue(itemAndPath.path, quantity, item));
      }
    }

    for (let a of actions) {
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
              <RepeatButton
                key={`item_${item.linkId}_add_repeat_item`}
                resources={this.props.resources}
                item={item}
                responseItems={responseItems}
                parentPath={this.props.path}
              />
            ) : (
              undefined
            );
          const path = createPathForItem(this.props.path, item, responseItem, index);
          renderedItems.push(
            <Comp
              pdf={pdf}
              promptLoginMessage={promptLoginMessage}
              key={`item_${responseItem.linkId}_${index}`}
              id={'item_' + responseItem.linkId + createIdSuffix(path, index, item.repeats)}
              item={item}
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
              attachmentMaxFileSize={this.props.attachmentMaxFileSize}
              attachmentValidTypes={this.props.attachmentValidTypes}
              validateScriptInjection={this.props.validateScriptInjection}
              onAnswerChange={this.onAnswerChange}
            />
          );
        });
      }
    });
    return renderedItems;
  }

  renderSkjema = (pdf?: boolean) => {
    const { formDefinition, resources } = this.props;

    if (!formDefinition || !formDefinition.Content || !resources) {
      return null;
    }

    if (pdf) {
      return this.renderFormItems(true);
    }

    const form = this.props.authorized ? this.renderFormWhenAuthorized() : this.renderFormWhenNotAuthorized();

    return (
      <div className="page_skjemautfyller__content">
        <div className="page_skjemautfyller__messageboxes" />
        {form}
      </div>
    );
  };

  renderFormWhenNotAuthorized = () => {
    const { resources } = this.props;
    if (!resources) {
      return;
    }

    return (
      <div>
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
        >
          {this.renderFormItems()}
        </Form>
        <div className="mol_actionconfirmationprompt page_skjemautfyller__saveblock">{this.props.loginButton}</div>
      </div>
    );
  };

  renderFormWhenAuthorized = () => {
    const { resources } = this.props;
    if (!resources) {
      return;
    }

    return (
      <div>
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
          onPause={this.onSave}
          pauseButtonClasses={'page_skjemautfyller__pausebutton'}
          onCancel={this.props.onCancel}
          buttonClasses="page_skjemautfyller__saveblock"
          validationSummaryPlacement={this.props.validationSummaryPlacement}
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
          sticky={this.props.sticky}
        >
          {this.renderFormItems()}
        </Form>
      </div>
    );
  };

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
    initialFormData: getInitialFormData(state),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<GlobalState, void, NewValueAction>, props: Props): DispatchProps {
  return {
    updateSkjema: (questionnaire: Questionnaire, questionnaireResponse: QuestionnaireResponse, language: string): void => {
      dispatch(setSkjemaDefinition(questionnaire, questionnaireResponse, language));
    },
    mount: (): void => {
      if (props.questionnaire) {
        dispatch(setSkjemaDefinition(props.questionnaire, props.questionnaireResponse, props.language));
      }
    },
    dispatch,
    path: [],
  };
}

const SkjemautfyllerContainer = connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(Skjemautfyller);
export { SkjemautfyllerContainer };
