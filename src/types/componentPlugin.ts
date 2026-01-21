import type { AppDispatch, GlobalState } from '@/reducers';
import type { Path } from '@/util/refero-core';
import type { Resources } from '@/util/resources';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import type { FieldError } from 'react-hook-form';

/**
 * Type for the onAnswerChange callback that plugins receive.
 * This is called after dispatching an action to notify about answer changes.
 */
export type OnAnswerChange = (state: GlobalState, item: QuestionnaireItem, answer?: QuestionnaireResponseItemAnswer) => void;

/**
 * Props passed to plugin components.
 * This is a simplified, stable interface that abstracts away internal implementation details.
 * Plugin components should only depend on these props.
 */
export interface PluginComponentProps {
  /** The questionnaire item definition */
  item: QuestionnaireItem;

  /** Current answer value(s) for this item */
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined;

  /**
   * Redux dispatch function for dispatching actions.
   * Use with actions from refero (e.g., newIntegerValueAsync, newCodingValueAsync).
   *
   * Example usage:
   * ```tsx
   * dispatch(newIntegerValueAsync(path, value, item))?.then(newState =>
   *   onAnswerChange(newState, item, { valueInteger: value })
   * );
   * ```
   */
  dispatch: AppDispatch;

  /**
   * Callback to notify about answer changes.
   * Call this after dispatching an action to trigger calculators, enableWhen, etc.
   */
  onAnswerChange: OnAnswerChange;

  /** Form validation error, if any */
  error?: FieldError;

  /** Localization resources */
  resources?: Resources;

  /** Whether rendering for PDF output */
  pdf?: boolean;

  /** Whether the field is read-only */
  readOnly?: boolean;

  /** Unique identifier for the field */
  id: string;

  /**
   * Unique identifier for form registration with react-hook-form.
   * Use this when calling register() for validation.
   */
  idWithLinkIdAndItemIndex: string;

  /** Path to this item in the questionnaire response */
  path: Path[];

  /** Index of this item (for repeated items) */
  index: number;

  /**
   * Children elements containing delete/repeat buttons and nested items.
   * Plugins should render this inside their FormGroup or at the end of their component.
   */
  children?: React.ReactNode;

  /**
   * Optional callback to prompt login message.
   * Call this when the user interacts with the field.
   */
  promptLoginMessage?: () => void;
}

/**
 * Single plugin registration.
 * Defines which item type and itemControl code combination this plugin handles.
 */
export interface ComponentPlugin {
  /** Item type this plugin applies to (e.g., 'integer', 'string', 'choice') */
  itemType: string;

  /** ItemControl code that triggers this plugin (e.g., 'slider', 'spinner') */
  itemControlCode: string;

  /** The React component to render */
  component: React.ComponentType<PluginComponentProps>;
}

/**
 * Registry mapping plugin keys to plugin definitions.
 * Key format: "itemType:itemControlCode" (e.g., "integer:slider")
 */
export type ComponentPluginRegistry = Map<string, ComponentPlugin>;

/**
 * Creates a registry key from item type and itemControl code.
 * @param itemType - The questionnaire item type (e.g., 'integer', 'string')
 * @param itemControlCode - The itemControl extension code (e.g., 'slider', 'spinner')
 * @returns The registry key in format "itemType:itemControlCode"
 */
export const createPluginKey = (itemType: string, itemControlCode: string): string => `${itemType}:${itemControlCode}`;

/**
 * Creates a ComponentPluginRegistry from an array of plugins.
 * @param plugins - Array of plugin definitions
 * @returns A Map registry for efficient lookup
 */
export const createPluginRegistry = (plugins: ComponentPlugin[]): ComponentPluginRegistry => {
  const registry = new Map<string, ComponentPlugin>();
  for (const plugin of plugins) {
    const key = createPluginKey(plugin.itemType, plugin.itemControlCode);
    registry.set(key, plugin);
  }
  return registry;
};
