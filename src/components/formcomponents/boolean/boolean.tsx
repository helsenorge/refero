import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import { CheckBox } from '@helsenorge/form/components/checkbox';
import Validation from '@helsenorge/form/components/form/validation';
import { ValidationProps } from '@helsenorge/form/components/form/validation';

import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import Label from '../label';
import Pdf from './pdf';

export interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onValidated?: (valid: boolean | undefined) => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Boolean extends React.Component<Props & ValidationProps, {}> {
  getValue(): boolean {
    const { item, answer } = this.props;
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
      return false;
    }
    return item.initial[0].valueBoolean;
  }

  handleChange = (): void => {
    const { dispatch, promptLoginMessage, onAnswerChange, path, item } = this.props;
    const newValue = !this.getValue();
    if (dispatch) {
      dispatch(newBooleanValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getLabel = (): JSX.Element => {
    return (
      <Label
        item={this.props.item}
        onRenderMarkdown={this.props.onRenderMarkdown}
        questionnaire={this.props.questionnaire}
        resources={this.props.resources}
      />
    );
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  render(): JSX.Element | null {
    if (this.props.pdf) {
      return <Pdf item={this.props.item} checked={this.getValue()} onRenderMarkdown={this.props.onRenderMarkdown} />;
    } else if (isReadOnly(this.props.item)) {
      return (
        <CheckBox
          label={this.getLabel()}
          id={getId(this.props.id)}
          checked={this.getValue()}
          disabled
          isStyleBlue
          onChange={(): void => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_refero__input"
        />
      );
    }
    return (
      // Dette er en hack for FHI-skjema. TODO: fjern hack
      <div className="page_refero__component page_refero__component_boolean">
        <Validation {...this.props}>
          <CheckBox
            label={this.getLabel()}
            id={getId(this.props.id)}
            isRequired={isRequired(this.props.item)}
            errorMessage={getValidationTextExtension(this.props.item)}
            checked={this.getValue()}
            onChange={this.handleChange}
            disabled={isReadOnly(this.props.item)}
            className="page_refero__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
            isStyleBlue
          />
        </Validation>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
