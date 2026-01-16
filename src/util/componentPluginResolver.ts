import type { QuestionnaireItem } from 'fhir/r4';

import { createPluginKey, type ComponentPluginRegistry, type PluginComponentProps } from '@/types/componentPlugin';
import { getItemControlExtensionValue } from '@/util/extension';

/**
 * Result of resolving a plugin for a questionnaire item
 */
export interface PluginResolutionResult {
  /** The plugin component to render, if found */
  component: React.ComponentType<PluginComponentProps> | undefined;
  /** The itemControl code that matched, if any */
  matchedCode: string | undefined;
}

/**
 * Resolves a plugin component for a given questionnaire item based on its itemControl extension.
 *
 * @param item - The FHIR QuestionnaireItem to find a plugin for
 * @param registry - The plugin registry containing registered plugins
 * @returns The resolution result containing the matched component and code, or undefined values if no match
 *
 * @example
 * ```typescript
 * const result = resolvePluginComponent(item, registry);
 * if (result.component) {
 *   return <result.component {...props} />;
 * }
 * // Fall back to built-in component
 * ```
 */
export function resolvePluginComponent(
  item: QuestionnaireItem | undefined,
  registry: ComponentPluginRegistry | undefined
): PluginResolutionResult {
  const noMatch: PluginResolutionResult = {
    component: undefined,
    matchedCode: undefined,
  };

  if (!item || !registry || registry.size === 0) {
    return noMatch;
  }

  // Get the itemControl codings from the item's extension
  const itemControlCodings = getItemControlExtensionValue(item);

  if (!itemControlCodings || itemControlCodings.length === 0) {
    return noMatch;
  }

  // Get the item type
  const itemType = item.type;
  if (!itemType) {
    return noMatch;
  }

  // Check each coding to see if we have a matching plugin
  for (const coding of itemControlCodings) {
    const code = coding.code;
    if (!code) {
      continue;
    }

    const pluginKey = createPluginKey(itemType, code);
    const plugin = registry.get(pluginKey);

    if (plugin) {
      return {
        component: plugin.component,
        matchedCode: code,
      };
    }
  }

  return noMatch;
}

/**
 * Checks if a questionnaire item has a registered plugin component.
 *
 * @param item - The FHIR QuestionnaireItem to check
 * @param registry - The plugin registry containing registered plugins
 * @returns true if a plugin is registered for this item's itemControl code
 *
 * @example
 * ```typescript
 * if (hasPluginComponent(item, registry)) {
 *   // Render plugin instead of built-in component
 * }
 * ```
 */
export function hasPluginComponent(item: QuestionnaireItem | undefined, registry: ComponentPluginRegistry | undefined): boolean {
  const result = resolvePluginComponent(item, registry);
  return result.component !== undefined;
}

/**
 * Gets the itemControl code from an item if it has a registered plugin.
 *
 * @param item - The FHIR QuestionnaireItem to check
 * @param registry - The plugin registry containing registered plugins
 * @returns The itemControl code if a plugin is registered, undefined otherwise
 */
export function getPluginItemControlCode(
  item: QuestionnaireItem | undefined,
  registry: ComponentPluginRegistry | undefined
): string | undefined {
  const result = resolvePluginComponent(item, registry);
  return result.matchedCode;
}
