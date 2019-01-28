import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import CustomTag from '@helsenorge/toolkit/utils/custom-tag';
import { renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import withCommonFunctions from '../../with-common-functions';
import { Resources } from '../../../util/resources';

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  responseItem?: Array<QuestionnaireResponseItem>;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  pdf?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderChildrenItems: () => Array<JSX.Element> | undefined;
  repeatButton: JSX.Element;
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
      <section>
        {this.renderGroupHeader()}
        <div className="page_skjemautfyller__component">{this.props.renderChildrenItems()}</div>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
      </section>
    );
  };

  getComponentToValidate = (): undefined => {
    return undefined;
  };

  renderGroupHeader = (): JSX.Element | null => {
    if (!getText(this.props.item)) {
      return null;
    }
    const tagName = `h${this.props.headerTag}`;

    return <CustomTag tagName={tagName}>{renderPrefix(this.props.item) + ' ' + getText(this.props.item)}</CustomTag>;
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
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
