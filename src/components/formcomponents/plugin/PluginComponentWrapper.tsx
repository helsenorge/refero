import { useMemo } from 'react';

import { type FieldValues, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { PluginComponentProps } from '@/types/componentPlugin';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage } from '@/components/validation/rules';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { isReadOnly, getId } from '@/util/index';
import { createPluginValueChangeHandler } from '@/util/pluginValueHandler';

export interface PluginComponentWrapperProps extends QuestionnaireComponentItemProps {
  /** The plugin component to render */
  PluginComponent: React.ComponentType<PluginComponentProps>;
}

/**
 * Wrapper component that handles common functionality for plugin components.
 *
 * Responsibilities:
 * 1. Fetches item from Redux state
 * 2. Gets answer via useGetAnswer hook
 * 3. Provides unified onValueChange callback
 * 4. Handles react-hook-form integration
 * 5. Renders ReferoLabel
 * 6. Renders the plugin component with simplified props
 * 7. Renders delete/repeat buttons
 * 8. Renders nested children
 */
export const PluginComponentWrapper = (props: PluginComponentWrapperProps): JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, children, index, linkId, PluginComponent } = props;

  // Get item from Redux
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  // Get external render context - same pattern as Integer, Choice, etc.
  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  // Get form context for validation
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  // Get dispatch and answer
  const dispatch = useAppDispatch();
  const answer = useGetAnswer(linkId, path);

  // Reset form field when answer changes
  useResetFormField(idWithLinkIdAndItemIndex, answer);

  // Create the value change handler for the plugin
  // Uses async actions + onAnswerChange - same pattern as Integer, Choice, etc.
  const handleValueChange = useMemo(() => {
    if (!item) return (): void => {};
    return createPluginValueChangeHandler(dispatch, path, item, onAnswerChange, promptLoginMessage, answer);
  }, [dispatch, path, item, onAnswerChange, promptLoginMessage, answer]);

  const errorMessage = getErrorMessage(item, error);
  const readOnly = isReadOnly(item);

  // Plugin props - simplified interface
  const pluginProps: PluginComponentProps = useMemo(
    () => ({
      item: item!,
      answer,
      onValueChange: handleValueChange,
      error,
      resources,
      pdf,
      readOnly,
      id: getId(id),
      path,
      index,
      children,
    }),
    [item, answer, handleValueChange, error, resources, pdf, readOnly, id, path, index, children]
  );

  // Guard: item must exist
  if (!item) {
    return null;
  }

  // PDF or ReadOnly mode - render simplified view
  if (pdf || readOnly) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={answer}
        pdfValue={resources?.ikkeBesvart || ''}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }

  return (
    <div className="page_refero__component page_refero__component_plugin">
      <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-plugin-label`}
          testId={`${getId(id)}-plugin-label`}
          formFieldTagId={`${getId(id)}-plugin-formfieldtag`}
        />

        {/* Render the plugin component */}
        <PluginComponent {...pluginProps} />

        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};

export default PluginComponentWrapper;
