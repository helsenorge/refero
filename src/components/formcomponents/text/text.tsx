import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction } from '../../../actions/newValue';
import { SafeTextarea } from '@helsenorge/toolkit/components/atoms/safe-textarea';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import ExpandableBlock from '@helsenorge/toolkit/components/atoms/expandable-block';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import Constants from '../../../constants/index';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newStringValue } from '../../../actions/newValue';
import {
  isReadOnly,
  isRequired,
  getId,
  renderPrefix,
  getText,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
} from '../../../util/index';
import { getPlaceholder, getMinLengthExtensionValue, getItemControlExtensionValue } from '../../../util/extension';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';
import { Resources } from '../../../util/resources';
import itemControlConstants from '../../../constants/itemcontrol';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  resources?: Resources;
}
export class Text extends React.Component<Props & ValidationProps, {}> {
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

  validateText = (value: string): boolean => {
    return validateText(value, this.props.validateScriptInjection);
  };

  getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, this.props.validateScriptInjection, this.props.item, this.props.resources);
  };

  render(): JSX.Element | null {
    const { item, answer, pdf, children, ...other } = this.props;
    const itemControls = getItemControlExtensionValue(item);

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
      return (
        <ExpandableBlock expandButtonText={item.text}>
          <React.Fragment>{children}</React.Fragment>
        </ExpandableBlock>
      );
    }

    if (pdf || isReadOnly(item)) {
      return (
        <TextView item={item} value={getPDFStringValue(answer)}>
          {this.props.children}
        </TextView>
      );
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
            validator={this.validateText}
            errorMessage={this.getValidationErrorMessage}
            allowInputOverMaxLength
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
          />
        </Validation>
        <div>
          {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
          {this.props.repeatButton}
        </div>
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
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
