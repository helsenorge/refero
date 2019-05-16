import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { SafeTextarea } from '@helsenorge/toolkit/components/atoms/safe-textarea';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import Constants from '../../../constants/index';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newStringValue } from '../../../actions/newValue';
import { isReadOnly, isRequired, getId, renderPrefix, getText, getStringValue, getMaxLength, getPDFStringValue } from '../../../util/index';
import { getValidationTextExtension, getPlaceholder, getMinLengthExtensionValue } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';
export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
}
class Text extends React.Component<Props & ValidationProps, {}> {
  showCounter(): boolean {
    if (getMaxLength(this.props.item) || getMinLengthExtensionValue(this.props.item)) {
      return true;
    }
    return false;
  }

  handleChange = (event: React.FormEvent<{}>) => {
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
    const { item, answer, pdf, ...other } = this.props;
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={getPDFStringValue(answer)} children={this.props.children} />;
    }
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_text">
        <Validation {...other}>
          <SafeTextarea
            id={getId(this.props.id)}
            rows={Constants.DEFAULT_TEXTAREA_HEIGHT}
            value={getStringValue(answer)}
            isRequired={isRequired(item)}
            showLabel={true}
            label={`${renderPrefix(item)} ${getText(item)}`}
            placeholder={getPlaceholder(item)}
            maxlength={getMaxLength(item)}
            minlength={getMinLengthExtensionValue(item)}
            counter={this.showCounter()}
            onBlur={this.handleChange}
            errorMessage={getValidationTextExtension(item)}
            allowInputOverMaxLength
          />
        </Validation>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Text);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedComponent;
