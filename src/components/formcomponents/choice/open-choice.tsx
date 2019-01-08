import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import TextField from './text-field';
import Choice from './choice';
import { selectComponent, mergeProps, mapDispatchToProps, Path } from '../../../util/skjemautfyller-core';
import { newStringValue } from '../../../actions/newValue';
import { hasOptions } from '../../../util/choice';
import { QuestionnaireItem, QuestionnaireResponseAnswer, Resource } from '../../../types/fhir';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  dispatch?: Dispatch<{}>;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | undefined;
}

class OpenChoice extends React.Component<Props & ValidationProps, {}> {
  handleStringChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage } = this.props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValue(this.props.path, value, this.props.item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  renderChoice() {
    return <Choice {...this.props} />;
  }

  renderTextField() {
    const { id, pdf, item, answer, ...other } = this.props;
    return <TextField id={id} pdf={pdf} item={item} answer={answer} handleStringChange={this.handleStringChange} {...other} />;
  }

  render(): JSX.Element | null {
    return (
      <div className="page_skjemautfyller__component">
        {hasOptions(this.props.item, this.props.containedResources) ? this.renderChoice() : this.renderTextField()}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const connectedStringComponent = connect(selectComponent, mapDispatchToProps, mergeProps)(OpenChoice);
export default connectedStringComponent;
