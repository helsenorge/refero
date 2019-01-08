import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { CheckBox } from '@helsenorge/toolkit/components/atoms/checkbox';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import withCommonFunctions from '../../with-common-functions';
import { selectComponent, mergeProps, mapDispatchToProps, Path } from '../../../util/skjemautfyller-core';
import { newBooleanValue } from '../../../actions/newValue';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { getValidationTextExtension } from '../../../util/extension';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import Pdf from './pdf';
export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onValidated?: (valid: boolean | undefined) => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
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

  handleChange = () => {
    const { dispatch, promptLoginMessage } = this.props;
    const newValue = !this.getValue();
    if (dispatch) {
      dispatch(newBooleanValue(this.props.path, newValue, this.props.item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  render(): JSX.Element | null {
    if (this.props.pdf) {
      return <Pdf item={this.props.item} checked={this.getValue()} />;
    } else if (isReadOnly(this.props.item)) {
      return (
        <CheckBox
          label={
            <span
              dangerouslySetInnerHTML={{
                __html: `${renderPrefix(this.props.item)} ${getText(this.props.item)}`,
              }}
            />
          }
          id={getId(this.props.id)}
          checked={this.getValue()}
          disabled
          onChange={() => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_skjemautfyller__input"
        />
      );
    }
    return (
      // Dette er en hack for FHI-skjema. TODO: fjern hack
      <div className="page_skjemautfyller__component">
        <Validation {...this.props}>
          <CheckBox
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(this.props.item)} ${getText(this.props.item)}`,
                }}
              />
            }
            id={getId(this.props.id)}
            isRequired={isRequired(this.props.item)}
            errorMessage={getValidationTextExtension(this.props.item)}
            checked={this.getValue()}
            onChange={this.handleChange}
            disabled={isReadOnly(this.props.item)}
            className="page_skjemautfyller__input"
          />
        </Validation>
        {this.props.oneToTwoColumn ? (
          <div>
            {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
            {this.props.repeatButton}
          </div>
        ) : (
          <React.Fragment>
            {this.props.renderDeleteButton()}
            <div>{this.props.repeatButton}</div>
          </React.Fragment>
        )}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(selectComponent, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
