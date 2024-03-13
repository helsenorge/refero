import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

// import Validation from '@helsenorge/designsystem-react/components/Validation';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { getBooleanValue } from './utils';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getText, isReadOnly, renderPrefix } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
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
  children: React.ReactNode;
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
}: BooleanProps): JSX.Element => {
  const formId = createFromIdFromPath(path);
  const { getFieldState, control } = useFormContext();
  const { error } = getFieldState(formId);

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

  return (
    <div className="page_refero__component page_refero__component_boolean">
      <FormGroup error={error?.message}>
        <Controller
          control={control}
          name={formId}
          render={({ field: { onChange, value, ref } }): React.ReactElement => (
            <Checkbox
              label={<Label labelTexts={[{ text: labelText }]} afterLabelChildren={<>{renderHelpButton()}</>} />}
              checked={value}
              className="page_refero__input"
              value={value}
              ref={ref}
              onChange={(): void => {
                const newValue = !getBooleanValue(answer, item);
                onChange(newValue);
                handleChange();
              }}
            />
          )}
        />
      </FormGroup>
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
