# ItemControl Component Plugin System

## Overview

Create a runtime plugin system where consuming apps pass a configuration mapping itemControl codes to custom React components, allowing
component injection without bundling custom components inside refero.

---

## Architecture Notes

### Current Component Structure

The rendering flow is:

1. `GenerateQuestionnaireComponents` → iterates over items
2. `ItemRenderer` → calls `getComponentForItem(item.type)` to get component (e.g., `Integer`, `String`)
3. `RenderResponseItems` / `ResponseItem` → renders the component with props
4. Type component (e.g., `Integer`) → handles all logic internally

### Key Observations

- **Item vs ItemControl**: `item.type` determines the base component (string, integer, choice, etc.). The `itemControl` extension determines
  the **variant** (e.g., slider, dropdown, checkbox).
- **ItemControl switching happens inside type components**: See `choice.tsx` which switches between `DropdownView`, `RadioView`,
  `CheckboxView`, `SliderView` based on itemControl.
- **Each type has its own action**: `newStringValueAsync`, `newIntegerValueAsync`, `newCodingValueAsync`, etc.
- **Common boilerplate in every component**:
  - Fetch `item` from Redux via `useAppSelector(findQuestionnaireItem)`
  - Get `answer` via `useGetAnswer` hook
  - React-hook-form integration (`register`, `useResetFormField`, validation rules)
  - Render `ReferoLabel`, `RenderDeleteButton`, `RenderRepeatButton`
  - Render nested `children`

---

## Tasks

### Task 1: Define Plugin Types

**File:** `src/types/componentPlugin.ts` (new)

Define TypeScript interfaces for the plugin system:

```typescript
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import type { FieldError } from 'react-hook-form';
import type { Path } from '@/util/refero-core';
import type { Resources } from '@/types/resources';

/** Props passed to plugin components - simplified interface */
export interface PluginComponentProps {
  // Item & Answer
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined;

  // Value change handler - unified interface
  onValueChange: (value: QuestionnaireResponseItemAnswer) => void;
  onValueClear?: () => void;

  // Validation
  error?: FieldError;

  // Context
  resources?: Resources;
  pdf?: boolean;
  readOnly?: boolean;

  // Identifiers
  id: string;
  path: Path[];
  index: number;

  // For custom rendering needs
  children?: React.ReactNode;
}

/** Single plugin registration */
export interface ComponentPlugin {
  /** Item type this plugin applies to (e.g., 'integer', 'string', 'choice') */
  itemType: string;
  /** ItemControl code that triggers this plugin (e.g., 'slider', 'spinner') */
  itemControlCode: string;
  /** The React component to render */
  component: React.ComponentType<PluginComponentProps>;
}

/** Registry mapping "itemType:itemControlCode" to plugin */
export type ComponentPluginRegistry = Map<string, ComponentPlugin>;

/** Helper to create registry key */
export const createPluginKey = (itemType: string, itemControlCode: string): string => `${itemType}:${itemControlCode}`;
```

---

### Task 2: Create Plugin Context

**Files:** `src/context/componentPlugin/` (new folder)

Create React context to distribute the plugin registry:

- `ComponentPluginContext.tsx` - The context definition
- `ComponentPluginProvider.tsx` - Provider component
- `useComponentPlugin.tsx` - Hook to access registry
- `index.ts` - Exports

---

### Task 3: Create Plugin Component Wrapper

**File:** `src/components/formcomponents/plugin/PluginComponentWrapper.tsx` (new)

A wrapper that handles common functionality so plugins don't need to re-implement boilerplate:

```typescript
/**
 * PluginComponentWrapper responsibilities:
 * 1. Fetches item from Redux state
 * 2. Gets answer via useGetAnswer hook
 * 3. Provides unified onValueChange callback (dispatches correct action based on item type)
 * 4. Handles react-hook-form registration and validation
 * 5. Renders ReferoLabel
 * 6. Renders the plugin component with simplified props
 * 7. Renders delete/repeat buttons
 * 8. Renders nested children
 */
```

This wrapper will:

- Accept `QuestionnaireComponentItemProps` (same as built-in components)
- Accept the plugin component as a prop
- Handle all Redux/form integration internally
- Pass `PluginComponentProps` to the actual plugin

---

### Task 4: Create Unified Value Change Handler

**File:** `src/util/pluginValueHandler.ts` (new)

Create a unified interface for updating answer values:

```typescript
/**
 * Maps value types to appropriate dispatch actions:
 * - valueString → newStringValueAsync
 * - valueInteger → newIntegerValueAsync
 * - valueDecimal → newDecimalValueAsync
 * - valueCoding → newCodingValueAsync
 * - valueDate → newDateValueAsync
 * - etc.
 */
export function dispatchAnswerValue(
  dispatch: AppDispatch,
  path: Path[],
  item: QuestionnaireItem,
  answer: QuestionnaireResponseItemAnswer
): Promise<FormData>;
```

---

### Task 5: Extend ReferoProps

**File:** `src/types/referoProps.ts` (modify)

Add optional `componentPlugins?: ComponentPlugin[]` prop.

---

### Task 6: Wire Plugin Provider into Refero

**File:** `src/components/index.tsx` (modify)

Wrap form with `ComponentPluginProvider`, passing the plugins from props.

---

### Task 7: Create Plugin Resolver Utility

**File:** `src/util/componentPluginResolver.ts` (new)

```typescript
/**
 * Resolves which component to use for a given item:
 * 1. Get item.type and itemControl codes from item
 * 2. For each itemControl code, check if registry has "itemType:itemControlCode"
 * 3. If found, return PluginComponentWrapper configured with that plugin
 * 4. If not found, return undefined (caller falls back to built-in)
 */
export function resolvePluginComponent(
  item: QuestionnaireItem,
  registry: ComponentPluginRegistry
): React.ComponentType<QuestionnaireComponentItemProps> | undefined;
```

---

### Task 8: Modify Component Resolution

**File:** `src/components/createQuestionnaire/ItemRenderer.tsx` (modify)

Update to check for plugins before falling back to built-in components:

```typescript
// Before:
const ItemComponent = getComponentForItem(item.type);

// After:
const pluginRegistry = useComponentPluginRegistry();
const ItemComponent = resolvePluginComponent(item, pluginRegistry) ?? getComponentForItem(item.type);
```

---

### Task 9: Export Plugin Types

**File:** `src/index.ts` (modify)

Export types for consuming apps:

- `PluginComponentProps`
- `ComponentPlugin`
- `ComponentPluginRegistry`
- `createPluginKey`

---

### Task 10: Documentation

Document how to create and register plugins:

- What props plugins receive
- How to register a plugin
- Example plugin implementation
- Limitations and considerations

---

### Task 11: Create Example Plugin (Optional)

**Files:** `preview/external-components/` (new plugins)

Reference implementation showing:

- A custom slider for integers
- A custom date picker
- How to register them in the preview app

---

## Design Decisions

### 1. Plugin Key Format

**Decision:** `"itemType:itemControlCode"` (e.g., `"integer:slider"`)

This allows targeting specific combinations. A slider for integers might behave differently than a slider for decimals.

### 2. Full Replacement (not composition)

**Decision:** Plugins fully replace the default rendering for that itemType + itemControlCode combination.

Rationale: Composition adds complexity and most use cases want full control. The wrapper handles common elements (label, buttons), so
plugins only implement the input itself.

### 3. Resolution Point

**Decision:** Resolution happens in `ItemRenderer.tsx` before component selection.

This is cleaner than modifying each type component individually.

### 4. Props Interface

**Decision:** Plugins receive `PluginComponentProps` - a simplified, stable interface.

Plugins should NOT receive internal implementation details like `idWithLinkIdAndItemIndex` or need to call Redux directly. The wrapper
handles that complexity.

---

## Future Considerations

1. **Plugin for entire item types**: Could extend to allow replacing all `integer` rendering, not just specific itemControl codes
2. **Plugin composition**: Allow plugins to wrap/enhance default components rather than replace
3. **Async plugin loading**: Support for lazy-loaded plugin components
4. **Plugin validation**: Runtime validation that plugins implement required interface correctly
