import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newIntegerValue } from '../../../actions/newValue';
import withCommonFunctions from '../../with-common-functions';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';
export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  resources?: Resources;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
}

class Integer extends React.Component<Props & ValidationProps, {}> {
  getValue(): string | number | undefined {
    const { item, answer } = this.props;
    if (answer && answer.valueInteger !== undefined && answer.valueInteger !== null) {
      return answer.valueInteger;
    }
    if (!item || !item.initialInteger) {
      return '';
    }
  }

  getPDFValue() {
    const value = this.getValue();
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  }

  handleChange = (event: React.FormEvent<{}>) => {
    const { dispatch, promptLoginMessage } = this.props;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch) {
      dispatch(newIntegerValue(this.props.path, value, this.props.item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  render(): JSX.Element | null {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return <TextView item={this.props.item} value={this.getPDFValue()} children={this.props.children} />;
    }
    const value = this.getValue();
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_integer">
        <Validation {...this.props}>
          <SafeInputField
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value !== undefined && value !== null ? value + '' : ''}
            showLabel={true}
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(this.props.item)} ${getText(this.props.item)}`,
                }}
              />
            }
            isRequired={isRequired(this.props.item)}
            placeholder={getPlaceholder(this.props.item)}
            max={getMaxValueExtensionValue(this.props.item)}
            min={getMinValueExtensionValue(this.props.item)}
            errorMessage={getValidationTextExtension(this.props.item)}
            inputProps={{
              step: 1,
              onKeyPress: (e: React.KeyboardEvent<{}>) => {
                let key = String.fromCharCode(e.which);
                if ('0123456789-'.indexOf(key) === -1) {
                  e.preventDefault();
                }
              },
            }}
            className="page_skjemautfyller__input"
            onBlur={this.handleChange}
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

const withCommonFunctionsComponent = withCommonFunctions(Integer);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
