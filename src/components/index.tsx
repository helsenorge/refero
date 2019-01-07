import * as React from 'react';
import { connect, Store } from 'react-redux';
import { Dispatch } from 'redux';
import { Resources } from '../../npm/types/Resources';
import { GlobalState } from '../reducers';
import { getFormDefinition, getFormData, getInitialFormData } from '../reducers/form';

import { getComponentForItem, shouldRenderRepeatButton } from '../util/index';
import Form from '@helsenorge/toolkit/components/molecules/form';
import {
  getQuestionnaireResponseItemFromData,
  Path,
  createPathForItem,
  getAnswerFromResponseItem,
  shouldRenderDeleteButton,
} from '../util/skjemautfyller-core';
import {
  QuestionnaireResponseItem,
  QuestionnaireResponseAnswer,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireItem,
} from '../types/fhir';
import Constants from '../constants/index';
import { FormDefinition, FormData } from '../reducers/form';
import RepeatButton from '../components/formcomponents/repeat/repeat-button';

import { IE11HackToWorkAroundBug187484 } from '../util/hacks';
import 'redux-thunk';
import { TextMessage, UploadedFile } from '@helsenorge/toolkit/components/atoms/dropzone';

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
  // questionnaire: Questionnaire | null | undefined;
  // questionnaireResponse: QuestionnaireResponse | null | undefined;
}

interface DispatchProps {
  dispatch?: Dispatch<{}>;
  mount?: () => void;
  path: Array<Path>;
}

interface Props {
  store?: Store<{}>;
  authorized: boolean;
  blockSubmit?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  loginButton: JSX.Element;
  resources?: Resources;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  onRequestAttachmentLink?: (fileId: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (
    itemPath: Array<Path>,
    item: QuestionnaireItem | undefined,
    fileId: string,
    cb: (success: boolean, errorMessage: TextMessage | null) => void
  ) => void;
  uploadAttachment?: (
    itemPath: Array<Path>,
    files: File[],
    item: QuestionnaireItem | undefined,
    cb: (success: boolean, errormessage: TextMessage | null, uploadedFile?: UploadedFile) => void
  ) => void;
}

interface State {
  valid: boolean;
  validated: boolean;
  showCancelLightbox?: boolean;
}

class Skjemautfyller extends React.Component<StateProps & DispatchProps & Props, State> {
  constructor(props: StateProps & DispatchProps & Props) {
    super(props);

    this.state = {
      valid: true,
      validated: false,
      showCancelLightbox: false,
    };
  }

  componentDidMount(): void {
    if (this.props.mount) {
      this.props.mount();
    }
  }

  componentDidUpdate(): void {
    IE11HackToWorkAroundBug187484();
  }

  // componentWillReceiveProps(nextProps: StateProps) {
  //   if (this.props.questionnaire != nextProps.questionnaire) {
  //     //dispatch(getUpdateQuestionnaireAction(next.props.questionnaire))
  //   }
  // }

  renderFormItems(pdf?: boolean): Array<JSX.Element> | undefined {
    const { formDefinition, resources, formData, promptLoginMessage } = this.props;
    if (!formDefinition || !formDefinition.Content || !formDefinition.Content.item) {
      return undefined;
    }
    const contained = formDefinition.Content.contained;
    let renderedItems = new Array();
    formDefinition.Content.item.map(item => {
      const Comp = getComponentForItem(item.type);
      if (!Comp) {
        return undefined;
      }
      let responseItems: Array<QuestionnaireResponseItem> | undefined;
      if (formData) {
        responseItems = getQuestionnaireResponseItemFromData(item.linkId, formData, true);
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
          renderedItems.push(
            <Comp
              pdf={pdf}
              promptLoginMessage={promptLoginMessage}
              key={`item_${responseItem.linkId}_${index}`}
              item={item}
              responseItem={responseItem}
              answer={getAnswerFromResponseItem(responseItem)}
              resources={resources}
              containedResources={contained}
              path={createPathForItem(this.props.path, item, responseItem)}
              headerTag={Constants.DEFAULT_HEADER_TAG}
              visibleDeleteButton={shouldRenderDeleteButton(item, index)}
              repeatButton={repeatButton}
              onRequestAttachmentLink={this.props.onRequestAttachmentLink}
              onOpenAttachment={this.props.onOpenAttachment}
              onDeleteAttachment={this.props.onDeleteAttachment}
              uploadAttachment={this.props.uploadAttachment}
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

    let form = this.props.authorized ? this.renderFormWhenAuthorized() : this.renderFormWhenNotAuthorized();

    return (
      <div className="page_skjemautfyller__content">
        <div className="page_skjemautfyller__messageboxes" />
        {form}
      </div>
    );
  };

  renderFormWhenNotAuthorized = () => {
    let { resources } = this.props;
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
    let { resources } = this.props;
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
          onSubmit={this.props.onSubmit}
          requiredLabel={resources.formRequired}
          optionalLabel={resources.formOptional}
          cancelButtonText={resources.formCancel}
          pauseButtonText={'Fortsett senere'}
          onPause={this.props.onSave}
          pauseButtonClasses={'atom_inline-btn pause page_skjemautfyller__pausebutton'}
          onCancel={this.props.onCancel}
          buttonClasses="page_skjemautfyller__saveblock"
          validationSummary={{
            enable: true,
            header: resources.validationSummaryHeader,
          }}
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
  //let questionnaire: Questionnaire | null | undefined = null,
  //  questionnaireResponse: QuestionnaireResponse | null | undefined = null;
  //
  //if (state.skjemautfyller.skjema) {
  //  questionnaire = state.skjemautfyller.skjema.FormDefinition.Content;
  //  questionnaireResponse = state.skjemautfyller.skjema.FormData.Content;
  //}

  return {
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
    initialFormData: getInitialFormData(state),
    // questionnaire,
    // questionnaireResponse,
  };
}

function mapDispatchToProps(dispatch: Dispatch<{}>): DispatchProps {
  return {
    mount: (): void => {},
    dispatch,
    path: [],
  };
}

const SkjemautfyllerContainer = connect<StateProps, DispatchProps, Props>(mapStateToProps, mapDispatchToProps)(Skjemautfyller);
export { SkjemautfyllerContainer };
