import * as React from 'react';

import { useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Label from '@helsenorge/designsystem-react/components/Label';

// import Validation from '@helsenorge/designsystem-react/components/Validation';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { getBooleanValue } from './utils';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension } from '../../../util/extension';
import { getId, getText, getTextValidationErrorMessage, isReadOnly, isRequired, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../types/resources';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

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
  // responseItem,
  // isHelpOpen,
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
  const { register, getFieldState } = useFormContext();

  const handleChange = (): void => {
    const newValue = !getBooleanValue(answer, item);
    if (dispatch) {
      dispatch(newBooleanValueAsync(path, newValue, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueBoolean: newValue } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };
  const filedState = getFieldState(getId(item.linkId));
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;

  if (pdf) {
    return <Pdf item={item} checked={getBooleanValue(answer, item)} onRenderMarkdown={onRenderMarkdown} />;
  } else if (isReadOnly(item)) {
    //id={getId(this.props.id)}

    return (
      <Checkbox
        label={labelText}
        checked={getBooleanValue(answer, item)}
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
  console.log('filedState', filedState);
  console.log('getValidationTextExtension', getValidationTextExtension(item));
  const getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? resources?.formRequiredErrorMessage : undefined;
  };
  return (
    <div className="page_refero__component page_refero__component_boolean">
      <Checkbox
        {...register(getId(item.linkId), {
          required: { value: isRequired(item), message: getRequiredErrorMessage(item) || '' },
          disabled: isReadOnly(item),
          onChange: handleChange,
        })}
        label={<Label labelTexts={[{ text: labelText }]} afterLabelChildren={<>{renderHelpButton()}</>} />}
        required={isRequired(item)}
        checked={getBooleanValue(answer, item)}
        onChange={handleChange}
        disabled={isReadOnly(item)}
        className="page_refero__input"
        errorText={filedState.error?.message}
        error={filedState.invalid}
      />
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
