import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Label from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getText, isReadOnly, isRequired, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import Pdf from './pdf';
import { ValidationProps } from '../../../types/formTypes/validation';
import { getValidationTextExtension } from '../../../util/extension';

export interface BooleanProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  onValidated?: (valid: boolean | undefined) => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Boolean: React.FC<BooleanProps & ValidationProps> = props => {
  const getValue = (): boolean => {
    const { item, answer } = props;
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
      return false;
    }
    return item.initial[0].valueBoolean;
  };

  const handleChange = (): void => {
    const { dispatch, promptLoginMessage, onAnswerChange, path, item } = props;
    const newValue = !getValue();
    if (dispatch) {
      dispatch(newBooleanValueAsync(props.path, newValue, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  React.useMemo(() => {
    const responseItemHasChanged = props.responseItem !== props.responseItem;
    const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
    const answerHasChanged = props.answer !== props.answer;
    const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
    const repeats = props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const labelText = `${renderPrefix(props.item)} ${getText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources)}`;

  if (props.pdf) {
    return <Pdf item={props.item} checked={getValue()} onRenderMarkdown={props.onRenderMarkdown} />;
  } else if (isReadOnly(props.item)) {
    //id={getId(this.props.id)}
    //isStyleBlue

    return (
      <Checkbox
        label={labelText}
        checked={getValue()}
        disabled
        onChange={(): void => {
          /*kan ikke endres, er alltid disabled*/
        }}
        className="page_refero__input"
      />
    );
  }

  // id={getId(this.props.id)}
  // helpButton={this.props.renderHelpButton()}
  // helpElement={this.props.renderHelpElement()}
  // validateOnExternalUpdate={true}
  // isStyleBlue

  return (
    // Dette er en hack for FHI-skjema. TODO: fjern hack
    <div className="page_refero__component page_refero__component_boolean">
      <Validation {...props}>
        <Checkbox
          label={<Label labelTexts={[{ text: labelText }]} afterLabelChildren={<>{props.renderHelpButton()}</>} />}
          required={isRequired(props.item)}
          checked={getValue()}
          onChange={handleChange}
          disabled={isReadOnly(props.item)}
          className="page_refero__input"
          errorText={getValidationTextExtension(props.item)}
        />
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
      {props.renderHelpElement()}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
