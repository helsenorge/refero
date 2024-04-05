import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { CommonFormElementProps } from '../../../types/formTypes/commonFormElementProps';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getText, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps {
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
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Boolean extends React.Component<Props> {
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
      path &&
        dispatch(newBooleanValueAsync(path, newValue, this.props.item))?.then(
          newState => onAnswerChange && onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseItemAnswer)
        );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getLabel = (): string => {
    return `${renderPrefix(this.props.item)} ${getText(
      this.props.item,
      this.props.onRenderMarkdown,
      this.props.questionnaire,
      this.props.resources
    )}`;
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
        <Checkbox
          label={this.getLabel()}
          checked={this.getValue()}
          disabled
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
        <FormGroup error={getValidationTextExtension(this.props.item)}>
          <Checkbox
            testId={getId(this.props.id)}
            label={<Label labelTexts={[{ text: this.getLabel() }]} afterLabelChildren={<>{this.props.renderHelpButton()}</>} />}
            required={isRequired(this.props.item)}
            checked={this.getValue()}
            onChange={this.handleChange}
            disabled={isReadOnly(this.props.item)}
            className="page_refero__input"
            // validateOnExternalUpdate={true}
            // isStyleBlue
          />
        </FormGroup>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
        {this.props.renderHelpElement()}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
