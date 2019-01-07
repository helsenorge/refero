import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import { selectComponent, mergeProps, mapDispatchToProps, Path } from '../../../util/skjemautfyller-core';
import { newStringValue } from '../../../actions/newValue';
import { isReadOnly, isRequired, getId, renderPrefix, getText, getStringValue, getMaxLength, getPDFStringValue } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
import withCommonFunctions from '../../with-common-functions';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../../npm/types/Resources';
import TextView from '../textview';
interface Props {
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

  render(): JSX.Element | null {
    const { item, pdf, resources, answer } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={getPDFStringValue(answer, resources)} children={this.props.children} />;
    }
    return (
      <div className="page_skjemautfyller__component">
        <Validation {...this.props}>
          <SafeInputField
            type="text"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={getStringValue(answer)}
            showLabel={true}
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            minLength={getMinLengthExtensionValue(item)}
            maxLength={getMaxLength(item)}
            onBlur={this.handleChange}
            pattern={getRegexExtension(item)}
            errorMessage={getValidationTextExtension(item)}
            className="page_skjemautfyller__input"
            allowInputOverMaxLength
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
const connectedComponent = connect(selectComponent, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
