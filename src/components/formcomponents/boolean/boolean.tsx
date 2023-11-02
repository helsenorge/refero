import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Label from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getText, isReadOnly, isRequired, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import Pdf from './pdf';
import { ValidationProps } from '../../../types/formTypes/validation';
import { getValidationTextExtension } from '../../../util/extension';

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

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  render(): JSX.Element | null {
    const labelText = `${renderPrefix(this.props.item)} ${getText(
      this.props.item,
      this.props.onRenderMarkdown,
      this.props.questionnaire,
      this.props.resources
    )}`;

    if (this.props.pdf) {
      return <Pdf item={this.props.item} checked={this.getValue()} onRenderMarkdown={this.props.onRenderMarkdown} />;
    } else if (isReadOnly(this.props.item)) {
      //id={getId(this.props.id)}
      //isStyleBlue

      return (
        <Checkbox
          label={labelText}
          checked={this.getValue()}
          disabled
          onChange={(): void => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_refero__input"
        />
      );
    }

    // id={getId(this.props.id)}
    // helpButton={this.props.renderHelpButton()}
    // helpElement={this.props.renderHelpElement()}
    // validateOnExternalUpdate={true}
    // isStyleBlue

    return (
      // Dette er en hack for FHI-skjema. TODO: fjern hack
      <div className="page_refero__component page_refero__component_boolean">
        <Validation {...this.props}>
          <Checkbox
            label={<Label labelTexts={[{ text: labelText }]} afterLabelChildren={<>{this.props.renderHelpButton()}</>} />}
            required={isRequired(this.props.item)}
            checked={this.getValue()}
            onChange={this.handleChange}
            disabled={isReadOnly(this.props.item)}
            className="page_refero__input"
            errorText={getValidationTextExtension(this.props.item)}
          />
        </Validation>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
        {this.props.renderHelpElement()}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
