import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { GlobalState } from '../../../reducers';
import { NewValueAction } from '../../../actions/newValue';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import CustomTag from '@helsenorge/toolkit/utils/custom-tag';
import { renderPrefix, getText, getId } from '../../../util/index';
import { QuestionnaireItem, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import withCommonFunctions from '../../with-common-functions';
import { Resources } from '../../../util/resources';
import { getGroupItemControl } from '../../../util/group-item-control';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  responseItem?: Array<QuestionnaireResponseItem>;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderChildrenItems: () => Array<JSX.Element> | undefined;
  repeatButton: JSX.Element;
  id?: string;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
}
interface State {
  counter?: number;
}
export class Group extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  renderAllItems = (): JSX.Element => {
    return (
      <section id={getId(this.props.id)}>
        {this.renderGroupHeader()}
        {this.props.renderHelpElement()}
        <div className={this.getClassNames()}>{this.props.renderChildrenItems()}</div>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </section>
    );
  };

  getClassNames = (): string => {
    const classNames = ['page_skjemautfyller__component', 'page_skjemautfyller__component_group'];
    const coding = getGroupItemControl(this.props.item);
    if (coding.length > 0) {
      classNames.push('page_skjemautfyller__itemControl_' + coding[0].code);
    }

    return classNames.join(' ');
  };

  getComponentToValidate = (): undefined => {
    return undefined;
  };

  renderGroupHeader = (): JSX.Element | null => {
    if (!getText(this.props.item)) {
      return null;
    }
    const tagName = `h${this.props.headerTag}`;

    return (
      <React.Fragment>
        <CustomTag tagName={tagName} className={'page_skjemautfyller__heading'}>
          {renderPrefix(this.props.item) + ' ' + getText(this.props.item)}
        </CustomTag>
        {this.props.renderHelpButton()}
      </React.Fragment>
    );
  };

  render(): JSX.Element | null {
    const { pdf } = this.props;

    if (pdf) {
      return <div>{this.renderAllItems()}</div>;
    }

    return this.renderAllItems();
  }
}
const withCommonFunctionsComponent = withCommonFunctions(Group);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withCommonFunctionsComponent);
export default connectedComponent;
