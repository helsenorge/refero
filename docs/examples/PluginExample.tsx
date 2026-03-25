/**
 * Example: Image Card Picker plugin for Refero.
 *
 * A visually rich choice component that renders answer options as image cards.
 * Consumers provide a mapping of coding codes → image URLs.
 * Demonstrates most plugin props and helpers.
 */
import { type FC, type CSSProperties, useState } from 'react';

import type { Coding, Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import {
  Refero,
  type ComponentPlugin,
  type PluginComponentProps,
  type GlobalState,
  usePluginValidation,
  normalizeAnswer,
  ReferoLabel,
  newCodingValueAsync,
  removeCodingValueAsync,
} from '@helsenorge/refero';

// ---------------------------------------------------------------------------
// 1. Image Card Picker — a choice plugin with images
// ---------------------------------------------------------------------------

/** Map of coding code → image URL, provided by the consuming app */
export type ImageMap = Record<string, { src: string; alt?: string }>;

interface ImageCardPickerConfig {
  images: ImageMap;
  columns?: number;
  cardSize?: number;
}

/**
 * Creates an image card picker plugin component with the given configuration.
 * This factory pattern lets consumers inject images without modifying the plugin.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createImageCardPicker(config: ImageCardPickerConfig): FC<PluginComponentProps> {
  const { images, columns = 3, cardSize = 160 } = config;

  const ImageCardPicker: FC<PluginComponentProps> = ({
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
    const [hoveredCode, setHoveredCode] = useState<string | null>(null);

    // -- Validation: one call handles registration, value sync, and error state --
    const selectedCodings = normalizeAnswer(answer)
      .map((a: { valueCoding?: Coding }) => a.valueCoding)
      .filter((c: Coding | undefined): c is Coding => !!c);

    const { errorMessage } = usePluginValidation({
      item,
      idWithLinkIdAndItemIndex,
      pdf,
      resources,
      value: selectedCodings.length > 0 ? selectedCodings : undefined,
    });

    // -- Helpers --
    const answerOptions = item.answerOption ?? [];
    const isMulti = item.repeats === true;

    const isSelected = (coding: Coding): boolean =>
      selectedCodings.some((s: Coding) => s.code === coding.code && s.system === coding.system);

    const handleToggle = (coding: Coding): void => {
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

    // -- Styles --
    const gridStyle: CSSProperties = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, ${cardSize}px)`,
      gap: '12px',
      padding: '8px 0',
    };

    const cardStyle = (coding: Coding): CSSProperties => {
      const selected = isSelected(coding);
      const hovered = hoveredCode === coding.code;
      return {
        position: 'relative',
        width: cardSize,
        cursor: readOnly ? 'not-allowed' : 'pointer',
        borderRadius: '12px',
        border: selected ? '3px solid #2563eb' : '2px solid #e5e7eb',
        background: selected ? '#eff6ff' : hovered ? '#f9fafb' : '#ffffff',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hovered && !readOnly ? 'translateY(-2px)' : 'none',
        boxShadow: selected ? '0 4px 12px rgba(37, 99, 235, 0.25)' : hovered ? '0 4px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        opacity: readOnly ? 0.6 : 1,
      };
    };

    const imgStyle: CSSProperties = {
      width: '100%',
      height: cardSize * 0.7,
      objectFit: 'cover',
      display: 'block',
    };

    const labelStyle = (coding: Coding): CSSProperties => ({
      display: 'block',
      padding: '8px',
      textAlign: 'center',
      fontSize: '13px',
      fontWeight: isSelected(coding) ? 600 : 400,
      color: isSelected(coding) ? '#1d4ed8' : '#374151',
    });

    const badgeStyle: CSSProperties = {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: '#2563eb',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
    };

    // -- PDF / readonly summary --
    if (pdf) {
      const labels = selectedCodings.map(c => c.display || c.code).join(', ');
      return (
        <div style={{ padding: '8px 0' }}>
          <ReferoLabel
            item={item}
            resources={resources}
            htmlFor={id}
            labelId={`${id}-label`}
            testId={`${id}-label`}
            formFieldTagId={`${id}-formfieldtag`}
          />
          <p style={{ color: '#374151' }}>{labels || resources?.ikkeBesvart || 'Not answered'}</p>
        </div>
      );
    }

    // -- Interactive render --
    return (
      <div style={{ marginBottom: '16px' }}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${id}-label`}
          testId={`${id}-label`}
          formFieldTagId={`${id}-formfieldtag`}
        />

        {isMulti && (
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 8px' }}>
            {`Select ${item.required ? 'at least one' : 'one or more'}`}
          </p>
        )}

        <div style={gridStyle} role="group" aria-labelledby={`${id}-label`}>
          {answerOptions.map((option, idx) => {
            const coding = option.valueCoding;
            if (!coding?.code) return null;

            const img = images[coding.code];
            const selected = isSelected(coding);

            return (
              <button
                key={`${id}-${idx}`}
                type="button"
                style={cardStyle(coding)}
                onClick={() => handleToggle(coding)}
                onMouseEnter={() => setHoveredCode(coding.code ?? null)}
                onMouseLeave={() => setHoveredCode(null)}
                disabled={readOnly}
                aria-pressed={selected}
                aria-label={coding.display || coding.code}
              >
                {img ? (
                  <img src={img.src} alt={img.alt || coding.display || coding.code} style={imgStyle} />
                ) : (
                  <div
                    style={{
                      ...imgStyle,
                      background: `hsl(${(idx * 60) % 360}, 40%, 90%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                    }}
                  >
                    {'🖼️'}
                  </div>
                )}

                <span style={labelStyle(coding)}>{coding.display || coding.code}</span>

                {selected && <span style={badgeStyle}>{'✓'}</span>}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p role="alert" style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
            {errorMessage}
          </p>
        )}

        {selectedCodings.length > 0 && (
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            {`Selected: ${selectedCodings.map(c => c.display || c.code).join(', ')}`}
          </p>
        )}

        {children}
      </div>
    );
  };

  ImageCardPicker.displayName = 'ImageCardPicker';
  return ImageCardPicker;
}

// ---------------------------------------------------------------------------
// 2. Configure and register
// ---------------------------------------------------------------------------

const ImageCardPickerPlugin = createImageCardPicker({
  columns: 3,
  cardSize: 180,
  images: {
    cat: { src: 'https://placecats.com/300/200', alt: 'A cute cat' },
    dog: { src: 'https://placedog.net/300/200', alt: 'A good dog' },
    bird: { src: 'https://placecats.com/bella/300/200', alt: 'A lovely bird' },
    fish: { src: 'https://placedog.net/301/200', alt: 'A colorful fish' },
    rabbit: { src: 'https://placecats.com/millie/300/200', alt: 'A fluffy rabbit' },
    hamster: { src: 'https://placedog.net/302/200', alt: 'A tiny hamster' },
  },
});

const plugins: ComponentPlugin[] = [
  {
    itemType: 'choice',
    itemControlCode: 'image-picker',
    component: ImageCardPickerPlugin,
  },
];

// ---------------------------------------------------------------------------
// 3. Use in your app
// ---------------------------------------------------------------------------

interface PluginExampleProps {
  questionnaire?: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

/**
 * Drop-in test component. If no questionnaire is provided, uses the built-in
 * example that exercises the image card picker plugin.
 */
export const PluginExample: FC<PluginExampleProps> = ({ questionnaire, questionnaireResponse }) => {
  const q = questionnaire ?? exampleQuestionnaire;

  return (
    <Refero
      questionnaire={q}
      questionnaireResponse={questionnaireResponse}
      // eslint-disable-next-line no-console
      onSubmit={(qr: QuestionnaireResponse): void => console.log('Submitted:', qr)}
      // eslint-disable-next-line no-console
      onSave={(qr: QuestionnaireResponse): void => console.log('Saved:', qr)}
      // eslint-disable-next-line no-console
      onCancel={(): void => console.log('Cancelled')}
      onChange={(item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): void =>
        // eslint-disable-next-line no-console
        console.log('Changed:', item.linkId, answer)
      }
      authorized={true}
      componentPlugins={plugins}
    />
  );
};

// ---------------------------------------------------------------------------
// Built-in example questionnaire
// ---------------------------------------------------------------------------

const exampleQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  language: 'nb-NO',
  status: 'draft',
  publisher: 'NHN',
  name: 'SINGLE_CHOICE',
  meta: {
    profile: ['http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire'],
    tag: [{ system: 'urn:ietf:bcp:47', code: 'nb-NO', display: 'Bokmål' }],
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
          {
            system: 'http://helsenorge.no/fhir/CodeSystem/AttachmentRenderOptions',
            code: 'hide-sublabel',
            display: 'Hide sublabel texts',
          },
        ],
      },
    },
  ],
  id: 'bc0517c7-975b-4582-89b6-064005224c5c',
  contained: [
    {
      url: 'http://ehelse.no/fhir/ValueSet/Predefined',
      resourceType: 'ValueSet',
      id: '9523',
      version: '1.0',
      name: 'urn:oid:9523',
      title: 'Ja / Nei / Usikker (structor)',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'urn:oid:2.16.578.1.12.4.1.9523',
            concept: [
              { code: '1', display: 'Ja' },
              { code: '2', display: 'Nei' },
              { code: '3', display: 'Usikker' },
            ],
          },
        ],
      },
    },
  ],
  item: [
    {
      linkId: 'b2351c11-8b08-4951-c955-dee9d6be1e1c',
      type: 'choice',
      text: 'CHOICE',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
          },
        },
      ],
      answerValueSet: '#9523',
    },
    {
      linkId: 'favorite-pet',
      type: 'choice',
      text: 'What is your favorite pet?',
      required: true,
      repeats: true,
      answerOption: [
        { valueCoding: { code: 'cat', display: 'Cat', system: 'urn:example:pets' } },
        { valueCoding: { code: 'dog', display: 'Dog', system: 'urn:example:pets' } },
        { valueCoding: { code: 'bird', display: 'Bird', system: 'urn:example:pets' } },
        { valueCoding: { code: 'fish', display: 'Fish', system: 'urn:example:pets' } },
        { valueCoding: { code: 'rabbit', display: 'Rabbit', system: 'urn:example:pets' } },
        { valueCoding: { code: 'hamster', display: 'Hamster', system: 'urn:example:pets' } },
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'image-picker',
                display: 'Image Picker',
              },
            ],
          },
        },
      ],
    },
  ],
};
