# ItemControl Plugin System - Task Checklist

## Progress Tracker

| Status | Task    | Description                             |
| ------ | ------- | --------------------------------------- |
| ✅     | Task 1  | Define Plugin Types                     |
| ✅     | Task 2  | Create Plugin Context                   |
| ✅     | Task 3  | Create Plugin Component Wrapper         |
| ✅     | Task 4  | Create Unified Value Change Handler     |
| ✅     | Task 5  | Extend ReferoProps                      |
| ✅     | Task 6  | Wire Plugin Provider into Refero        |
| ✅     | Task 7  | Create Plugin Resolver Utility          |
| ✅     | Task 8  | Refactor Plugin Tests to Use test-utils |
| ✅     | Task 9  | Modify Component Resolution             |
| ✅     | Task 10 | Export Plugin Types                     |
| ✅     | Task 11 | Documentation                           |
| ✅     | Task 12 | Create Example Plugin (Optional)        |

---

## Task Details

### Task 1: Define Plugin Types

- [x] Create `src/types/componentPlugin.ts`
- [x] Define `PluginComponentProps` interface
- [x] Define `ComponentPlugin` interface
- [x] Define `ComponentPluginRegistry` type
- [x] Create `createPluginKey` helper function
- [x] Create tests
- [x] Run linting
- [x] Run build

### Task 2: Create Plugin Context

- [x] Create `src/context/componentPlugin/` folder
- [x] Create `ComponentPluginContext.tsx`
- [x] Create `ComponentPluginProvider.tsx`
- [x] Create `useComponentPlugin.tsx` hook
- [x] Create `index.ts` exports
- [x] Create tests
- [x] Run linting
- [x] Run build

### Task 3: Create Plugin Component Wrapper

- [x] Create `src/components/formcomponents/plugin/PluginComponentWrapper.tsx`
- [x] Implement item fetching from Redux
- [x] Implement answer fetching via useGetAnswer
- [x] Implement unified onValueChange callback
- [x] Implement react-hook-form integration
- [x] Render ReferoLabel, delete/repeat buttons
- [x] Create tests
- [x] Run linting
- [x] Run build

### Task 4: Create Unified Value Change Handler

- [x] Create `src/util/pluginValueHandler.ts`
- [x] Implement `dispatchAnswerValue` function
- [x] Handle all value types (string, integer, decimal, coding, date, etc.)
- [x] Create tests
- [x] Run linting
- [x] Run build

### Task 5: Extend ReferoProps

- [x] Modify `src/types/referoProps.ts`
- [x] Add `componentPlugins?: ComponentPlugin[]` prop
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 6: Wire Plugin Provider into Refero

- [x] Modify `src/components/index.tsx`
- [x] Wrap form with `ComponentPluginProvider`
- [x] Pass plugins from props to provider
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 7: Create Plugin Resolver Utility

- [x] Create `src/util/componentPluginResolver.ts`
- [x] Implement `resolvePluginComponent` function
- [x] Handle itemControl code lookup
- [x] Return wrapped plugin or undefined
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 8: Refactor Plugin Tests to Use test-utils

- [x] Add plugin testing helpers to `test/test-utils.tsx`
- [x] Refactor `componentPlugin-context-spec.tsx` to use test-utils
- [x] Refactor `PluginComponentWrapper-spec.tsx` to use test-utils
- [x] Refactor `pluginValueHandler-spec.ts` to use test-utils (if applicable)
- [x] Refactor `componentPluginResolver-spec.ts` to use test-utils (if applicable)
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 9: Modify Component Resolution

- [x] Modify `src/components/createQuestionnaire/ItemRenderer.tsx`
- [x] Add plugin registry hook
- [x] Check for plugin before built-in component
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 10: Export Plugin Types

- [x] Modify `src/index.ts`
- [x] Export `PluginComponentProps`
- [x] Export `ComponentPlugin`
- [x] Export `ComponentPluginRegistry`
- [x] Export `createPluginKey`
- [x] Run tests
- [x] Run linting
- [x] Run build

### Task 11: Documentation

- [x] Document plugin props
- [x] Document registration process
- [x] Create example plugin code
- [x] Document limitations
- [x] Review documentation
- [x] Run linting
- [x] Run build

### Task 12: Create Example Plugin (Optional)

- [x] Create custom slider plugin for integers in `preview/external-components/`
- [x] Create test questionnaire with slider itemControl
- [x] Register examples in preview app
- [x] Run tests
- [x] Run linting
- [x] Run build
