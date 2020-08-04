import * as React from 'react';
import { connect } from 'react-redux';
import { QuestionnaireItem, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import { CheckBox } from '@helsenorge/toolkit/components/atoms/checkbox';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import withCommonFunctions from '../../with-common-functions';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension } from '../../../util/extension';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Pdf from './pdf';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
export interface Props {
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseAnswer;
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
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Boolean extends React.Component<Props & ValidationProps, {}> {
  getValue(): boolean {
    const { item, answer } = this.props;
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initialBoolean) {
      return false;
    }
    return item.initialBoolean;
  }

  handleChange = (): void => {
    const { dispatch, promptLoginMessage, onAnswerChange, path, item } = this.props;
    const newValue = !this.getValue();
    if (dispatch) {
      dispatch(newBooleanValueAsync(this.props.path, newValue, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getLabel = (): JSX.Element => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: `${renderPrefix(this.props.item)} ${getText(this.props.item, this.props.onRenderMarkdown)}`,
        }}
      />
    );
  };

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || repeats;
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
          onChange={(): void => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_skjemautfyller__input"
        />
      );
    }
    return (
      // Dette er en hack for FHI-skjema. TODO: fjern hack
      <div className="page_skjemautfyller__component page_skjemautfyller__component_boolean">
        <Validation {...this.props}>
          <CheckBox
            label={this.getLabel()}
            id={getId(this.props.id)}
            isRequired={isRequired(this.props.item)}
            errorMessage={getValidationTextExtension(this.props.item)}
            checked={this.getValue()}
            onChange={this.handleChange}
            disabled={isReadOnly(this.props.item)}
            className="page_skjemautfyller__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
          />
        </Validation>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
