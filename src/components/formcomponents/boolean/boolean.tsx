import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Label from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension } from '../../../util/extension';
import { getText, isReadOnly, isRequired, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';

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

const Boolean = ({
  item,
  answer,
  path,
  dispatch,
  promptLoginMessage,
  onAnswerChange,
  responseItem,
  isHelpOpen,
  resources,
  onRenderMarkdown,
  questionnaire,
  pdf,
  renderDeleteButton,
  repeatButton,
  children,
  renderHelpElement,
  renderHelpButton,
}: BooleanProps & ValidationProps): JSX.Element => {
  const getValue = (): boolean => {
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
      return false;
    }
    return item.initial[0].valueBoolean;
  };

  const handleChange = (): void => {
    const newValue = !getValue();
    if (dispatch) {
      dispatch(newBooleanValueAsync(path, newValue, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  React.useMemo(() => {
    const responseItemHasChanged = responseItem !== responseItem;
    const helpItemHasChanged = isHelpOpen !== isHelpOpen;
    const answerHasChanged = answer !== answer;
    const resourcesHasChanged = JSON.stringify(resources) !== JSON.stringify(resources);
    const repeats = item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [responseItem, isHelpOpen, answer, resources, item]);

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;

  if (pdf) {
    return <Pdf item={item} checked={getValue()} onRenderMarkdown={onRenderMarkdown} />;
  } else if (isReadOnly(item)) {
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
      <Validation>
        <Checkbox
          label={<Label labelTexts={[{ text: labelText }]} afterLabelChildren={<>{renderHelpButton()}</>} />}
          required={isRequired(item)}
          checked={getValue()}
          onChange={handleChange}
          disabled={isReadOnly(item)}
          className="page_refero__input"
          errorText={getValidationTextExtension(item)}
        />
      </Validation>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      {renderHelpElement()}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(Boolean);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
