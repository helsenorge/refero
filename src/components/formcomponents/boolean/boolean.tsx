import * as React from 'react';

import DOMPurify from 'dompurify';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import Pdf from './pdf';
import { NewValueAction, newBooleanValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { isReadOnly, getId, getText, renderPrefix, getSublabelText, isRequired, getLabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
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
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Boolean extends React.Component<Props> {
  getValue(): boolean {
    const { item, answer } = this.props;
    if (answer && answer.valueBoolean !== undefined) {
      return answer.valueBoolean;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueBoolean) {
      return false;
    }
    return item.initial[0].valueBoolean;
  }

  handleChange = (): void => {
    const { dispatch, promptLoginMessage, onAnswerChange, path, item } = this.props;
    const newValue = !this.getValue();
    if (dispatch) {
      path &&
        dispatch(newBooleanValueAsync(path, newValue, this.props.item))?.then(
          newState => onAnswerChange && onAnswerChange(newState, path, item, { valueBoolean: newValue })
        );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return (
      responseItemHasChanged ||
      helpItemHasChanged ||
      resourcesHasChanged ||
      repeats ||
      answerHasChanged ||
      this.props.error?.message !== nextProps.error?.message
    );
  }

  render(): JSX.Element | null {
    const {
      pdf,
      item,
      onRenderMarkdown,
      questionnaire,
      id,
      resources,
      renderHelpButton,
      renderHelpElement,
      renderDeleteButton,
      repeatButton,
      error,
      children,
      control,
      idWithLinkIdAndItemIndex,
    } = this.props;
    const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
    if (pdf) {
      return <Pdf item={item} checked={this.getValue()} onRenderMarkdown={onRenderMarkdown} />;
    } else if (isReadOnly(item)) {
      return (
        <Checkbox
          testId={`${getId(id)}-readonly`}
          label={<Label testId={`${getId(id)}-label-readonly`} labelTexts={[{ text: labelText }]} />}
          checked={this.getValue()}
          disabled={true}
          onChange={(): void => {
            /*kan ikke endres, er alltid disabled*/
          }}
          className="page_refero__input"
        />
      );
    }
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const value = this.getValue();
    return (
      // Dette er en hack for FHI-skjema. TODO: fjern hack
      <div className="page_refero__component page_refero__component_boolean">
        <FormGroup error={error?.message}>
          {renderHelpElement()}

          <Controller
            name={idWithLinkIdAndItemIndex}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
              },
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <Checkbox
                {...rest}
                testId={`${getId(id)}-boolean`}
                inputId={getId(id)}
                label={
                  <Label
                    labelId={`${getId(id)}-label-boolean`}
                    testId={`${getId(id)}-label-boolean`}
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    htmlFor={getId(id)}
                    className="page_refero__label"
                    sublabel={
                      <Sublabel
                        testId={`${getId(id)}-sublabel-boolean`}
                        id={`${getId(id)}-sublabel-boolean`}
                        sublabelTexts={[{ text: subLabelText, type: 'normal' }]}
                      />
                    }
                    afterLabelChildren={renderHelpButton()}
                  />
                }
                checked={value}
                onChange={(): void => {
                  this.handleChange();
                  onChange(!value);
                }}
                className="page_refero__input"
              />
            )}
          />
        </FormGroup>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </div>
    );
  }
}
const withFormProps = ReactHookFormHoc(Boolean);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
