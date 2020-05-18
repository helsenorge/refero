import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction, newDecimalValueAsync } from '../../../actions/newValue';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import layoutChange from '@helsenorge/core-utils/hoc/layoutChange';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { isReadOnly, isRequired, getId, renderPrefix, getText, getDecimalPattern } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';

export interface Props {
  item: QuestionnaireItem;
  responseItem: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Decimal extends React.Component<Props & ValidationProps, {}> {
  getValue(): string | number | undefined {
    const { item, answer } = this.props;
    if (answer && answer.valueDecimal) {
      return Number(answer.valueDecimal);
    }
    if (!item || !item.initialDecimal) {
      return '';
    }
  }

  getPDFValue() {
    const value = this.getValue();
    if (!value) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  }

  handleChange = (event: React.FormEvent<{}>) => {
    const { dispatch, path, item, promptLoginMessage, onAnswerChange } = this.props;
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (dispatch) {
      dispatch(newDecimalValueAsync(path, value, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  shouldComponentUpdate(nextProps: Props, _nextState: {}) {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;

    return responseItemHasChanged || helpItemHasChanged;
  }

  render(): JSX.Element | null {
    const { item, pdf, onRenderMarkdown } = this.props;
    const value = this.getValue();
    if (pdf || isReadOnly(item)) {
      return (
        <TextView item={item} value={this.getPDFValue()} onRenderMarkdown={onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    }
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_decimal">
        <Validation {...this.props}>
          <SafeInputField
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value ? value + '' : ''}
            showLabel={true}
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            max={getMaxValueExtensionValue(item)}
            min={getMinValueExtensionValue(item)}
            onBlur={this.handleChange}
            errorMessage={getValidationTextExtension(item)}
            pattern={getDecimalPattern(item)}
            className="page_skjemautfyller__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
          >
            {!this.props.oneToTwoColumn ? this.props.renderDeleteButton() : null}
          </SafeInputField>
        </Validation>
        {this.props.oneToTwoColumn ? (
          <div>
            {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
            {this.props.repeatButton}
          </div>
        ) : (
          <div>{this.props.repeatButton}</div>
        )}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Decimal);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
