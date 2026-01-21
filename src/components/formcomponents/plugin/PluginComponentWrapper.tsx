import { useMemo } from 'react';

import { type FieldValues, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { PluginComponentProps } from '@/types/componentPlugin';

import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { isReadOnly, getId } from '@/util/index';

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
 * 3. Provides dispatch and onAnswerChange for value changes
 * 4. Provides form error state for validation
 * 5. Renders the plugin component with all necessary props
 * 6. Renders delete/repeat buttons
 * 7. Renders nested children
 *
 * Note: Plugins are responsible for their own UI including labels and error display.
 * Use ReferoLabel from refero exports if you want the standard label styling.
 */
export const PluginComponentWrapper = (props: PluginComponentWrapperProps): React.JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, children, index, linkId, PluginComponent } = props;

  // Get item from Redux
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  // Get external render context - same pattern as Integer, Choice, etc.
  const { promptLoginMessage, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  // Get form context for error state (plugins register their own fields for validation)
  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  // Get dispatch and answer
  const dispatch = useAppDispatch();
  const answer = useGetAnswer(linkId, path);

  // Reset form field when answer changes
  useResetFormField(idWithLinkIdAndItemIndex, answer);

  const readOnly = isReadOnly(item);

  // Plugin props - provides everything plugins need to render and handle value changes
  const pluginProps: PluginComponentProps = useMemo(
    () => ({
      item: item!,
      answer,
      dispatch,
      onAnswerChange,
      error,
      resources,
      pdf,
      readOnly,
      id: getId(id),
      idWithLinkIdAndItemIndex,
      path,
      index,
      children,
      promptLoginMessage,
    }),
    [
      item,
      answer,
      dispatch,
      onAnswerChange,
      error,
      resources,
      pdf,
      readOnly,
      id,
      idWithLinkIdAndItemIndex,
      path,
      index,
      children,
      promptLoginMessage,
    ]
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

  // Render delete/repeat buttons to pass as children to plugin
  const repeatDeleteButtons = (
    <>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
    </>
  );

  return (
    <div className="page_refero__component page_refero__component_plugin">
      {/* Render the plugin component - plugins handle their own label and error display */}
      {/* Delete/repeat buttons and nested children are passed as children for plugins to render inside their FormGroup */}
      <PluginComponent {...pluginProps}>
        {repeatDeleteButtons}
        {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
      </PluginComponent>
    </div>
  );
};

export default PluginComponentWrapper;
