/**
 * Plugin Stress Test — exercises every PluginComponentProps field and most
 * public exports from @helsenorge/refero to surface integration bugs.
 *
 * Register all three plugins below, then load the included questionnaire.
 * Each item targets a different plugin and item type to maximise coverage.
 */
import { type FC, type CSSProperties, useRef, useEffect, useState, useCallback } from 'react';

import type { Coding, Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

// Design system components
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';

import {
  // Core component
  Refero,
  ReferoLabel,

  // Plugin types
  type ComponentPlugin,
  type PluginComponentProps,
  type GlobalState,

  // Hooks
  usePluginValidation,

  // Utilities
  normalizeAnswer,
  getFirstAnswer,

  // Actions (different value types to stress dispatch)
  newIntegerValueAsync,
  newStringValueAsync,
  newCodingValueAsync,
  removeCodingValueAsync,

  // Re-exported react-hook-form (verifies re-export works)
  useFormContext,
} from '@helsenorge/refero';

// ---------------------------------------------------------------------------
// Plugin 1 — Integer Stepper
// Exercises: dispatch, onAnswerChange, getFirstAnswer, usePluginValidation,
//   readOnly, pdf, error, id, idWithLinkIdAndItemIndex, path, index,
//   resources, promptLoginMessage, children
// ---------------------------------------------------------------------------

const IntegerStepperPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  error: fieldError,
  id,
  idWithLinkIdAndItemIndex,
  path,
  index,
  pdf,
  readOnly,
  resources,
  promptLoginMessage,
  children,
}) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const currentValue = getFirstAnswer(answer)?.valueInteger ?? 0;

  const { errorMessage } = usePluginValidation({
    item,
    idWithLinkIdAndItemIndex,
    pdf,
    resources,
    value: currentValue !== 0 ? currentValue : undefined,
  });

  const step = (delta: number): void => {
    if (readOnly || pdf) return;
    const next = currentValue + delta;
    dispatch(newIntegerValueAsync(path, next, item))?.then((s: GlobalState) => onAnswerChange(s, item, { valueInteger: next }));
    promptLoginMessage?.();
  };

  const btnStyle = (disabled: boolean): CSSProperties => ({
    padding: '8px 20px',
    fontSize: '18px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: disabled ? '#f3f4f6' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  });

  if (pdf) {
    return (
      <div data-testid={`stepper-pdf-${id}`}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-ff`}
        />
        <p>{currentValue || resources?.ikkeBesvart || 'Not answered'}</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }} data-testid={`stepper-${id}`}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-ff`}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button type="button" style={btnStyle(readOnly ?? false)} onClick={() => step(-1)} disabled={readOnly} aria-label="Decrease">
          {'-'}
        </button>
        <span style={{ fontSize: 24, fontWeight: 600, minWidth: 48, textAlign: 'center' }}>{currentValue}</span>
        <button type="button" style={btnStyle(readOnly ?? false)} onClick={() => step(1)} disabled={readOnly} aria-label="Increase">
          {'+'}
        </button>
      </div>

      {errorMessage && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 14, marginTop: 4 }}>
          {errorMessage}
        </p>
      )}
      {fieldError && <p style={{ color: '#9333ea', fontSize: 12 }}>{`Field error type: ${fieldError.type}`}</p>}

      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{`index=${index} | renders=${renderCount.current} | id=${id}`}</p>

      {children}
    </div>
  );
};
IntegerStepperPlugin.displayName = 'IntegerStepperPlugin';

// ---------------------------------------------------------------------------
// Plugin 2 — Free-text Notepad
// Exercises: newStringValueAsync, normalizeAnswer, useFormContext re-export,
//   readOnly, pdf, resources, children
// ---------------------------------------------------------------------------

const NotepadPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  id,
  idWithLinkIdAndItemIndex,
  path,
  pdf,
  readOnly,
  resources,
  promptLoginMessage,
  children,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentValue = getFirstAnswer(answer)?.valueString ?? '';

  // Verify that the re-exported useFormContext works inside plugin context
  const formCtx = useFormContext();
  const isSubmitted = formCtx.formState.isSubmitted;

  const { errorMessage } = usePluginValidation({
    item,
    idWithLinkIdAndItemIndex,
    pdf,
    resources,
    value: currentValue || undefined,
  });

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [currentValue]);

  const handleChange = (text: string): void => {
    if (readOnly || pdf) return;
    dispatch(newStringValueAsync(path, text, item))?.then((s: GlobalState) => onAnswerChange(s, item, { valueString: text }));
    promptLoginMessage?.();
  };

  if (pdf) {
    return (
      <div data-testid={`notepad-pdf-${id}`}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-ff`}
        />
        <p style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{currentValue || resources?.ikkeBesvart || 'Not answered'}</p>
      </div>
    );
  }

  const charCount = currentValue.length;
  const maxLength = item.maxLength;

  return (
    <div style={{ marginBottom: 16 }} data-testid={`notepad-${id}`}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-ff`}
      />

      <textarea
        ref={textareaRef}
        id={id}
        value={currentValue}
        onChange={e => handleChange(e.target.value)}
        disabled={readOnly}
        maxLength={maxLength}
        placeholder={item.text ?? 'Write something...'}
        style={{
          width: '100%',
          minHeight: 80,
          padding: 12,
          borderRadius: 8,
          border: errorMessage ? '2px solid #dc2626' : '1px solid #d1d5db',
          fontFamily: 'inherit',
          fontSize: 14,
          resize: 'none',
          overflow: 'hidden',
          background: readOnly ? '#f9fafb' : '#fff',
        }}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {errorMessage && (
          <p id={`${id}-error`} role="alert" style={{ color: '#dc2626', fontSize: 13 }}>
            {errorMessage}
          </p>
        )}
        <span style={{ fontSize: 12, color: charCount > (maxLength ?? Infinity) * 0.9 ? '#dc2626' : '#9ca3af', marginLeft: 'auto' }}>
          {maxLength ? `${charCount}/${maxLength}` : `${charCount} chars`}
        </span>
      </div>

      {isSubmitted && !currentValue && <p style={{ fontSize: 12, color: '#f59e0b' }}>{'Form was submitted — this field is empty.'}</p>}

      {children}
    </div>
  );
};
NotepadPlugin.displayName = 'NotepadPlugin';

// ---------------------------------------------------------------------------
// Plugin 3 — Tag Picker (multi-select choice)
// Exercises: newCodingValueAsync, removeCodingValueAsync, normalizeAnswer,
//   item.repeats, item.answerOption, item.required, promptLoginMessage
// ---------------------------------------------------------------------------

const TagPickerPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  id,
  idWithLinkIdAndItemIndex,
  path,
  pdf,
  readOnly,
  resources,
  promptLoginMessage,
  children,
}) => {
  const answers = normalizeAnswer(answer);
  const selectedCodings = answers.map((a: { valueCoding?: Coding }) => a.valueCoding).filter((c: Coding | undefined): c is Coding => !!c);

  const { errorMessage } = usePluginValidation({
    item,
    idWithLinkIdAndItemIndex,
    pdf,
    resources,
    value: selectedCodings.length > 0 ? selectedCodings : undefined,
  });

  const isMulti = item.repeats === true;
  const answerOptions = item.answerOption ?? [];

  const isSelected = (coding: Coding): boolean => selectedCodings.some((s: Coding) => s.code === coding.code && s.system === coding.system);

  const toggle = (coding: Coding): void => {
    if (readOnly || pdf) return;
    if (isSelected(coding)) {
      dispatch(removeCodingValueAsync(path, coding, item))?.then((s: GlobalState) => onAnswerChange(s, item, { valueCoding: coding }));
    } else {
      dispatch(newCodingValueAsync(path, coding, item, isMulti))?.then((s: GlobalState) =>
        onAnswerChange(s, item, { valueCoding: coding })
      );
    }
    promptLoginMessage?.();
  };

  const tagStyle = (selected: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 999,
    border: selected ? '2px solid #2563eb' : '1px solid #d1d5db',
    background: selected ? '#dbeafe' : '#fff',
    color: selected ? '#1e40af' : '#374151',
    fontWeight: selected ? 600 : 400,
    fontSize: 14,
    cursor: readOnly ? 'not-allowed' : 'pointer',
    opacity: readOnly ? 0.5 : 1,
    transition: 'all 0.15s ease',
  });

  if (pdf) {
    const labels = selectedCodings.map((c: Coding) => c.display || c.code).join(', ');
    return (
      <div data-testid={`tags-pdf-${id}`}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-ff`}
        />
        <p>{labels || resources?.ikkeBesvart || 'Not answered'}</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }} data-testid={`tags-${id}`}>
      <ReferoLabel
        item={item}
        resources={resources}
        htmlFor={id}
        labelId={`${id}-label`}
        testId={`${id}-label`}
        formFieldTagId={`${id}-ff`}
      />

      {isMulti && item.required && <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 8px' }}>{'Select at least one'}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }} role="group" aria-labelledby={`${id}-label`}>
        {answerOptions.map((option, idx) => {
          const coding = option.valueCoding;
          if (!coding?.code) return null;
          const selected = isSelected(coding);
          return (
            <button
              key={`${id}-tag-${idx}`}
              type="button"
              style={tagStyle(selected)}
              onClick={() => toggle(coding)}
              disabled={readOnly}
              aria-pressed={selected}
            >
              {selected && <span aria-hidden="true">{'x'}</span>}
              {coding.display || coding.code}
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 14, marginTop: 4 }}>
          {errorMessage}
        </p>
      )}

      {selectedCodings.length > 0 && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{`${selectedCodings.length} selected`}</p>}

      {children}
    </div>
  );
};
TagPickerPlugin.displayName = 'TagPickerPlugin';

// ---------------------------------------------------------------------------
// Plugin 4 — Feedback Form (design system components)
// Exercises: FormGroup, Input, Textarea, Checkbox, Label, NotificationPanel,
//   refCallback (validation summary focus), newStringValueAsync,
//   usePluginValidation, useFormContext, readOnly, pdf, resources, children
// ---------------------------------------------------------------------------

const FeedbackFormPlugin: FC<PluginComponentProps> = ({
  item,
  answer,
  dispatch,
  onAnswerChange,
  id,
  idWithLinkIdAndItemIndex,
  path,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index,
  pdf,
  readOnly,
  resources,
  promptLoginMessage,
  children,
}) => {
  const currentValue = getFirstAnswer(answer)?.valueString ?? '';
  const [localValue, setLocalValue] = useState(currentValue);
  const [anonymous, setAnonymous] = useState(false);
  const formCtx = useFormContext();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { error, errorMessage, refCallback } = usePluginValidation({
    item,
    idWithLinkIdAndItemIndex,
    pdf,
    resources,
    value: localValue || undefined,
  });

  // Sync external answer changes
  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const commitValue = useCallback(
    (text: string): void => {
      if (readOnly || pdf) return;
      dispatch(newStringValueAsync(path, text, item))?.then((s: GlobalState) => onAnswerChange(s, item, { valueString: text }));
      promptLoginMessage?.();
    },
    [dispatch, path, item, onAnswerChange, readOnly, pdf, promptLoginMessage]
  );

  if (pdf) {
    return (
      <div data-testid={`feedback-pdf-${id}`}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-ff`}
        />
        <p>{localValue || resources?.ikkeBesvart || 'Not answered'}</p>
        {anonymous && <p>{'(submitted anonymously)'}</p>}
      </div>
    );
  }

  return (
    <div className="page_refero__component page_refero__component_plugin" data-testid={`feedback-${id}`}>
      <FormGroup error={errorMessage} onColor="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${id}-input`}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-ff`}
        />

        {anonymous && (
          <NotificationPanel variant="info" testId={`${id}-anon-notice`}>
            <Label labelTexts={[{ text: 'Your feedback will be submitted anonymously', type: 'subdued' }]} />
          </NotificationPanel>
        )}

        <Textarea
          ref={refCallback as React.Ref<HTMLTextAreaElement>}
          inputId={`${id}-input`}
          testId={`test-feedback-textarea-${id}`}
          value={localValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => {
            setLocalValue(e.target.value);
          }}
          onBlur={(): void => {
            if (localValue !== currentValue) {
              commitValue(localValue);
            }
          }}
          readOnly={readOnly}
          maxCharacters={item.maxLength ?? undefined}
          grow
          className="page_refero__input"
        />

        <div style={{ marginTop: 8 }}>
          <Checkbox
            testId={`${id}-anonymous-checkbox`}
            inputId={`${id}-anonymous`}
            label={
              <Label labelId={`${id}-anonymous-label`} testId={`${id}-anonymous-label`} labelTexts={[{ text: 'Submit anonymously' }]} />
            }
            checked={anonymous}
            onChange={(): void => setAnonymous(!anonymous)}
            disabled={readOnly}
          />
        </div>

        {formCtx.formState.isSubmitted && !localValue && (
          <NotificationPanel variant="warn" testId={`${id}-empty-warning`}>
            {'Form was submitted but this field is empty.'}
          </NotificationPanel>
        )}
      </FormGroup>

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
FeedbackFormPlugin.displayName = 'FeedbackFormPlugin';

// ---------------------------------------------------------------------------
// Register all plugins
// ---------------------------------------------------------------------------

const plugins: ComponentPlugin[] = [
  { itemType: 'integer', itemControlCode: 'stepper', component: IntegerStepperPlugin },
  { itemType: 'string', itemControlCode: 'notepad', component: NotepadPlugin },
  { itemType: 'choice', itemControlCode: 'tag-picker', component: TagPickerPlugin },
  { itemType: 'text', itemControlCode: 'feedback-form', component: FeedbackFormPlugin },
];

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

interface PluginStressTestProps {
  questionnaire?: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

export const PluginStressTest: FC<PluginStressTestProps> = ({ questionnaire, questionnaireResponse }) => {
  const q = questionnaire ?? stressTestQuestionnaire;

  return (
    <Refero
      questionnaire={q}
      questionnaireResponse={questionnaireResponse}
      // eslint-disable-next-line no-console
      onSubmit={(qr: QuestionnaireResponse): void => console.log('[StressTest] Submitted:', qr)}
      // eslint-disable-next-line no-console
      onSave={(qr: QuestionnaireResponse): void => console.log('[StressTest] Saved:', qr)}
      // eslint-disable-next-line no-console
      onCancel={(): void => console.log('[StressTest] Cancelled')}
      onChange={(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): void =>
        // eslint-disable-next-line no-console
        console.log('[StressTest] Changed:', item.linkId, answer)
      }
      authorized={true}
      componentPlugins={plugins}
    />
  );
};

// ---------------------------------------------------------------------------
// Stress-test questionnaire
// Includes: standard check-box (must NOT be overridden), custom stepper,
//   custom notepad, custom tag-picker, standard radio-button (must NOT be overridden)
// ---------------------------------------------------------------------------

const stressTestQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'plugin-stress-test',
  language: 'nb-NO',
  status: 'draft',
  publisher: 'NHN',
  name: 'PLUGIN_STRESS_TEST',
  meta: {
    profile: ['http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire'],
    tag: [{ system: 'urn:ietf:bcp:47', code: 'nb-NO', display: 'Bokmaal' }],
    security: [{ code: '3', display: 'Helsehjelp (Full)', system: 'urn:oid:2.16.578.1.12.4.1.1.7618' }],
  },
  contact: [{ name: 'http://www.nhn.no' }],
  subjectType: ['Patient'],
  extension: [
    {
      url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sidebar',
      valueCoding: { system: 'http://helsenorge.no/fhir/ValueSet/sdf-sidebar', code: '1' },
    },
    {
      url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-information-message',
      valueCoding: { system: 'http://helsenorge.no/fhir/ValueSet/sdf-information-message', code: '1' },
    },
    {
      url: 'http://helsenorge.no/fhir/StructureDefintion/sdf-itemControl-visibility',
      valueCodeableConcept: {
        coding: [
          { system: 'http://helsenorge.no/fhir/CodeSystem/AttachmentRenderOptions', code: 'hide-help', display: 'Hide help texts' },
          { system: 'http://helsenorge.no/fhir/CodeSystem/AttachmentRenderOptions', code: 'hide-sublabel', display: 'Hide sublabel texts' },
        ],
      },
    },
  ],
  contained: [
    {
      url: 'http://ehelse.no/fhir/ValueSet/Predefined',
      resourceType: 'ValueSet',
      id: 'yesno',
      version: '1.0',
      name: 'urn:oid:yesno',
      title: 'Ja / Nei',
      status: 'draft',
      publisher: 'NHN',
      compose: {
        include: [
          {
            system: 'urn:oid:2.16.578.1.12.4.1.9523',
            concept: [
              { code: '1', display: 'Ja' },
              { code: '2', display: 'Nei' },
            ],
          },
        ],
      },
    },
  ],
  item: [
    // 1. Standard check-box — must render as built-in, NOT as a plugin
    {
      linkId: 'std-checkbox',
      type: 'choice',
      text: 'Standard check-box (should use built-in component)',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
          },
        },
      ],
      answerValueSet: '#yesno',
    },

    // 2. Custom integer stepper plugin
    {
      linkId: 'custom-stepper',
      type: 'integer',
      text: 'How many pets do you have?',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'stepper', display: 'Stepper' }],
          },
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 0,
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 99,
        },
      ],
    },

    // 3. Custom notepad plugin (string with maxLength)
    {
      linkId: 'custom-notepad',
      type: 'string',
      text: 'Tell us about your pets',
      required: false,
      maxLength: 500,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'notepad', display: 'Notepad' }],
          },
        },
      ],
    },

    // 4. Standard radio-button — must render as built-in, NOT as a plugin
    {
      linkId: 'std-radio',
      type: 'choice',
      text: 'Standard radio-button (should use built-in component)',
      required: false,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
          },
        },
      ],
      answerValueSet: '#yesno',
    },

    // 5. Custom tag-picker plugin (multi-select choice)
    {
      linkId: 'custom-tags',
      type: 'choice',
      text: 'Which animals do you like?',
      required: true,
      repeats: true,
      answerOption: [
        { valueCoding: { code: 'cat', display: 'Cat', system: 'urn:example:animals' } },
        { valueCoding: { code: 'dog', display: 'Dog', system: 'urn:example:animals' } },
        { valueCoding: { code: 'bird', display: 'Bird', system: 'urn:example:animals' } },
        { valueCoding: { code: 'fish', display: 'Fish', system: 'urn:example:animals' } },
        { valueCoding: { code: 'snake', display: 'Snake', system: 'urn:example:animals' } },
        { valueCoding: { code: 'horse', display: 'Horse', system: 'urn:example:animals' } },
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'tag-picker', display: 'Tag Picker' }],
          },
        },
      ],
    },

    // 6. Custom feedback form plugin (design system components)
    {
      linkId: 'custom-feedback',
      type: 'text',
      text: 'How can we improve?',
      required: true,
      maxLength: 1000,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'feedback-form', display: 'Feedback Form' }],
          },
        },
      ],
    },

    // 7. Standard drop-down — must render as built-in
    {
      linkId: 'std-dropdown',
      type: 'choice',
      text: 'Standard drop-down (should use built-in component)',
      required: false,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'drop-down' }],
          },
        },
      ],
      answerValueSet: '#yesno',
    },
  ],
};
