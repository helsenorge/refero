# ItemControl Component Plugin System

## Overview

A runtime plugin system where consuming apps pass a configuration mapping itemControl codes to custom React components, allowing component
injection without bundling custom components inside refero.

---

## Architecture

### Rendering Flow

1. `GenerateQuestionnaireComponents` → iterates over items
2. `ItemRenderer` → checks for plugin, then falls back to `getComponentForItem(item.type)`
3. Plugin found → `PluginComponentWrapper` wraps the plugin component
4. No plugin → Built-in component handles rendering

### Key Concepts

- **Item Type**: `item.type` determines the base component (string, integer, choice, etc.)
- **ItemControl Code**: The `itemControl` extension determines the variant (e.g., slider, dropdown)
- **Plugin Key**: Format is `"itemType:itemControlCode"` (e.g., `"integer:slider"`)

---

## Plugin Component Props

Plugins receive `PluginComponentProps` - a comprehensive interface that gives plugins full control:

```typescript
interface PluginComponentProps {
  // Item & Answer
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[] | undefined;

  // Value changes - same pattern as built-in components
  dispatch: AppDispatch;
  onAnswerChange: OnAnswerChange;

  // Validation
  error?: FieldError;

  // Context
  resources?: Resources;
  pdf?: boolean;
  readOnly?: boolean;

  // Identifiers
  id: string;
  idWithLinkIdAndItemIndex: string; // For react-hook-form registration
  path: Path[];
  index: number;

  // Children containing delete/repeat buttons and nested items
  children?: React.ReactNode;

  // Optional login prompt
  promptLoginMessage?: () => void;
}
```

---

## Plugin Responsibilities

Plugins are **fully responsible** for:

1. **Label rendering** - Use `ReferoLabel` from refero exports or create custom
2. **Validation registration** - Register with react-hook-form using validation rules from refero
3. **Value changes** - Use dispatch + onAnswerChange (same pattern as built-in components)
4. **Error display** - Use FormGroup or custom error rendering
5. **Rendering children** - Must render `children` prop (contains delete/repeat buttons and nested items)

---

## Wrapper Responsibilities

The `PluginComponentWrapper` handles:

1. Fetching item from Redux state
2. Getting answer via useGetAnswer hook
3. Providing dispatch and onAnswerChange
4. Providing form error state
5. Passing delete/repeat buttons and nested children as `children` prop
6. ReadOnly/PDF mode fallback rendering

---

## Example Plugin Implementation

```tsx
import { useEffect, type FC } from 'react';
import { type FieldError, type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';
import type { PluginComponentProps } from '@helsenorge/refero';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { ReferoLabel, newIntegerValueAsync, getErrorMessage, required, minValue, maxValue } from '@helsenorge/refero';

export const CustomSliderPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  error,
  pdf,
  id,
  idWithLinkIdAndItemIndex,
  path,
  resources,
  promptLoginMessage,
  children,
}) => {
  const { register, unregister, setValue, formState } = useFormContext<FieldValues>();

  // Get current value
  const currentValue = Array.isArray(answer) ? answer[0]?.valueInteger : answer?.valueInteger;

  // Register with react-hook-form for validation
  useEffect(() => {
    const validationRules: RegisterOptions<FieldValues, string> = {
      required: required({ item, resources }),
      min: minValue({ item, resources }),
      max: maxValue({ item, resources }),
      shouldUnregister: true,
    };
    register(idWithLinkIdAndItemIndex, validationRules);
    return (): void => {
      unregister(idWithLinkIdAndItemIndex);
    };
  }, [idWithLinkIdAndItemIndex, item, register, unregister, resources]);

  // Update form value when answer changes
  useEffect(() => {
    setValue(idWithLinkIdAndItemIndex, currentValue, { shouldValidate: formState.isSubmitted });
  }, [currentValue, idWithLinkIdAndItemIndex, setValue, formState.isSubmitted]);

  // Handle value change - same pattern as built-in Integer component
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      dispatch(newIntegerValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueInteger: value }));
    }
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const errorMessage = getErrorMessage(item, error);

  return (
    <FormGroup error={errorMessage} onColor="ongrey">
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-formfieldtag`}
      />

      <input type="range" id={id} value={currentValue ?? 0} onChange={handleChange} />

      {/* IMPORTANT: Render children - contains delete/repeat buttons and nested items */}
      {children}
    </FormGroup>
  );
};
```

---

## Registering Plugins

```tsx
import { ReferoContainer, type ComponentPlugin } from '@helsenorge/refero';
import { CustomSliderPlugin } from './CustomSliderPlugin';

const plugins: ComponentPlugin[] = [
  {
    itemType: 'integer',
    itemControlCode: 'slider',
    component: CustomSliderPlugin,
  },
];

function App() {
  return (
    <ReferoContainer
      questionnaire={questionnaire}
      componentPlugins={plugins}
      // ... other props
    />
  );
}
```

---

## Exports from Refero

Plugins can import these from `@helsenorge/refero`:

### Types

- `PluginComponentProps` - Props interface for plugins
- `ComponentPlugin` - Plugin registration interface
- `OnAnswerChange` - Type for onAnswerChange callback

### Components

- `ReferoLabel` - Standard label component

### Actions (for dispatch)

- `newIntegerValueAsync`
- `newStringValueAsync`
- `newDecimalValueAsync`
- `newCodingValueAsync`
- `removeCodingValueAsync`
- `newBooleanValueAsync`
- `newDateValueAsync`
- `newTimeValueAsync`
- `newDateTimeValueAsync`
- `newQuantityValueAsync`
- `newAttachmentAsync`
- `removeAttachmentAsync`

### Validation Rules

- `required`
- `minValue`
- `maxValue`
- `minLength`
- `maxLength`
- `pattern`
- `getErrorMessage`
- `shouldValidate`

---

## Design Decisions

### 1. Plugin Key Format

**Decision:** `"itemType:itemControlCode"` (e.g., `"integer:slider"`)

This allows targeting specific combinations. A slider for integers might behave differently than a slider for decimals.

### 2. Full Control (not abstraction)

**Decision:** Plugins receive dispatch and onAnswerChange directly, same as built-in components.

**Rationale:** Initially we tried to abstract value handling with a unified `onValueChange` callback, but this added unnecessary complexity.
Plugins work better when they follow the same patterns as built-in components.

### 3. Plugins Handle Their Own UI

**Decision:** Plugins are responsible for labels, validation, and error display.

**Rationale:** This gives plugins full customization control. They can use `ReferoLabel` for consistency or create completely custom UI.

### 4. Children Must Be Rendered

**Decision:** Delete/repeat buttons and nested items are passed as `children` prop.

**Rationale:** This allows plugins to render these elements inside their FormGroup for proper styling and layout.

### 5. Resolution Point

**Decision:** Resolution happens in `ItemRenderer.tsx` before component selection.

This is cleaner than modifying each type component individually.

---

## File Structure

```
src/
├── types/
│   └── componentPlugin.ts          # Plugin types and interfaces
├── context/
│   └── componentPlugin/
│       ├── ComponentPluginContext.tsx
│       ├── ComponentPluginProvider.tsx
│       ├── useComponentPlugin.tsx
│       └── index.ts
├── components/
│   └── formcomponents/
│       └── plugin/
│           ├── PluginComponentWrapper.tsx
│           └── __tests__/
│               ├── PluginComponentWrapper-spec.tsx
│               └── plugin-integration-spec.tsx
├── util/
│   └── componentPluginResolver.ts
└── index.ts                        # Exports plugin types and ReferoLabel

preview/
└── external-components/
    ├── CustomSliderPlugin.tsx      # Example integer slider
    ├── PillChoicePlugin.tsx        # Example choice with pills
    └── ImageChoicePlugin.tsx       # Example choice with icons
```

---

## Future Considerations

1. **Plugin for entire item types**: Could extend to allow replacing all `integer` rendering, not just specific itemControl codes
2. **Plugin composition**: Allow plugins to wrap/enhance default components rather than replace
3. **Async plugin loading**: Support for lazy-loaded plugin components
4. **Plugin validation**: Runtime validation that plugins implement required interface correctly
