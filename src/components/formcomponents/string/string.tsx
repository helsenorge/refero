import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newStringValue } from '../../../actions/newValue';
import { isReadOnly, isRequired, getId, renderPrefix, getText, getStringValue, getMaxLength, getPDFStringValue } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import withCommonFunctions from '../../with-common-functions';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import TextView from '../textview';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  path: Array<Path>;
  dispatch?: Dispatch<{}>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  visibleDeleteButton: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
}

class String extends React.Component<Props & ValidationProps, {}> {
  handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage } = this.props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValue(this.props.path, value, this.props.item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getLabel(item: QuestionnaireItem) {
    return <span dangerouslySetInnerHTML={{ __html: `${renderPrefix(item)} ${getText(item)}` }} />;
  }

  render(): JSX.Element | null {
    const { item, pdf, resources, answer } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={getPDFStringValue(answer, resources)} children={this.props.children} />;
    }

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_string">
        <Validation {...this.props}>
          <SafeInputField
            type="text"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={getStringValue(answer)}
            showLabel={true}
            label={this.getLabel(item)}
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            minLength={getMinLengthExtensionValue(item)}
            maxLength={getMaxLength(item)}
            onBlur={this.handleChange}
            pattern={getRegexExtension(item)}
            errorMessage={getValidationTextExtension(item)}
            className="page_skjemautfyller__input"
            allowInputOverMaxLength
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
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
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
