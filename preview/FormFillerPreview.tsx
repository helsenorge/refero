import { useState } from 'react';

import {
  Attachment,
  Bundle,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  ValueSet,
} from 'fhir/r4';
import { Provider } from 'react-redux';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import FormFillerSidebar from './FormFillerSidebar';
import { emptyPropertyReplacer } from './helpers';
import { getResources } from './resources/referoResources';
import skjema from './skjema/q.json';

import ReferoContainer from '../src/components/index';
import valueSet from '../src/constants/valuesets';
import rootReducer from '../src/reducers/index';
import { QuestionnaireStatusCodes } from '../src/types/fhirEnums';
import { EnhetType, OrgenhetHierarki } from '../src/types/orgenhetHierarki';
import { IActionRequester, setSkjemaDefinitionAction } from '@/actions/form';
import { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import { configureStore } from '@reduxjs/toolkit';

type Props = {
  showFormFiller: () => void;
};

const getQuestionnaireFromBubndle = (bundle: Bundle<Questionnaire> | Questionnaire, lang: number = 0): Questionnaire => {
  if (bundle.resourceType === 'Questionnaire') {
    return bundle;
  } else {
    return (
      bundle?.entry?.[lang].resource ?? {
        resourceType: 'Questionnaire',
        status: QuestionnaireStatusCodes.DRAFT,
      }
    );
  }
};
const fetchReceiversFn = (successCallback: (receivers: Array<OrgenhetHierarki>) => void): any => {
  successCallback([
    {
      OrgenhetId: 1,
      EndepunktId: null,
      Navn: 'Region 1',
      EnhetType: EnhetType.Region,
      UnderOrgenheter: [
        { OrgenhetId: 11, EndepunktId: '1', Navn: 'Receiver 1', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
        { OrgenhetId: 12, EndepunktId: '11', Navn: 'Receiver 11', EnhetType: EnhetType.Foretak, UnderOrgenheter: null },
      ],
    },
    {
      OrgenhetId: 2,
      EndepunktId: null,
      Navn: 'Region 2',
      EnhetType: EnhetType.Region,
      UnderOrgenheter: [{ OrgenhetId: 21, EndepunktId: '2', Navn: 'Receiver 2', EnhetType: EnhetType.Foretak, UnderOrgenheter: null }],
    },
    {
      OrgenhetId: 2,
      EndepunktId: '1',
      Navn: 'Region 3',
      EnhetType: EnhetType.Foretak,
      UnderOrgenheter: null,
    },
  ]);
};
const fetchValueSetFn = (
  _searchString: string,
  _item: QuestionnaireItem,
  successCallback: (valueSet: ValueSet) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _errorCallback: (error: string) => void
  // eslint-disable-next-line
): any => {
  successCallback({
    resourceType: 'ValueSet',
    status: 'draft',
    compose: {
      include: [
        {
          system: valueSet.LEGEMIDDELOPPSLAG_SYSTEM,
          concept: [
            {
              code: '1',
              display: 'Fyrstekake',
            },
          ],
        },
      ],
    },
  });
};
const MimeTypes = {
  PlainText: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
  JPG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  PDF: 'application/pdf',
  JSON: 'application/json',
};
const qr = {
  resourceType: 'Questionnaire',
  id: '223',
  meta: {
    versionId: '44',
    lastUpdated: '2024-03-06T07:52:29.789+00:00',
    profile: ['http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire'],
    security: [{ system: 'urn:oid:2.16.578.1.12.4.1.1.7618', code: '3', display: 'Helsehjelp' }],
    tag: [{ system: 'urn:ietf:bcp:47', code: 'nb-NO', display: 'Norsk bokmål' }],
  },
  language: 'nb-NO',
  contained: [
    {
      resourceType: 'ValueSet',
      id: '1101',
      version: '1.0',
      name: 'urn:oid:1101',
      title: 'Ja / Nei',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'urn:oid:2.16.578.1.12.4.1.1101',
            concept: [
              { code: '1', display: 'Ja' },
              { code: '2', display: 'Nei' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: '1102',
      version: '1.0',
      name: 'urn:oid:1102',
      title: 'Ja / Nei / Vet ikke',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'urn:oid:2.16.578.1.12.4.1.1102',
            concept: [
              { code: '1', display: 'Ja' },
              { code: '2', display: 'Nei' },
              { code: '9', display: 'Vet ikke' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: 'Levevaner',
      version: '1.0',
      name: 'Levevaner',
      title: 'Levevaner',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'http://ehelse.no/Levevaner',
            concept: [
              { code: '1', display: 'Aldri' },
              { code: '2', display: 'Sjelden' },
              { code: '3', display: 'Ukentlig' },
              { code: '4', display: 'Daglig' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: 'Relasjon',
      version: '1.0',
      name: 'Relasjon',
      title: 'Relasjon',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'http://ehelse.no/Relasjon',
            concept: [
              { code: 'EF', display: 'Ektefelle' },
              { code: 'SA', display: 'Samboer' },
              { code: 'DA', display: 'Datter' },
              { code: 'SO', display: 'Sønn' },
              { code: 'MO', display: 'Mor' },
              { code: 'FA', display: 'Far' },
              { code: 'SI', display: 'Søster' },
              { code: 'BR', display: 'Bror' },
              { code: 'AS', display: 'Annen slektning' },
              { code: 'AN', display: 'Annen foresatt' },
              { code: 'AP', display: 'Annen personlig relasjon' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: 'Kost',
      version: '1.0',
      name: 'Kost',
      title: 'Kost',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'http://ehelse.no/Kost',
            concept: [
              { code: '1', display: 'Diabeteskost' },
              { code: '2', display: 'Glutenfri kost' },
              { code: '3', display: 'Halal kost' },
              { code: '4', display: 'Kosher kost' },
              { code: '5', display: 'Laktosefri kost' },
              { code: '6', display: 'Melkeproteinfri kost' },
              { code: '7', display: 'Saltredusert kost' },
              { code: '8', display: 'Vegan kost' },
              { code: '9', display: 'Vegetar kost' },
              { id: '09869564-9191-4957-c27c-85d080d65126', code: '98', display: 'Matallergi' },
              { code: '99', display: 'Annen spesialkost' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: 'Reaksjon',
      version: '1.0',
      name: 'Reaksjon',
      title: 'Reaksjon',
      status: 'draft',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'http://ehelse.no/Reaksjon',
            concept: [
              { code: '1', display: 'Mild' },
              { code: '2', display: 'Moderat' },
              { code: '3', display: 'Alvorlig' },
            ],
          },
        ],
      },
    },
    {
      resourceType: 'ValueSet',
      id: '92abfede-62ad-4c10-9b44-66b7ff51f654',
      version: '1.0',
      name: 'RelasjonTilBarn',
      title: 'Relasjon til mindreårig barn (OID=9192)',
      status: 'draft',
      date: '2021-11-03T09:10:13.260Z',
      publisher: 'Direktoratet for e-helse',
      compose: {
        include: [
          {
            system: 'urn:uuid:acd00cec-aece-43e3-c4f7-ad33802be178',
            concept: [
              { id: 'e843d55c-04a8-42d3-c28e-d704c30a528d', code: 'MO', display: 'Mor' },
              { id: 'bb51e391-e2d2-4ada-8657-58c758301062', code: 'FA', display: 'Far' },
              { id: 'eab859b1-a10c-4dca-acc1-3a849d0a7d84', code: 'SM', display: 'Stemor' },
              { id: '1575e050-59d4-4173-8837-13ea3fab2af8', code: 'SF', display: 'Stefar' },
              { id: '4784702f-a750-4a3c-8f7f-abe661acd876', code: 'MM', display: 'Medmor' },
              { id: 'c767f06d-6dbd-4d2c-8a7b-c71db947c003', code: 'MF', display: 'Medfar' },
              { id: 'ac79cda6-0566-4d3d-adb2-ade6ca3e688f', code: 'AS', display: 'Annen slektning' },
              { id: 'bf8e5d4f-2ce4-4713-fda8-935aa63b2572', code: 'AP', display: 'Annen personlig relasjon' },
            ],
          },
        ],
      },
    },
  ],
  extension: [
    {
      url: 'http://ehelse.no/fhir/StructureDefinition/sdf-authenticationrequirement',
      valueCoding: { system: 'http://ehelse.no/fhir/ValueSet/AuthenticationRequirement', code: '3' },
    },
    {
      url: 'http://ehelse.no/fhir/StructureDefinition/sdf-accessibilitytoresponse',
      valueCoding: { system: 'http://ehelse.no/fhir/ValueSet/AccessibilityToResponse', code: '1' },
    },
    {
      url: 'http://ehelse.no/fhir/StructureDefinition/sdf-discretion',
      valueCoding: { system: 'http://ehelse.no/fhir/ValueSet/Discretion', code: '0' },
    },
    { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-generatepdf', valueBoolean: true },
    { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-generatenarrative', valueBoolean: true },
    {
      url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-presentationbuttons',
      valueCoding: { system: 'http://helsenorge.no/fhir/ValueSet/presentationbuttons', code: 'sticky' },
    },
    {
      url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-questionnaire-navgiator-state',
      valueCodeableConcept: {
        coding: [{ system: 'http://helsenorge.no/fhir/CodeSystem/sdf-questionnaire-navigator-state', code: 'navigator' }],
      },
    },
    {
      url: 'http://helsenorge.no/fhir/StructureDefintion/sdf-itemControl-visibility',
      valueCodeableConcept: {
        coding: [
          { system: 'http://helsenorge.no/fhir/CodeSystem/AttachmentRenderOptions', code: 'hide-help', display: 'Hide help texts' },
          { system: 'http://helsenorge.no/fhir/CodeSystem/AttachmentRenderOptions', code: 'hide-sidebar', display: 'Hide sidebar texts' },
        ],
      },
    },
  ],
  url: 'Questionnaire/223',
  version: '5.0',
  name: 'HSO_Helseopplysinger',
  title: 'Skjema om helseopplysninger ved sykehusbesøk',
  status: 'active',
  subjectType: ['Patient'],
  date: '2024-02-01T00:00:00+01:00',
  publisher: 'Norsk Helsnett',
  contact: [{ name: 'https://www.helse-sorost.no/' }],
  description: 'Skjema om helseopplysninger ved sykehusbesøk Helse Sør Øst',
  useContext: [
    {
      code: { system: 'http://hl7.org/fhir/ValueSet/usage-context-type', code: 'focus', display: 'Clinical Focus' },
      valueCodeableConcept: {
        coding: [{ system: 'urn:oid:2.16.578.1.12.4.1.1.8655', code: 'S', display: 'Helsehjelp knyttet til somatisk sykdom' }],
      },
    },
  ],
  copyright: 'Er utviklet av NHN på oppdrag fra Helse Sør Øst',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'highlight' }] },
        },
      ],
      linkId: 'highlight',
      text: 'Vi ber deg fylle ut og sende inn dette skjemaet før timen på sykehuset. For at vi skal kunne gi deg best mulig behandling trenger vi informasjon om din helsetilstand. Hvis helsetilstanden din endrer seg før avtalen hos oss, slik at opplysningene ikke lenger er riktige, ber vi om at du sender inn skjemaet på nytt. Skjemaet vil først bli lest i forbindelse med din timeavtale, ikke med en gang du sender det inn. Skjemaet blir ikke besvart.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
            valueMarkdown:
              '**Vi ber deg fylle ut og sende inn dette skjemaet før timen på sykehuset.**\n\nFor at vi skal kunne gi deg best mulig behandling trenger vi informasjon om din helsetilstand. Hvis helsetilstanden din endrer seg før avtalen hos oss, slik at opplysningene ikke lenger er riktige, ber vi om at du sender inn skjemaet på nytt.\n\nSkjemaet vil først bli lest i forbindelse med din timeavtale, ikke med en gang du sender det inn. Skjemaet blir ikke besvart.',
          },
        ],
      },
      type: 'text',
      required: false,
      repeats: false,
      readOnly: false,
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'sidebar' }] },
        },
      ],
      linkId: 'sot-1',
      code: [{ system: 'http://ehelse.no/fhir/ValueSet/SOTHeaders', code: 'SOT-1', display: 'Alternativer for utfylling' }],
      text: 'Du kan fylle ut skjemaet på vegne av personer over 16 år som har gitt deg fullmakt til å representere dem på Helsenorge.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
            valueMarkdown:
              'Du kan fylle ut skjemaet på vegne av personer over 16 år som har gitt deg fullmakt til å representere dem på Helsenorge.',
          },
        ],
      },
      type: 'text',
      required: false,
      repeats: false,
      readOnly: false,
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'sidebar' }] },
        },
      ],
      linkId: 'sot-2',
      code: [{ system: 'http://ehelse.no/fhir/ValueSet/SOTHeaders', code: 'SOT-2', display: 'Veiledning og ansvarlig' }],
      text: 'Helse Sør-Øst er ansvarlig for innholdet i skjemaet.\r\n\r\nSykehuset du sender skjemaet til er dataansvarlig for personopplysningene oppgitt i skjemaet. \r\n[Les mer om personvern hos mottaker her](https://www.helse-sorost.no/informasjonssikkerhet-og-personvern/personvernerklering)',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
            valueMarkdown:
              'Helse Sør-Øst er ansvarlig for innholdet i skjemaet.\n\nSykehuset du sender skjemaet til er dataansvarlig for personopplysningene oppgitt i skjemaet.  \n[Les mer om personvern hos mottaker her](https://www.helse-sorost.no/informasjonssikkerhet-og-personvern/personvernerklering)',
          },
        ],
      },
      type: 'text',
      required: false,
      repeats: false,
      readOnly: false,
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'sidebar' }] },
        },
      ],
      linkId: 'sot-3',
      code: [{ system: 'http://ehelse.no/fhir/ValueSet/SOTHeaders', code: 'SOT-3', display: 'Behandling hos mottaker' }],
      text: '**Hva skjer med skjemaet du sender inn?**\r\n\r\nSkjemaet sendes automatisk til din pasientjournal, og det er bare de som skal gi deg helsehjelp som har tilgang til det. \r\n\r\nSkjemaet om helseopplysninger er ikke et verktøy for å få kontakt med sykehuset. Skjemaet vil først bli lest i forbindelse med din timeavtale, ikke med en gang du sender det inn.\r\n\r\nDu får ikke svar på dette skjemaet. Dersom du har informasjon som haster, ta kontakt med sykehuset på telefon.\r\n\r\nOpplysningene om din helsetilstand er gyldig inntil 3 måneder. Skjer det endringer i perioden kan du fylle ut nytt skjema eller kontakte sykehuset\r\n\r\n**Dersom du trenger helsehjelp før din time, ta kontakt med din fastlege eller legevakten på telefon 116 117**',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
            valueMarkdown:
              '**Hva skjer med skjemaet du sender inn?**\n\nSkjemaet sendes automatisk til din pasientjournal, og det er bare de som skal gi deg helsehjelp som har tilgang til det.\n\nSkjemaet om helseopplysninger er ikke et verktøy for å få kontakt med sykehuset. Skjemaet vil først bli lest i forbindelse med din timeavtale, ikke med en gang du sender det inn.\n\nDu får ikke svar på dette skjemaet. Dersom du har informasjon som haster, ta kontakt med sykehuset på telefon.\n\nOpplysningene om din helsetilstand er gyldig inntil 3 måneder. Skjer det endringer i perioden kan du fylle ut nytt skjema eller kontakte sykehuset\n\n**Dersom du trenger helsehjelp før din time, ta kontakt med din fastlege eller legevakten på telefon 116 117**',
          },
        ],
      },
      type: 'text',
      required: false,
      repeats: false,
      readOnly: false,
    },
    {
      extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath', valueString: 'today()' }],
      linkId: '6b5b6350-2885-4ea1-8b78-21eec7079af7',
      text: 'Dato',
      type: 'date',
      required: false,
      readOnly: true,
    },
    {
      linkId: '2',
      text: 'Mottaker',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
              valueString:
                "iif(%representative.relationship.coding.where(system = 'http://hl7.org/fhir/v3/RoleCode' and (code = 'PRN' or code = 'GRANTEE')).count() > 0, true, false)",
            },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true },
          ],
          linkId: '2.1',
          text: 'Om det er på vegne av eller ei. True er på vegne av',
          type: 'boolean',
          required: false,
          repeats: false,
          readOnly: false,
        },
        {
          extension: [
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
              valueString:
                "iif(%patient.gender.empty() or %patient.gender = 'other' or %patient.gender = 'unknown', 'Ukjent', iif(%patient.gender = 'female', 'Kvinne', 'Mann'))",
            },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true },
          ],
          linkId: '2.2',
          text: 'Kjønn',
          type: 'string',
          required: false,
          repeats: false,
          readOnly: false,
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'drop-down' }] },
            },
            {
              url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel',
              valueMarkdown: 'Du må ha en time på sykehuset for å få lagret skjemaet i din journal.',
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: {
                id: '75bc0e37-abc3-4c18-814d-6b94c5c4fb7c',
                reference: 'Endpoint/4',
                display: 'Akershus universitetssykehus HF',
              },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '9b37197c-7a94-491d-a535-adac9205d7cf', reference: 'Endpoint/34', display: 'Betanien Hospital Skien' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '9a41507b-6381-4746-8806-4921b83eab61', reference: 'Endpoint/44', display: 'Diakonhjemmet sykehus' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: 'c8029d4c-fbef-449f-837d-f9499cdbbf00', reference: 'Endpoint/36', display: 'Martina Hansens Hospital' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: {
                id: '7764161e-a5ce-49d5-b568-32148b21027a',
                reference: 'Endpoint/1',
                display: 'Oslo universitetssykehus HF',
              },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: {
                id: '225c9699-9026-4ba9-8ed4-408e21dedbaf',
                reference: 'Endpoint/31',
                display: 'Revmatismesykehuset Lillehammer',
              },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '3d8ee7af-7097-44db-85e3-fab1581924fc', reference: 'Endpoint/5', display: 'Sunnaas sykehus HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '8b455c18-0884-47c6-89e5-810cd1fcf1dc', reference: 'Endpoint/6', display: 'Sykehuset i Vestfold HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: 'dd359d46-affb-4829-9b05-c87bc240cc3a', reference: 'Endpoint/7', display: 'Sykehuset Innlandet HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: 'f4892865-d60d-4b01-ccb3-ebfb0dcf891b', reference: 'Endpoint/8', display: 'Sykehuset Telemark HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: 'a1125ab3-d2af-4d98-86c0-6415b328f097', reference: 'Endpoint/9', display: 'Sykehuset Østfold HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '1015e5d1-52d7-46d9-f24d-4aa98e51d2fd', reference: 'Endpoint/10', display: 'Sørlandet sykehus HF' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-optionReference',
              valueReference: { id: '86c791f6-d644-4d41-8f6e-6a094f20f8ff', reference: 'Endpoint/11', display: 'Vestre Viken HF' },
            },
          ],
          linkId: '33a69e13-1594-4c4d-8b10-0eff240cdb84',
          code: [
            { system: 'http://ehelse.no/fhir/ValueSet/TQQC', code: '1', display: 'Technical endpoint for receiving QuestionnaireResponse' },
          ],
          text: 'Velg sykehuset du skal behandles ved. Dette står i innkallingsbrevet.',
          type: 'choice',
          required: true,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '7570ab14-56cc-4a22-80aa-830e3e1335b4',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown:
                      'Velg sykehuset skjemaet skal sendes til i menyen under. Sykehusnavnet står i innkallingsbrevet. Skjemaet blir lagret i journalen din på det sykehuset du velger.',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: true,
              maxLength: 250,
            },
          ],
        },
      ],
    },
    {
      linkId: '4',
      text: 'Personopplysninger og pårørende',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: '4.1',
          text: 'Personopplysninger',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString: "Patient.name.where(use = 'official').select(given.join(' ') & ' ' & family)",
                },
              ],
              linkId: '4.1.1',
              text: 'Navn',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString:
                    "Patient.identifier.where(use = 'official' and (system = 'urn:oid:2.16.578.1.12.4.1.4.1' or system = 'urn:oid:2.16.578.1.12.4.1.4.2')).value",
                },
              ],
              linkId: '4.1.2',
              text: 'Fødselsnummer (11 siffer)',
              type: 'string',
              repeats: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString: "Patient.extension.where(url = 'http://helsenorge.no/fhir/StructureDefinition/sdf-age').value",
                },
              ],
              linkId: '4.1.3',
              text: 'Alder',
              type: 'integer',
              required: false,
              repeats: false,
              readOnly: true,
              maxLength: 250,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString: "Patient.telecom.where(use = 'mobile' and system = 'phone').value",
                },
              ],
              linkId: '4.1.4',
              text: 'Mobiltelefonnummer',
              type: 'string',
              enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 12 }],
              required: false,
              repeats: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minimum 5 tegn, maks 12 tegn. Telefonnummeret kan starte med + eller 00 for å angi landkode.',
                },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^((\\+|00)(\\d{1,3}))?\\d{5,12}$' },
              ],
              linkId: '4.1.5',
              text: 'Eventuelt annet telefonnummer vi kan nå deg på',
              type: 'string',
              enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 12 }],
              required: false,
              repeats: false,
              readOnly: false,
              maxLength: 12,
            },
          ],
        },
        {
          linkId: '4.2',
          text: 'Opplysninger om den som fyller ut skjemaet',
          type: 'group',
          enableWhen: [{ question: '2.1', operator: '=', answerBoolean: true }],
          enableBehavior: 'any',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString: "RelatedPerson.name.where(use = 'official').select(given.join(' ') & ' ' & family)",
                },
              ],
              linkId: '4.2.1',
              text: 'Navn',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString:
                    "RelatedPerson.identifier.where(use = 'official' and (system = 'urn:oid:2.16.578.1.12.4.1.4.1' or system = 'urn:oid:2.16.578.1.12.4.1.4.2')).value",
                },
              ],
              linkId: '4.2.2',
              text: 'Fødselsnummer (11 siffer)',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpath',
                  valueString: "RelatedPerson.telecom.where(use = 'mobile' and system = 'phone').value",
                },
              ],
              linkId: 'c3004568-7b61-4850-8261-fd0e30dccee5',
              text: 'Mobiltelefonnummer',
              type: 'string',
              required: false,
              readOnly: true,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minimum 5 tegn, maks 12 tegn. Telefonnummeret kan starte med + eller 00 for å angi landkode.',
                },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^((\\+|00)(\\d{1,3}))?\\d{5,12}$' },
              ],
              linkId: '5459eea9-910e-4336-8a7b-0d541e62697d',
              text: 'Eventuelt annet telefonnummer vi kan nå deg på',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: false,
              maxLength: 12,
            },
          ],
        },
        {
          linkId: '4565e825-1071-430b-fe4c-b02d43118b42',
          text: '### Ønsker du å registere flere pårørende?',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '### Ønsker du å registere flere pårørende?',
              },
            ],
          },
          type: 'choice',
          enableWhen: [{ question: '2.1', operator: '=', answerBoolean: true }],
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: '4.3',
          text: 'Hovedpårørende',
          type: 'group',
          enableWhen: [
            { question: '2.1', operator: '=', answerBoolean: false },
            {
              question: '4565e825-1071-430b-fe4c-b02d43118b42',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '4.3.1',
              text: 'Pårørende er en person over 18 år som sykehuset kan informere om din helsetilstand, hvis det blir behov for det.',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '4.3.2',
              text: 'Navn på hovedpårørende',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Du må fylle ut dette feltet' },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpathvalidation', valueString: 'this.value <= today()' },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-maxvalue', valueString: 'today()' },
              ],
              linkId: '4.3.3',
              text: 'Fødselsdato hovedpårørende',
              type: 'date',
              enableWhen: [{ question: '4.3.2', operator: 'exists', answerBoolean: true }],
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minimum 5 tegn, maks 12 tegn. Telefonnummeret kan starte med + eller 00 for å angi landkode.',
                },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^((\\+|00)(\\d{1,3}))?\\d{5,12}$' },
              ],
              linkId: '4.3.4',
              text: 'Telefonnummer hovedpårørende',
              type: 'string',
              enableWhen: [{ question: '4.3.2', operator: 'exists', answerBoolean: true }],
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 12,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
              ],
              linkId: '4.3.5',
              text: 'Relasjon',
              type: 'choice',
              enableWhen: [
                { question: '4.1.3', operator: '>=', answerInteger: 16 },
                { question: '4.3.2', operator: 'exists', answerBoolean: true },
              ],
              enableBehavior: 'all',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              answerValueSet: '#Relasjon',
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
              ],
              linkId: 'feeec8ff-90c1-4c52-be84-5b881c217b28',
              text: 'Relasjon',
              type: 'choice',
              enableWhen: [
                { question: '4.1.3', operator: '<', answerInteger: 16 },
                { question: '4.3.2', operator: 'exists', answerBoolean: true },
              ],
              enableBehavior: 'all',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              answerValueSet: '#92abfede-62ad-4c10-9b44-66b7ff51f654',
            },
          ],
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en pårørende til' },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
          ],
          linkId: '462c44b4-a446-4d6e-af38-9a4f1ebdbc58',
          text: 'Pårørende',
          type: 'group',
          enableWhen: [
            { question: '2.1', operator: '=', answerBoolean: false },
            {
              question: '4565e825-1071-430b-fe4c-b02d43118b42',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '8261a08b-49b5-4004-8bb0-f8d00ed09587',
              text: 'Pårørende er en person over 18 år som sykehuset kan informere om din helsetilstand, hvis det blir behov for det.',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '654ffa64-44d7-4aba-c0a6-171a073aeff2',
              text: 'Navn pårørende',
              type: 'string',
              required: false,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Du må fylle ut dette feltet' },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpathvalidation', valueString: 'this.value <= today()' },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-maxvalue', valueString: 'today()' },
              ],
              linkId: '8cdc55b7-f624-46f5-8e7d-e15785b16a7d',
              text: 'Fødselsdato pårørende',
              type: 'date',
              enableWhen: [{ question: '654ffa64-44d7-4aba-c0a6-171a073aeff2', operator: 'exists', answerBoolean: true }],
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minimum 5 tegn, maks 12 tegn. Telefonnummeret kan starte med + eller 00 for å angi landkode.',
                },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^((\\+|00)(\\d{1,3}))?\\d{5,12}$' },
              ],
              linkId: '3f7b5f98-1dd3-405e-8d6d-0d3dbc44c095',
              text: 'Telefonnummer pårørende',
              type: 'string',
              enableWhen: [{ question: '654ffa64-44d7-4aba-c0a6-171a073aeff2', operator: 'exists', answerBoolean: true }],
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 12,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
              ],
              linkId: 'f45d5299-9e73-489c-8e3a-471946635ee6',
              text: 'Relasjon',
              type: 'choice',
              enableWhen: [
                { question: '4.1.3', operator: '>=', answerInteger: 16 },
                { question: '654ffa64-44d7-4aba-c0a6-171a073aeff2', operator: 'exists', answerBoolean: true },
              ],
              enableBehavior: 'all',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              answerValueSet: '#Relasjon',
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
              ],
              linkId: '51ae10be-5f2b-4552-8087-fb5e21f06322',
              text: 'Relasjon',
              type: 'choice',
              enableWhen: [
                { question: '4.1.3', operator: '<', answerInteger: 16 },
                { question: '654ffa64-44d7-4aba-c0a6-171a073aeff2', operator: 'exists', answerBoolean: true },
              ],
              enableBehavior: 'all',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              answerValueSet: '#92abfede-62ad-4c10-9b44-66b7ff51f654',
            },
          ],
        },
        {
          linkId: '4.4',
          text: 'Barn i familien',
          type: 'group',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          repeats: false,
          item: [
            {
              extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
              linkId: '4.4.1',
              text: 'Har du eneansvar for barn under 18 år eller andre med spesielle omsorgsbehov?',
              type: 'choice',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#1101',
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '4.4.2',
              text: 'Barn og unge påvirkes når noen i familien er syke og trenger å forstå hva som skjer. Det kan være at du selv er pasient, pårørende eller at du er forelder til syke barn med søsken. Vi på sykehuset skal bidra til at barn og unge i din familie blir godt ivaretatt. Sykehuset forplikter seg derved å spørre om du har pårørende (barn eller søsken) som er under 18 år, slik at disse kan bli ivaretatt.',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown:
                      'Barn og unge påvirkes når noen i familien er syke og trenger å forstå hva som skjer. Det kan være at du selv er pasient, pårørende eller at du er forelder til syke barn med søsken. \r\n\r\nVi på sykehuset skal bidra til at barn og unge i din familie blir godt ivaretatt. \r\n\r\nSykehuset forplikter seg derved å spørre om du har pårørende (barn eller søsken) som er under 18 år, slik at disse kan bli ivaretatt.',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
          ],
        },
        {
          linkId: '4.5',
          text: 'Arbeidsgiver',
          type: 'group',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          repeats: false,
          item: [
            {
              extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
              linkId: '4.5.1',
              text: 'Har du en eller flere arbeidsgivere?',
              type: 'choice',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en arbeidsgiver til' },
                    { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                  ],
                  linkId: '4.5.1.1',
                  text: 'Arbeidsgiver',
                  type: 'group',
                  enableWhen: [{ question: '4.5.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
                  enableBehavior: 'any',
                  repeats: true,
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: '4.5.1.1.1',
                      text: 'Arbeidsgivers navn',
                      type: 'string',
                      required: true,
                      repeats: false,
                      readOnly: false,
                      maxLength: 250,
                    },
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: '4.5.1.1.2',
                      text: 'Yrke/stilling',
                      type: 'string',
                      required: true,
                      repeats: false,
                      readOnly: false,
                    },
                    {
                      extension: [
                        { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 100 },
                        { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                          valueCoding: { system: 'http://unitsofmeasure.org', code: '%', display: 'prosent' },
                        },
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString: 'Fyll ut med et tall mellom 0 og 100',
                        },
                      ],
                      linkId: '4.5.1.1.3',
                      text: 'Stillingsprosent',
                      type: 'quantity',
                      required: true,
                      repeats: false,
                      readOnly: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      linkId: '5',
      text: 'Helse',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          linkId: '5.99',
          text: 'Har du, eller har du hatt, noen av sykdommene under?',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Har du, eller har du hatt, noen av sykdommene under?**',
              },
            ],
          },
          type: 'display',
        },
        {
          linkId: '3c855cc8-1c92-4399-fbeb-c47d1f7f60c8',
          text: 'Hjerte-karsykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '557a7ca1-9118-4a1a-82c7-e0cf8effc295',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown:
                      'For eksempel hjerteinfarkt, angina/hjertekrampe, hjertesvikt, hjerterytmeforstyrrelse, uregelmessig puls, pacemaker',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: true,
              maxLength: 250,
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              text: 'Hvilken sykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: '3c855cc8-1c92-4399-fbeb-c47d1f7f60c8',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '65fdba05-94e0-4c07-88e1-41bee4c3e56a',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'angina-pectoris-(hjertekrampe)',
                    display: 'Angina pectoris (hjertekrampe)',
                  },
                },
                {
                  valueCoding: {
                    id: '4e5dcffb-e96b-41a7-f217-f2ba04745cb5',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'hjertesvikt',
                    display: 'Hjertesvikt',
                  },
                },
                {
                  valueCoding: {
                    id: '015e7391-1860-4366-f71a-5b902fd0ed4d',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'rytmeforstyrrelse-(atrieflimmer)',
                    display: 'Rytmeforstyrrelse (atrieflimmer)',
                  },
                },
                {
                  valueCoding: {
                    id: 'd35f5206-451f-48d1-8907-cd69f4fb02e5',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'klaffefeil',
                    display: 'Klaffefeil',
                  },
                },
                {
                  valueCoding: {
                    id: 'c0df951c-9e2c-48e6-eff5-024570049f60',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'hjerteoperert',
                    display: 'Hjerteoperert',
                  },
                },
                {
                  valueCoding: {
                    id: '68571ed7-0f54-41de-8634-bde20a4af777',
                    system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be',
                    code: 'annen-hjerte--og-karsykdom',
                    display: 'Annen hjerte- og karsykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '93f6cd88-6f54-47a6-9a1f-4c4c791c6949',
                  text: 'Annen hjerte- og karsykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'annen-hjerte--og-karsykdom' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
                {
                  linkId: '2c0f5806-6277-4f30-897c-155f84d04457',
                  text: 'Utblokking av kransårene i hjertet (PCI)?',
                  type: 'choice',
                  enableWhen: [
                    {
                      question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'hjerteoperert' },
                    },
                  ],
                  required: true,
                  answerValueSet: '#1101',
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: 'd552119f-c574-4267-8781-ab29fbaeb356',
                      text: 'Når og hvor ble du operert?',
                      type: 'string',
                      enableWhen: [
                        {
                          question: '2c0f5806-6277-4f30-897c-155f84d04457',
                          operator: '=',
                          answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                        },
                      ],
                      required: true,
                      maxLength: 250,
                      item: [
                        {
                          extension: [
                            {
                              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                              valueCodeableConcept: {
                                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                              },
                            },
                          ],
                          linkId: 'a17f5d7b-179f-4ecd-de21-b856683dae77',
                          _text: {
                            extension: [
                              {
                                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                                valueMarkdown: 'Vi ønsker å få vite hvilket årstall og på hvilket sykehus operasjonen ble utført',
                              },
                            ],
                          },
                          type: 'text',
                          required: false,
                          repeats: false,
                          readOnly: true,
                          maxLength: 250,
                        },
                      ],
                    },
                  ],
                },
                {
                  linkId: 'f89e8a48-ee59-46b9-93ee-e4567d0142b0',
                  text: 'Åpen hjerteoperasjon på hjertets kransårer (bypassoperasjon)?',
                  type: 'choice',
                  enableWhen: [
                    {
                      question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'hjerteoperert' },
                    },
                  ],
                  required: true,
                  answerValueSet: '#1101',
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: '54d16532-67b5-480a-f027-eece66b7d265',
                      text: 'Når og hvor ble du operert?',
                      type: 'string',
                      enableWhen: [
                        {
                          question: 'f89e8a48-ee59-46b9-93ee-e4567d0142b0',
                          operator: '=',
                          answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                        },
                      ],
                      required: true,
                      maxLength: 250,
                      item: [
                        {
                          extension: [
                            {
                              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                              valueCodeableConcept: {
                                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                              },
                            },
                          ],
                          linkId: '91e1b0cf-3b8a-470d-bbbc-c2266eb6deae',
                          _text: {
                            extension: [
                              {
                                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                                valueMarkdown: 'Vi ønsker å få vite hvilket årstall og på hvilket sykehus operasjonen ble utført',
                              },
                            ],
                          },
                          type: 'text',
                          required: false,
                          repeats: false,
                          readOnly: true,
                          maxLength: 250,
                        },
                      ],
                    },
                  ],
                },
                {
                  linkId: '66680c89-c2fc-4edb-8434-5a9cdfc515b4',
                  text: 'Hjerteklaffoperasjon?',
                  type: 'choice',
                  enableWhen: [
                    {
                      question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'hjerteoperert' },
                    },
                  ],
                  required: true,
                  answerValueSet: '#1101',
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: 'daf3c7d9-bfb5-4288-936a-3b0fd8ba11a0',
                      text: 'Når og hvor ble du operert?',
                      type: 'string',
                      enableWhen: [
                        {
                          question: '66680c89-c2fc-4edb-8434-5a9cdfc515b4',
                          operator: '=',
                          answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                        },
                      ],
                      required: true,
                      maxLength: 250,
                      item: [
                        {
                          extension: [
                            {
                              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                              valueCodeableConcept: {
                                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                              },
                            },
                          ],
                          linkId: '8f193374-6d60-4410-805d-b39d5d213e6b',
                          _text: {
                            extension: [
                              {
                                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                                valueMarkdown: 'Vi ønsker å få vite hvilket årstall og på hvilket sykehus operasjonen ble utført',
                              },
                            ],
                          },
                          type: 'text',
                          required: false,
                          repeats: false,
                          readOnly: true,
                          maxLength: 250,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
              linkId: '5.1.3',
              text: 'Har du pacemaker?',
              type: 'choice',
              enableWhen: [
                {
                  question: '3c855cc8-1c92-4399-fbeb-c47d1f7f60c8',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '5.1.3.1',
                  text: 'Om du vet hvilken type pacemaker du har, skriv det under',
                  type: 'string',
                  enableWhen: [{ question: '5.1.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
                  enableBehavior: 'any',
                  required: false,
                  repeats: false,
                  readOnly: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '45dd2dfc-fa5e-45aa-8439-5177ba6451f2',
          text: 'Høyt blodtrykk (hypertensjon)',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              linkId: 'ed30475e-45ab-4041-8265-022fbe39ac70',
              text: 'Er blodtrykket ditt velkontrollert med medisiner?',
              type: 'choice',
              enableWhen: [
                {
                  question: '45dd2dfc-fa5e-45aa-8439-5177ba6451f2',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1102',
            },
          ],
        },
        {
          linkId: '69835343-423f-4022-8e60-7e5a93516c1f',
          text: 'Økt blødningstendens eller bruker du blodfortynnende medisiner',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '8a1d7b4f-32c0-402e-dc4c-617844e9243f',
              text: 'Huk av for det som gjelder deg',
              type: 'choice',
              enableWhen: [
                {
                  question: '69835343-423f-4022-8e60-7e5a93516c1f',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '5be71054-444e-4f73-e029-e45a3fc83d1b',
                    system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8',
                    code: 'blodfortynnende-medisiner',
                    display: 'Blodfortynnende medisiner',
                  },
                },
                {
                  valueCoding: {
                    id: '7c6fbcbf-ec7f-4e29-885c-86732eb63ee2',
                    system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8',
                    code: 'blødersykdom-eller-andre-koagulasjonsforstyrrelser-(forstyrrelser-i-blodets-levringsevne)',
                    display: 'Blødersykdom eller andre koagulasjonsforstyrrelser (forstyrrelser i blodets levringsevne)',
                  },
                },
                {
                  valueCoding: {
                    id: 'e9c0525e-6e79-45e2-9973-2fc49d9c9570',
                    system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8',
                    code: 'annen-blødningstendens',
                    display: 'Annen blødningstendens',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '9ca3c11a-1b84-4e53-a792-e234c1090511',
                  text: 'Annen blødningstendens',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '8a1d7b4f-32c0-402e-dc4c-617844e9243f',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8', code: 'annen-blødningstendens' },
                    },
                  ],
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: 'd727a93c-da5a-4636-f99e-f80b83a342fb',
          text: 'Lungesykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
              text: 'Hvilken lungesykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'd727a93c-da5a-4636-f99e-f80b83a342fb',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '8d14cda1-7ca4-4964-81b2-0d11d3cab363',
                    system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2',
                    code: 'astma',
                    display: 'Astma',
                  },
                },
                {
                  valueCoding: {
                    id: 'd703e121-3c3e-4325-99af-4abb1ea714cc',
                    system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2',
                    code: 'kols',
                    display: 'KOLS',
                  },
                },
                {
                  valueCoding: {
                    id: '1b07ef9a-a811-4bcf-8f1e-4ef63827520f',
                    system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2',
                    code: 'lungefibrose',
                    display: 'Lungefibrose',
                  },
                },
                {
                  valueCoding: {
                    id: '9114ed4b-aef6-457e-8ee1-43a7283e6702',
                    system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2',
                    code: 'annen-lungesykdom',
                    display: 'Annen lungesykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '3fa933b3-4102-4830-adb8-6ed483818223',
                  text: 'Annen lungesykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2', code: 'annen-lungesykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
            {
              linkId: '7110533c-25ac-43e8-99c3-75e3b137d2a3',
              text: 'Bruker du oksygen hjemme?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'd727a93c-da5a-4636-f99e-f80b83a342fb',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
            },
          ],
        },
        {
          linkId: '870ca577-125a-4d75-8473-70328ea16432',
          text: 'Søvnapné',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
                  },
                },
              ],
              linkId: 'ee8c92a2-e5ec-4d86-840b-6c50c05a471e',
              text: 'Bruker du pustemaske når du sover?',
              type: 'choice',
              enableWhen: [
                {
                  question: '870ca577-125a-4d75-8473-70328ea16432',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
              item: [
                {
                  linkId: '22394301-8fa5-4281-8324-42e9f524f5a8',
                  text: 'Ta med deg pustemasken dersom du skal legges inn på sykehuset.',
                  type: 'display',
                  enableWhen: [
                    {
                      question: 'ee8c92a2-e5ec-4d86-840b-6c50c05a471e',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          linkId: 'b188d3ca-677a-4961-864d-951bae2057fa',
          text: 'Nevrologisk sykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
              text: 'Hvilken nevrologisk sykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'b188d3ca-677a-4961-864d-951bae2057fa',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'b1cc53ec-766a-4b21-8b6a-3c37bf8a96f8',
                    system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342',
                    code: 'parkinsons-sykdom',
                    display: 'Parkinsons sykdom',
                  },
                },
                {
                  valueCoding: {
                    id: 'b011e0f4-37ad-4cf3-9992-2fa15508ff41',
                    system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342',
                    code: 'multippel-sklerose-(ms)',
                    display: 'Multippel sklerose (MS)',
                  },
                },
                {
                  valueCoding: {
                    id: '2a43cb81-8dcc-4105-c329-8013c3792a52',
                    system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342',
                    code: 'migrene',
                    display: 'Migrene',
                  },
                },
                {
                  valueCoding: {
                    id: 'a8d9a484-c93f-4a6e-b57c-b5d0b03e9d5b',
                    system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342',
                    code: 'annen-nevrologisk-sykdom',
                    display: 'Annen nevrologisk sykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '36898039-9053-405f-ea47-123cfe53b160',
                  text: 'Annen nevrologisk sykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342', code: 'annen-nevrologisk-sykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '32d1825b-1593-4f6f-e99e-d8f23d5d12d9',
          text: 'Nyresykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: 'f85095a9-80a4-46e5-8911-792b28a58b24',
              text: 'Hvilken nyresykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: '32d1825b-1593-4f6f-e99e-d8f23d5d12d9',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '7f0a0e1e-0765-4a5b-9cff-f56047c6d5f9',
                    system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0',
                    code: 'nyresvikt',
                    display: 'Nyresvikt',
                  },
                },
                {
                  valueCoding: {
                    id: 'ac3d3625-0fc0-455a-8411-7c9d8ddc1e1a',
                    system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0',
                    code: 'nyrestein',
                    display: 'Nyrestein',
                  },
                },
                {
                  valueCoding: {
                    id: '90197b0c-05b2-4e66-ceb3-15553f7f145d',
                    system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0',
                    code: 'annen-nyresykdom',
                    display: 'Annen nyresykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'a1d1b623-866b-4583-c1c1-648b2482986a',
                  text: 'Annen nyresykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'f85095a9-80a4-46e5-8911-792b28a58b24',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0', code: 'annen-nyresykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: 'b13ddc1a-d6f3-4f22-e0b8-3d69b0cf78ee',
          text: 'Leversykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '645a725a-bb7e-4fcb-9f7c-054c8b3e4348',
              text: 'Hvilken leversykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'b13ddc1a-d6f3-4f22-e0b8-3d69b0cf78ee',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'eb4336e0-38f3-4380-898f-4f05cec2dbfd',
                    system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697',
                    code: 'skrumplever/fettlever',
                    display: 'Skrumplever/fettlever',
                  },
                },
                {
                  valueCoding: {
                    id: 'a18e7635-2b48-405c-96d6-b696bed778d9',
                    system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697',
                    code: 'leversvikt',
                    display: 'Leversvikt',
                  },
                },
                {
                  valueCoding: {
                    id: '38c2b658-9eb9-44e4-84e0-7c4aa5fc6af5',
                    system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697',
                    code: 'annen-leversykdom',
                    display: 'Annen leversykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'e2d44462-fe18-4d3a-d7fa-fd1ceaf2d9a6',
                  text: 'Annen leversykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '645a725a-bb7e-4fcb-9f7c-054c8b3e4348',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697', code: 'annen-leversykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '347e9839-291a-43d7-c640-7d6480af423a',
          text: 'Diabetes',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              linkId: '08556ec1-992f-457d-8083-95e5814845ac',
              text: 'Hvilken type diabetes har du?',
              type: 'choice',
              enableWhen: [
                {
                  question: '347e9839-291a-43d7-c640-7d6480af423a',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'd9e0bc1c-96ab-4d36-a420-c53ffce1740a',
                    system: 'urn:uuid:b3031217-152e-4282-8b69-c73516d04191',
                    code: 'diabetes-type-1',
                    display: 'Diabetes type 1',
                  },
                },
                {
                  valueCoding: {
                    id: '231ea8b8-3543-49a0-eabb-2de7774237b9',
                    system: 'urn:uuid:b3031217-152e-4282-8b69-c73516d04191',
                    code: 'diabetes-type-2',
                    display: 'Diabetes type 2',
                  },
                },
                {
                  valueCoding: {
                    id: 'd3fe64bf-09a2-4b69-da75-fee4fe5e52ec',
                    system: 'urn:uuid:b3031217-152e-4282-8b69-c73516d04191',
                    code: 'vet-ikke',
                    display: 'Vet ikke',
                  },
                },
              ],
            },
          ],
        },
        {
          linkId: '32b090b0-3be1-4197-8601-d1142e22079f',
          text: 'Stoffskiftesykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '4eebac0c-5064-4f70-e18c-113116e201e8',
              text: 'Hvilken stoffskiftesykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: '32b090b0-3be1-4197-8601-d1142e22079f',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '5f9175df-1a66-4485-8f5b-418245ff6fb8',
                    system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098',
                    code: 'høyt-stoffskifte-(hypertyreose)',
                    display: 'Høyt stoffskifte (hypertyreose)',
                  },
                },
                {
                  valueCoding: {
                    id: '2f00561c-3453-40f5-8890-e091d19e7354',
                    system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098',
                    code: 'lavt-stoffskifte-(hypotyreose)',
                    display: 'Lavt stoffskifte (hypotyreose)',
                  },
                },
                {
                  valueCoding: {
                    id: '1c45dadb-54f3-432d-8b32-c5b7b2e81a8b',
                    system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098',
                    code: 'binyrebarksvikt-(addisons-sykdom)',
                    display: 'Binyrebarksvikt (Addisons sykdom)',
                  },
                },
                {
                  valueCoding: {
                    id: '49167710-bfd6-4164-8f89-e0a7c8135397',
                    system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098',
                    code: 'annen-stoffskiftesykdom',
                    display: 'Annen stoffskiftesykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'ff6637d7-920b-45b0-fe05-e2e2898faf71',
                  text: 'Annen stoffskiftesykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '4eebac0c-5064-4f70-e18c-113116e201e8',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098', code: 'annen-stoffskiftesykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '2d617e01-0555-499e-8817-9bdfb202bb28',
          text: 'Leddgikt eller muskel-skjelettsykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '1db1edac-d501-407c-828e-f8a29b59f481',
              text: 'Hvilken leddgikt eller muskel-skjelettsykdom',
              type: 'choice',
              enableWhen: [
                {
                  question: '2d617e01-0555-499e-8817-9bdfb202bb28',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'e9bab8e4-595c-48b5-8af2-19bd99214c0f',
                    system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718',
                    code: 'arvelig-muskelsykdom',
                    display: 'Arvelig muskelsykdom',
                  },
                },
                {
                  valueCoding: {
                    id: '28c67c41-3e17-4ba1-89d2-68db99d7e452',
                    system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718',
                    code: 'leddgikt/ra',
                    display: 'Leddgikt/RA',
                  },
                },
                {
                  valueCoding: {
                    id: 'd87991c9-c283-4478-8499-502bbe99f9e3',
                    system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718',
                    code: 'psoriasisartritt',
                    display: 'Psoriasisartritt',
                  },
                },
                {
                  valueCoding: {
                    id: 'a73785a9-4bf1-4f89-9415-21b862754914',
                    system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718',
                    code: 'me/fibromyalgi',
                    display: 'ME/fibromyalgi',
                  },
                },
                {
                  valueCoding: {
                    id: '6731095a-f09b-4eff-85e0-bb37c8a2a978',
                    system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718',
                    code: 'annen-muskel/skjelettsykdom',
                    display: 'Annen muskel/skjelettsykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'f637efdc-9c07-43ce-85bc-85f87854be1d',
                  text: 'Annen muskel/skjelettsykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '1db1edac-d501-407c-828e-f8a29b59f481',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'annen-muskel/skjelettsykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '9741cd16-73a6-45ba-e193-34e6076cc183',
          text: 'Mage- eller tarmproblemer',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              text: 'Hvilken type mage- eller tarmproblemer?',
              type: 'choice',
              enableWhen: [
                {
                  question: '9741cd16-73a6-45ba-e193-34e6076cc183',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '31b83463-2a92-4e21-d404-6696f51396d3',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'irritabel-tarmsyndrom-(ibs)',
                    display: 'Irritabel tarmsyndrom (IBS)',
                  },
                },
                {
                  valueCoding: {
                    id: '1ea04a4c-10d5-4f7b-d56c-4748b792b3b9',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'ulcerøs-kolitt',
                    display: 'Ulcerøs kolitt',
                  },
                },
                {
                  valueCoding: {
                    id: '810316f8-1ea5-4fa8-8157-40144872bafa',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'crohns-sykdom',
                    display: 'Crohns sykdom',
                  },
                },
                {
                  valueCoding: {
                    id: 'aff18bf4-498f-4280-808b-de6a2f4dfe6e',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'magesår',
                    display: 'Magesår',
                  },
                },
                {
                  valueCoding: {
                    id: '51b6c8e6-5b0c-4570-fc91-a8e9b4be40f7',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'sure-oppstøt/refluks',
                    display: 'Sure oppstøt/refluks',
                  },
                },
                {
                  valueCoding: {
                    id: '42b0f8bc-f7b6-4f22-eb26-30895bc34c35',
                    system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4',
                    code: 'annen-mage-eller-tarmproblem',
                    display: 'Annen mage eller tarmproblem',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'b5d4901b-a78d-432b-b4e2-3d4abb23bf3e',
                  text: 'Annen mage eller tarmproblem',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'annen-mage-eller-tarmproblem' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '7f03eb20-b5b8-4577-f81a-2d725886e389',
          text: 'Psykisk sykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '13665034-4d28-4e26-d07c-72de808610a8',
              text: 'Hvilken psykisk sykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: '7f03eb20-b5b8-4577-f81a-2d725886e389',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'e8d9fd92-14c6-43f9-805f-064ae4d3595c',
                    system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d',
                    code: 'depresjon',
                    display: 'Depresjon',
                  },
                },
                {
                  valueCoding: {
                    id: 'eb66711b-6b30-4916-b3ea-1b74e7f90953',
                    system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d',
                    code: 'angst',
                    display: 'Angst',
                  },
                },
                {
                  valueCoding: {
                    id: '48b93646-f91f-4211-c795-50b053d2f086',
                    system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d',
                    code: 'adhd',
                    display: 'ADHD',
                  },
                },
                {
                  valueCoding: {
                    id: '65d2a4dd-aecc-4503-b722-6332fdd1551b',
                    system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d',
                    code: 'annen-psykisk-sykdom',
                    display: 'Annen psykisk sykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '3c101c82-e67a-424d-c607-a95d35544680',
                  text: 'Annen psykisk sykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '13665034-4d28-4e26-d07c-72de808610a8',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d', code: 'annen-psykisk-sykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '66b2ae92-8389-4f01-8630-20a67be643ed',
          text: 'Smittsom sykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              text: 'Hvilken smittsom sykdom?',
              type: 'choice',
              enableWhen: [
                {
                  question: '66b2ae92-8389-4f01-8630-20a67be643ed',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: '954f6f3d-e8b8-46d2-82b1-67061b518556',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'hepatitt',
                    display: 'Hepatitt',
                  },
                },
                {
                  valueCoding: {
                    id: '91c2bdff-8aa2-45f8-da41-9420eb1e3c7d',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'hiv',
                    display: 'HIV',
                  },
                },
                {
                  valueCoding: {
                    id: 'a709d9e8-3cfe-4ec2-a53a-e3d73e59a410',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'mrsa',
                    display: 'MRSA',
                  },
                },
                {
                  valueCoding: {
                    id: 'a2a22c02-203f-45f5-8095-80a44b4a7910',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'vre',
                    display: 'VRE',
                  },
                },
                {
                  valueCoding: {
                    id: '316d75da-7193-4487-a555-e2ea05218cff',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'esbl',
                    display: 'ESBL',
                  },
                },
                {
                  valueCoding: {
                    id: '297544ed-4dd7-4279-8e59-bdf7ca305cf4',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'annen-smittsom-sykdom',
                    display: 'Annen smittsom sykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'e0d9a7c7-ef73-4b25-8044-04a26967677c',
                  text: 'Annen smittsom sykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'annen-smittsom-sykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: 'dbf67538-3da4-4dab-91d3-eed72726dfd9',
          text: 'Kreft',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '30c3b30e-2d40-4f74-b73f-ab828456c6bc',
              text: 'Hvilken type kreft?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'dbf67538-3da4-4dab-91d3-eed72726dfd9',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerOption: [
                {
                  valueCoding: {
                    id: 'a709d9e8-3cfe-4ec2-a53a-e3d73e59a410',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'aktiv-kreftsykdom',
                    display: 'Aktiv kreftsykdom',
                  },
                },
                {
                  valueCoding: {
                    id: 'a2a22c02-203f-45f5-8095-80a44b4a7910',
                    system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706',
                    code: 'ferdigbehandlet-kreftsykdom',
                    display: 'Ferdigbehandlet kreftsykdom',
                  },
                },
              ],
              item: [
                {
                  extension: [
                    { url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel', valueMarkdown: 'Hvilken krefttype og behandling' },
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'ceea7c12-f364-46e4-a3b9-9adb5b46dd92',
                  text: 'Aktiv kreftsykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '30c3b30e-2d40-4f74-b73f-ab828456c6bc',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'aktiv-kreftsykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
                {
                  extension: [
                    { url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel', valueMarkdown: 'Hvilken krefttype og behandling' },
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '0ad002a4-4c3f-4187-8088-ad05f66fff2a',
                  text: 'Ferdigbehandlet kreftsykdom',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '30c3b30e-2d40-4f74-b73f-ab828456c6bc',
                      operator: '=',
                      answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'ferdigbehandlet-kreftsykdom' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '8fd3f7b0-6404-466f-8784-d11166bd980b',
          text: 'Annen sykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minst en sykdom. Du må fylle ut dette feltet med bokstaver og tall',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '5.13.1',
              text: 'Hvilken sykdom?',
              type: 'string',
              enableWhen: [
                {
                  question: '8fd3f7b0-6404-466f-8784-d11166bd980b',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }] },
            },
          ],
          linkId: '5.5',
          text: 'Får du brystsmerter eller blir du tungpustet når du går opp trapper to etasjer i normalt tempo?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerOption: [
            {
              valueCoding: {
                id: '109ecc65-1e3c-47e1-8c81-e6996d391ac7',
                system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80',
                code: 'brystsmerter',
                display: 'Brystsmerter',
              },
            },
            {
              valueCoding: {
                id: '11449f9a-0fdd-44dd-b112-f13360b8344b',
                system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80',
                code: 'tungpustet',
                display: 'Tungpustet',
              },
            },
            {
              valueCoding: {
                id: '27b7682e-183f-4712-8113-7dd477102c69',
                system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80',
                code: 'kan-ikke-gå-i-trapper',
                display: 'Kan ikke gå i trapper',
              },
            },
            {
              valueCoding: {
                id: 'c3cc8368-f31d-4935-ad21-628263c1f39d',
                system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80',
                code: 'nei',
                display: 'Nei',
              },
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '5.14',
          text: 'Er du gravid?',
          type: 'choice',
          enableWhen: [
            { question: '2.2', operator: '=', answerString: 'Kvinne' },
            { question: '4.1.3', operator: '<', answerInteger: 55 },
          ],
          enableBehavior: 'all',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Velg dato, eller skriv dato på denne måten: dd.mm.åååå. Dato må være større enn dagens dato.',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-fhirpathvalidation', valueString: 'this.value >= today()' },
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-minvalue', valueString: 'today()' },
              ],
              linkId: '5.14.1',
              text: 'Forventet termin',
              type: 'date',
              enableWhen: [{ question: '5.14', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
            },
          ],
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
            { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
          ],
          linkId: '5.15',
          text: 'Ammer du?',
          type: 'choice',
          enableWhen: [
            { question: '2.2', operator: '=', answerString: 'Kvinne' },
            { question: '4.1.3', operator: '<', answerInteger: 55 },
          ],
          enableBehavior: 'all',
          required: true,
          repeats: false,
          readOnly: false,
          maxLength: 250,
          answerValueSet: '#1101',
        },
      ],
    },
    {
      linkId: 'f171bd82-9774-4810-d09b-e658c70a9072',
      text: 'Helse',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          linkId: 'f341b3ec-d2da-42f2-995e-93465e494413',
          text: 'Har du, eller har du hatt, noen av sykdommene under?',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Har du, eller har du hatt, noen av sykdommene under?**',
              },
            ],
          },
          type: 'display',
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
              },
            },
          ],
          linkId: '559583f9-275a-47b4-8412-8cba9972c70e',
          text: 'Diabetes',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
              },
            },
          ],
          linkId: '587d60ed-e59c-49e6-8e53-5813b4c9cbb6',
          text: 'Nevrologiske sykdommer (for eksempel epilepsi)',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Du må oppgi minst en sykdom. Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '1f11a623-db49-4cea-afd1-330be80f67b3',
              text: 'Hvilken sykdom?',
              type: 'string',
              enableWhen: [
                {
                  question: '587d60ed-e59c-49e6-8e53-5813b4c9cbb6',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
              },
            },
          ],
          linkId: 'e5cd2d99-5301-4d5e-8ba5-ac157e12d9a6',
          text: 'Problemer med fordøyelsen',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Du må oppgi minst en sykdom. Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '759d711d-2018-4112-9d3a-786c7df4c065',
              text: 'Kan du beskrive kort?',
              type: 'string',
              enableWhen: [
                {
                  question: 'e5cd2d99-5301-4d5e-8ba5-ac157e12d9a6',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
              },
            },
          ],
          linkId: 'aa63605c-3a85-4927-dab4-793170089a8c',
          text: 'Lungesykdom (for eksempel astma, cystisk fibrose eller søvnapné)',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Du må oppgi minst en sykdom. Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '026d4ba8-33f7-47e8-a538-8ff0d4bb7f69',
              text: 'Hvilken sykdom?',
              type: 'string',
              enableWhen: [
                {
                  question: 'aa63605c-3a85-4927-dab4-793170089a8c',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
            {
              linkId: 'aeee391b-7890-47bf-8ae5-f90216d56cbb',
              text: 'Bruker du forstøver, pustemaske eller andre hjelpemidler?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'aa63605c-3a85-4927-dab4-793170089a8c',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: false,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '1064a7f5-a086-4a6f-8ca8-e0889dd8a163',
                  text: 'Beskriv',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'aeee391b-7890-47bf-8ae5-f90216d56cbb',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: false,
                  maxLength: 250,
                },
                {
                  linkId: '83b55b8b-bcf4-4f9b-86b7-9cc7eeb13286',
                  text: 'Hvis du bruker pustemaske må du ta med denne om du skal legges inn på sykehuset.',
                  type: 'display',
                  enableWhen: [
                    {
                      question: 'aeee391b-7890-47bf-8ae5-f90216d56cbb',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'radio-button' }],
              },
            },
          ],
          linkId: '8aa5477f-c313-49aa-a1c4-4c928a2618ef',
          text: 'Medfødte sykdommer (for eksempel hjertefeil)',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Du må oppgi minst en sykdom. Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'c98241d8-dca5-4f8c-9612-6f0f5605ee06',
              text: 'Hvilken sykdom?',
              type: 'string',
              enableWhen: [
                {
                  question: '8aa5477f-c313-49aa-a1c4-4c928a2618ef',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          linkId: '19cee86d-9e1e-445e-8490-b6ddd6773217',
          text: 'Annen sykdom',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du må oppgi minst en sykdom. Du må fylle ut dette feltet med bokstaver og tall',
                },
                { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en sykdom til' },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 10 },
                { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '5743a72d-2641-47da-9f8e-bda82d996fdd',
              text: 'Hvilken sykdom?',
              type: 'string',
              enableWhen: [
                {
                  question: '19cee86d-9e1e-445e-8490-b6ddd6773217',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
      ],
    },
    {
      linkId: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
      text: 'Skal du til gynekologisk avdeling?',
      type: 'choice',
      enableWhen: [
        { question: '2.2', operator: '=', answerString: 'Kvinne' },
        { question: '4.1.3', operator: '>=', answerInteger: 16 },
      ],
      enableBehavior: 'all',
      required: true,
      answerValueSet: '#1101',
      item: [
        {
          linkId: '37cd2a60-1663-4cb0-98b6-e704379a1019',
          text: 'Har du vært gravid tidligere?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              linkId: 'ce7e2c56-6f98-47a3-89bd-c204afe75386',
              text: 'Har du født ett eller flere barn?',
              type: 'choice',
              enableWhen: [
                {
                  question: '37cd2a60-1663-4cb0-98b6-e704379a1019',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'df9b1469-2ffe-4c5a-8fe2-ddd648d9a0f7',
                  text: 'Antall vaginale fødsler og årstall',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'ce7e2c56-6f98-47a3-89bd-c204afe75386',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '2cfbb306-d532-4746-ef47-26458bd49278',
                  text: 'Antall keisersnitt og årstall',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'ce7e2c56-6f98-47a3-89bd-c204afe75386',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
              ],
            },
            {
              linkId: '9a6271f1-4519-4964-9f02-582a89580f55',
              text: 'Har du abortert?',
              type: 'choice',
              enableWhen: [
                {
                  question: '37cd2a60-1663-4cb0-98b6-e704379a1019',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '92fdc6f7-c125-4739-8363-20be8532430e',
                  text: 'Antall spontanaborter',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '9a6271f1-4519-4964-9f02-582a89580f55',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'ea4ccf17-4e32-44dc-94cf-2e30794729bf',
                  text: 'Antall provoserte aborter',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '9a6271f1-4519-4964-9f02-582a89580f55',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'd2d59d88-7bb4-4ba7-9168-609b634b8d65',
                  text: 'Antall medisinske aborter',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '9a6271f1-4519-4964-9f02-582a89580f55',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '011a1aed-0fdc-49e0-cf95-719430065679',
                  text: 'Antall kirurgiske aborter',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '9a6271f1-4519-4964-9f02-582a89580f55',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
              ],
            },
            {
              linkId: 'f9c7cfb6-f5df-4722-9b09-bb7b1abcb28c',
              text: 'Har du hatt svangerskap utenfor livmoren?',
              type: 'choice',
              enableWhen: [
                {
                  question: '37cd2a60-1663-4cb0-98b6-e704379a1019',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
              item: [
                {
                  linkId: '32077b26-cdb1-438f-8762-49367bf2e451',
                  text: 'Ble du operert relatert til dette?',
                  type: 'choice',
                  enableWhen: [
                    {
                      question: 'f9c7cfb6-f5df-4722-9b09-bb7b1abcb28c',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  answerValueSet: '#1101',
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                          valueString:
                            'Fyll ut feltet med minimum 1 tegn og maksimum 500 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                        },
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/regex',
                          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                        },
                      ],
                      linkId: '16e522ba-9ee0-4030-87e3-6fb2fe5ad49f',
                      text: 'Hva ble gjort under operasjonen?',
                      type: 'text',
                      enableWhen: [
                        {
                          question: '32077b26-cdb1-438f-8762-49367bf2e451',
                          operator: '=',
                          answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                        },
                      ],
                      required: false,
                      maxLength: 500,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          linkId: '552ee1c4-cb95-49ca-8667-6b245a1b6a98',
          text: 'Er du tidligere behandlet for livmorhalsforandringer?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '1d1aa357-ef7f-4b8f-d5da-b2ed79288609',
              text: 'Oppgi behandling, årstall og sted',
              type: 'text',
              enableWhen: [
                {
                  question: '552ee1c4-cb95-49ca-8667-6b245a1b6a98',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              maxLength: 250,
            },
          ],
        },
        {
          linkId: 'af6614e7-41b0-459a-9592-f2b0a0856d54',
          text: 'Har du fått vaksine mot HPV (Humant papillomavirus)?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: 'c53fbe5b-5ee8-4afd-8f06-6360549bf14c',
          text: 'Har du menstruasjon?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/sdf-maxvalue', valueString: 'today()' },
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Du kan bare legge inn datoer tilbake i tid',
                },
              ],
              linkId: '3a05b2b4-a1e6-4e2b-8a7f-937b6a73f434',
              text: 'Angi dato for siste menstruasjon',
              type: 'date',
              enableWhen: [
                {
                  question: 'c53fbe5b-5ee8-4afd-8f06-6360549bf14c',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: false,
            },
            {
              linkId: '0c5bb2e8-10a4-4c60-bef9-44715e207637',
              text: 'Har du kommet i overgangsalderen (menopause)?',
              type: 'choice',
              enableWhen: [
                {
                  question: 'c53fbe5b-5ee8-4afd-8f06-6360549bf14c',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '2' },
                },
              ],
              required: true,
              answerValueSet: '#1101',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'f3374c64-976f-40e9-9286-26719fb63347',
                  text: 'Husker du hvor gammel du var?',
                  type: 'string',
                  enableWhen: [
                    {
                      question: '0c5bb2e8-10a4-4c60-bef9-44715e207637',
                      operator: '=',
                      answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                    },
                  ],
                  required: true,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '6e343068-ebd4-4f3b-f2b6-e11a4f81a3ca',
          text: 'Har du blitt operert i eller via skjeden?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 500 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '0c160f75-e8ab-4dba-81e9-380c0feca162',
              text: 'Oppgi hva slags operasjon og når',
              type: 'text',
              enableWhen: [
                {
                  question: '6e343068-ebd4-4f3b-f2b6-e11a4f81a3ca',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              maxLength: 500,
            },
          ],
        },
        {
          linkId: '2774a6ed-517d-4fe8-eebb-69210f4bcdd2',
          text: 'Har du blitt operert med kikkhull i magen/buken?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 500 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'f64efa24-a94e-4bee-c2cb-5c8553fd76ea',
              text: 'Oppgi hva slags inngrep og når',
              type: 'text',
              enableWhen: [
                {
                  question: '2774a6ed-517d-4fe8-eebb-69210f4bcdd2',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              maxLength: 500,
            },
          ],
        },
        {
          linkId: '5dd664a4-4120-41d6-8fff-79f591037724',
          text: 'Har du blitt operert med åpen mage/bukoperasjon?',
          type: 'choice',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 500 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'b20b79a3-7c55-4b6d-83b4-fb7909597a49',
              text: 'Oppgi hva slags inngrep og når, og hvor mange har vært keisersnitt',
              type: 'text',
              enableWhen: [
                {
                  question: '5dd664a4-4120-41d6-8fff-79f591037724',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              maxLength: 500,
            },
          ],
        },
      ],
    },
    {
      linkId: '6',
      text: 'Medisiner og allergier',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '6.1',
          text: 'Bruker du medisiner? Gjelder også prevensjonsmidler, reseptfrie medisiner, alternative medisiner og naturmedisiner',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  '#### **Bruker du medisiner?**\n\n_Gjelder også prevensjonsmidler, reseptfrie medisiner, alternative medisiner og naturmedisiner_',
              },
            ],
          },
          type: 'choice',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '0b923e48-3f69-4205-edb7-dcc9cb531eb4',
          text: 'Bruker du medisiner? Gjelder også reseptfrie medisiner, alternative medisiner og naturmedisiner',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  '#### **Bruker du medisiner?**\n\n_Gjelder også reseptfrie medisiner, alternative medisiner og naturmedisiner_',
              },
            ],
          },
          type: 'choice',
          enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
        },
        {
          linkId: '47f59e8d-c445-4013-edd4-3792cfd25c61',
          text: 'Ta med oppdatert medisinliste til timeavtalen. Denne kan du få på apoteket eller hos din fastlege.**_',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '_**Ta med oppdatert medisinliste til timeavtalen. Denne kan du få på apoteket eller hos din fastlege.**_',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            { question: '6.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            {
              question: '0b923e48-3f69-4205-edb7-dcc9cb531eb4',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en medisin til' },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 20 },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
          ],
          linkId: '6.2',
          text: 'Medisin:',
          type: 'group',
          enableWhen: [
            { question: '6.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            {
              question: '0b923e48-3f69-4205-edb7-dcc9cb531eb4',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.2.1',
              text: 'Navn på medisin, styrke og type (for eksempel tablett, dråper eller sprøyte)',
              type: 'string',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                      },
                    },
                  ],
                  linkId: '6.2.1.1',
                  text: 'For eksempel Paracet 500mg tablett',
                  _text: {
                    extension: [
                      {
                        url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                        valueMarkdown: 'For eksempel Paracet 500 mg tablett',
                      },
                    ],
                  },
                  type: 'text',
                  required: false,
                  repeats: false,
                  readOnly: false,
                },
              ],
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.2.2',
              text: 'Hvor mye tar du av medisinen hver dag?',
              type: 'string',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                      },
                    },
                  ],
                  linkId: '6.2.2.1',
                  text: 'For eksempel 2 tabletter 3 ganger om dagen',
                  _text: {
                    extension: [
                      {
                        url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                        valueMarkdown:
                          'For eksempel “2 tabletter 3 ganger om dagen”. Se på etiketten for hjelp. Er du usikker, skriv “vet ikke”.',
                      },
                    ],
                  },
                  type: 'text',
                  required: false,
                  repeats: false,
                  readOnly: false,
                },
              ],
            },
            {
              extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true }],
              linkId: '6.2.4',
              text: 'Ta med oppdatert medisinliste til timeavtalen. Denne kan du få i apotek eller hos din fastlege.',
              type: 'display',
              enableWhen: [{ question: '6.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '6.3',
          text: 'Er du allergisk mot noen medisiner?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en medisin til' },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 20 },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
          ],
          linkId: '6.4',
          text: 'Medisin du er allergisk mot:',
          type: 'group',
          enableWhen: [{ question: '6.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.4.1',
              text: 'Legemiddelnavn, styrke og form',
              type: 'string',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                      },
                    },
                  ],
                  linkId: '6.4.1.1',
                  text: 'For eksempel Paracet 500mg tablett',
                  type: 'text',
                  required: false,
                  repeats: false,
                  readOnly: false,
                },
              ],
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.4.2',
              text: 'Reaksjon',
              type: 'string',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '6.5',
          text: 'Er du allergisk mot noen matvarer, pollen, lateks, nikkel eller annet?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/repeatstext', valueString: 'Legg til en allergi til' },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-maxOccurs', valueInteger: 20 },
            { url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-minOccurs', valueInteger: 1 },
          ],
          linkId: '6.6',
          text: 'Allergi',
          type: 'group',
          enableWhen: [{ question: '6.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.6.1',
              text: 'Hva er du allergisk mot?',
              type: 'string',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Du må fylle ut dette feltet' },
                { url: 'http://hl7.org/fhir/StructureDefinition/regex', valueString: '^[æøåÆØÅa-zA-Z0-9,.!?@()+\\-\\/* ]*$' },
              ],
              linkId: '6.6.2',
              text: 'Reaksjon',
              type: 'choice',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
              answerValueSet: '#Reaksjon',
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }],
                      },
                    },
                  ],
                  linkId: '6.6.2.1',
                  text: 'Mild: lette plager som lett utslett, kløende øyne og rennende nese, \r\nModerat: hoste, tung pust, magesmerter -diare\r\nAlvorlig: alvorlige pusteproblemer og eller blodtrykksfall som krevede akutt legetilsyn eller sykehusinnleggelse (har forskrevet epi-penn)',
                  _text: {
                    extension: [
                      {
                        url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                        valueMarkdown:
                          '**Mild:** lette plager som lett utslett, kløende øyne og rennende nese.  \n**Moderat:** hoste, tung pust, magesmerter -diare.  \n**Alvorlig:** alvorlige pusteproblemer og eller blodtrykksfall som krevede akutt legetilsyn eller sykehusinnleggelse (har forskrevet epi-penn).',
                      },
                    ],
                  },
                  type: 'text',
                  required: false,
                  repeats: false,
                  readOnly: false,
                },
              ],
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '6.7',
          text: 'Har du tidligere reagert på kontrastmiddel i forbindelse med radiologiske undersøkelser?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1102',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '6.7.1',
              text: 'Reaksjon',
              type: 'string',
              enableWhen: [{ question: '6.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
      ],
    },
    {
      linkId: '7',
      text: 'Mat, livsstil og dagligliv',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.1',
          text: 'Trenger du en spesiell type mat?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '7.1.1',
              text: 'Her spør vi for å kartlegge om du ønsker halal, koscher, vegetar, vegankost eller liknende, for å kunne bestille dette til deg på forhånd.',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown:
                      'Her spør vi for å kartlegge om du ønsker halal, kosher, vegetar, vegankost eller liknende, for å kunne bestille dette til deg på forhånd.',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: '7.1.2',
              text: 'Velg kost',
              type: 'choice',
              enableWhen: [{ question: '7.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#Kost',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 500 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '519a5401-08ce-4fc0-8924-7bfff739030a',
                  text: 'Hvilken annen spesialkost?',
                  type: 'string',
                  enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '99' } }],
                  required: true,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.6',
          text: 'Har du problemer med å dusje, kle på deg og utføre daglige gjøremål selv?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '7.6.1',
              text: 'Hva trenger du hjelp til? Bruker du hjelpemidler? Har du en personlig assistent?',
              type: 'text',
              enableWhen: [{ question: '7.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.7',
          text: 'Har du problemer med å se, høre eller snakke som vi bør ta hensyn til?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '7.7.1',
              text: 'Beskriv',
              type: 'text',
              enableWhen: [{ question: '7.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.2',
          text: 'Hvor ofte røyker du?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#Levevaner',
          item: [
            {
              extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
              linkId: '7.2.1',
              text: 'Har du røkt tidligere?',
              type: 'choice',
              enableWhen: [{ question: '7.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#1101',
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.3',
          text: 'Hvor ofte snuser du?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#Levevaner',
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.4',
          text: 'Hvor ofte drikker du alkohol?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#Levevaner',
          item: [
            {
              extension: [
                { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 1 },
                { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 160 },
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Legg inn en verdi mellom 1 og 160. Bare tall aksepteres.',
                },
                {
                  url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel',
                  valueMarkdown: '_En enhet tilsvarer omtrent en flaske pils, ett glass vin eller en drink_',
                },
              ],
              linkId: '96d44b9b-8849-476e-bb44-ca154d62030f',
              text: 'Hvor mange enheter daglig?',
              type: 'integer',
              enableWhen: [{ question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } }],
              required: true,
            },
            {
              extension: [
                { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 1 },
                { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 160 },
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString: 'Legg inn en verdi mellom 1 og 160. Bare tall aksepteres.',
                },
                {
                  url: 'http://helsenorge.no/fhir/StructureDefinition/sdf-sublabel',
                  valueMarkdown: '_En enhet tilsvarer omtrent en flaske pils, ett glass vin eller en drink_',
                },
              ],
              linkId: '298b7546-ba87-4a02-b9e9-153a749e87fb',
              text: 'Hvor mange enheter ukentlig?',
              type: 'integer',
              enableWhen: [{ question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } }],
              required: true,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '7.5',
          text: 'Bruker du andre rusmidler?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '7.5.1',
              text: 'Vi spør om dette fordi det kan påvirke hvordan du reagerer på bedøvelse, smertestillende og andre medisiner. Sykehuset melder ikke til politiet om du svarer ja på spørsmål om bruk av ulovlige rusmidler.',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '51774493-4380-49f7-b73f-3b54e4dd56f9',
              text: 'Beskriv type og hyppighet',
              type: 'string',
              enableWhen: [{ question: '7.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              required: false,
              maxLength: 250,
            },
          ],
        },
      ],
    },
    {
      linkId: '7ff851e8-adb7-425a-82d5-5b89c6024503',
      text: 'Dagligliv',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: 'bdd9d2a1-b62b-4493-d459-6632fd9ad474',
          text: 'Trenger du en spesiell type mat?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: 'deeeb92d-061a-4b6c-9ec9-d1e7b0aca084',
              text: 'Her spør vi for å kartlegge om du ønsker halal, koscher, vegetar, vegankost eller liknende, for å kunne bestille dette til deg på forhånd.',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown:
                      'Her spør vi for å kartlegge om du ønsker halal, kosher, vegetar, vegankost eller liknende, for å kunne bestille dette til deg på forhånd.',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'check-box' }],
                  },
                },
              ],
              linkId: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              text: 'Velg kost',
              type: 'choice',
              enableWhen: [
                {
                  question: 'bdd9d2a1-b62b-4493-d459-6632fd9ad474',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              answerValueSet: '#Kost',
              item: [
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: '0819114f-cfd8-4167-8176-74d320e3fa3c',
                  text: 'Hva slags spesialkost?',
                  type: 'string',
                  enableWhen: [
                    {
                      question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
                      operator: '=',
                      answerCoding: { system: 'http://ehelse.no/Kost', code: '99' },
                    },
                  ],
                  required: true,
                  repeats: true,
                  readOnly: false,
                  maxLength: 250,
                },
                {
                  extension: [
                    {
                      url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                      valueString:
                        'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/regex',
                      valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                    },
                  ],
                  linkId: 'c256542a-963f-484a-8c60-9ca4355d8b37',
                  text: 'Hva slags matallergi?',
                  type: 'string',
                  enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '98' } }],
                  required: true,
                  repeats: true,
                  readOnly: false,
                  maxLength: 250,
                },
              ],
            },
          ],
        },
        {
          linkId: '39300f91-31b3-438f-86ee-5620a00306ec',
          text: 'Har du behov for hjelpemidler?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '4618d955-3bd0-4bac-fd78-012ebf24ff7d',
              text: 'Hvilke hjelpemidler?',
              type: 'string',
              enableWhen: [
                {
                  question: '39300f91-31b3-438f-86ee-5620a00306ec',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: true,
              readOnly: false,
              maxLength: 250,
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: 'aa5631cb-71e9-4def-8fb8-68bc8e71b2d5',
              _text: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueMarkdown: 'For eksempel pustestøtte eller rullestol.',
                  },
                ],
              },
              type: 'text',
              required: false,
              repeats: false,
              readOnly: true,
              maxLength: 250,
            },
          ],
        },
        {
          linkId: '19d904db-6331-440e-8555-135152f8b685',
          text: 'Går du i barnehage eller på skole?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '3ffb1035-a3af-48c1-8150-c1a24af26081',
              text: 'Skriv inn navn på barnehage eller skole',
              type: 'string',
              enableWhen: [
                {
                  question: '19d904db-6331-440e-8555-135152f8b685',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: false,
              maxLength: 250,
            },
          ],
        },
      ],
    },
    {
      linkId: '8',
      text: 'Høyde og vekt',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Oppgi høyde i centimeter' },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 250 },
            { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 0 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://unitsofmeasure.org', code: 'cm', display: 'centimeter' },
            },
          ],
          linkId: '8.1',
          text: 'Høyde',
          type: 'quantity',
          required: true,
          repeats: false,
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Oppgi vekt i kilo' },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 750 },
            { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 0 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kilo' },
            },
          ],
          linkId: '8.2',
          text: 'Vekt',
          type: 'quantity',
          required: true,
          repeats: false,
          readOnly: false,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'score', display: '(KMI)' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString:
                "QuestionnaireResponse.descendants().where(linkId='8.2').answer.value.value / ((QuestionnaireResponse.descendants().where(linkId='8.1').answer.value.value/10000) * QuestionnaireResponse.descendants().where(linkId='8.1').answer.value.value)",
            },
          ],
          linkId: '8.3',
          text: 'Kroppsmasseindeks',
          type: 'quantity',
          required: false,
          repeats: false,
          readOnly: true,
        },
      ],
    },
    {
      linkId: '732320dd-0b37-41f0-af69-331325e509d6',
      text: 'Høyde og vekt',
      type: 'group',
      enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
      repeats: false,
      item: [
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Oppgi høyde i centimeter' },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 250 },
            { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 0 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://unitsofmeasure.org', code: 'cm', display: 'centimeter' },
            },
          ],
          linkId: '8.4',
          text: 'Høyde',
          type: 'quantity',
          repeats: false,
          readOnly: false,
        },
        {
          extension: [
            { url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Oppgi vekt i kilo' },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxValue', valueInteger: 750 },
            { url: 'http://hl7.org/fhir/StructureDefinition/minValue', valueInteger: 0 },
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 0 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://unitsofmeasure.org', code: 'kg', display: 'kilo' },
            },
          ],
          linkId: '8.5',
          text: 'Vekt',
          type: 'quantity',
          repeats: false,
          readOnly: false,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'score', display: '(KMI)' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString:
                "QuestionnaireResponse.descendants().where(linkId='8.5').answer.value.value / ((QuestionnaireResponse.descendants().where(linkId='8.4').answer.value.value/10000) * QuestionnaireResponse.descendants().where(linkId='8.4').answer.value.value)",
            },
          ],
          linkId: '8.6',
          text: 'Kroppsmasseindeks',
          type: 'quantity',
          required: false,
          repeats: false,
          readOnly: true,
        },
      ],
    },
    {
      linkId: '9',
      text: 'Hvis du skal opereres eller undersøkes i narkose eller annen bedøvelse, ber vi om at du svarer på noen ekstra spørsmål.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
            valueMarkdown:
              '**Hvis du skal opereres eller undersøkes i narkose eller annen bedøvelse, ber vi om at du svarer på noen ekstra spørsmål.**',
          },
        ],
      },
      type: 'display',
    },
    {
      extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
      linkId: '10',
      text: 'Skal du opereres eller undersøkes i narkose eller annen bedøvelse?',
      type: 'choice',
      required: true,
      repeats: false,
      readOnly: false,
      answerValueSet: '#1102',
    },
    {
      linkId: '11',
      text: 'Før eventuell operasjon eller undersøkelse i narkose eller annen bedøvelse',
      type: 'group',
      enableWhen: [
        { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
        { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
      ],
      enableBehavior: 'any',
      repeats: false,
      item: [
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.1',
          text: 'Har du vært i narkose tidligere?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '11.1.1',
              text: 'Narkose er en bedøvelse (anestesi) som virker i hele kroppen. Du blir smertefri, sover og kroppen blir helt slapp. Vi bruker narkose dersom det av ulike årsaker ikke er mulig å gjennomføre operasjonen med lokalbedøvelse.',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'f9b66072-c02b-4370-df0d-52186ebba2d4',
              text: 'Ved hvilket sykehus/klinikk?',
              type: 'string',
              enableWhen: [
                { question: '4.1.3', operator: '<', answerInteger: 16 },
                { question: '11.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
              ],
              enableBehavior: 'all',
              required: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.2',
          text: 'Har du eller noen du er i slekt med reagert på narkose eller bedøvelse?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1102',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '11.2.1',
              text: 'Det å reagere uønsket på narkose eller bedøvelse kan være arvelig',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '11.2.2',
              text: 'Hvem har reagert, hva slags bedøvelse og hva slags reaksjon?',
              type: 'text',
              enableWhen: [{ question: '11.2', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.3',
          text: 'Har du problemer med å bevege kjeve eller nakke, eller med å gape?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '11.3.1',
              text: 'Beskriv hvordan:',
              type: 'text',
              enableWhen: [{ question: '11.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.5',
          text: 'Har du tenner som er reparerte eller løse (bro, gebiss, stift, implantater)?',
          type: 'choice',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'help' }] },
                },
              ],
              linkId: '11.5.1',
              text: 'Gjelder ikke fyllinger i egne tenner',
              type: 'text',
              required: false,
              repeats: false,
              readOnly: false,
            },
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 100 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '11.5.2',
              text: 'Beskriv hva:',
              type: 'text',
              enableWhen: [{ question: '11.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '5e449598-28c2-4729-9bd0-3f3dc070b0e8',
          text: 'Har du regulering, løse tenner eller tenner som er reparerte?',
          type: 'choice',
          enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'ce011f05-d447-46db-ddad-7f946b5f62b4',
              text: 'Beskriv hva:',
              type: 'text',
              enableWhen: [
                {
                  question: '5e449598-28c2-4729-9bd0-3f3dc070b0e8',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.4',
          text: 'Har du problemer med å ligge flatt på ryggen?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '11.4.1',
              text: 'Beskriv hvorfor:',
              type: 'string',
              enableWhen: [{ question: '11.4', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.6',
          text: 'Har du halsbrann, magesår, magekatarr, spiserørsbrokk, sure oppstøt eller lignende?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1102',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: 'b3fdcfca-03fc-4434-c6e2-c07ea7140830',
              text: 'Beskriv tilstanden:',
              type: 'string',
              enableWhen: [
                { question: '11.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
                { question: '11.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
              ],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.7',
          text: 'Har du sår eller utslett i huden nær operasjonsstedet?',
          type: 'choice',
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '616a52a9-1feb-4140-951b-5844a53ae735',
              text: 'Beskriv tilstanden:',
              type: 'string',
              enableWhen: [{ question: '11.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
              enableBehavior: 'any',
              required: true,
              repeats: false,
              readOnly: false,
              maxLength: 250,
            },
          ],
        },
        {
          extension: [{ url: 'http://ehelse.no/fhir/StructureDefinition/validationtext', valueString: 'Velg ett av alternativene.' }],
          linkId: '11.8',
          text: 'Det er anbefalt å ha en voksen person hos seg det første døgnet i hjemmet etter en operasjon. Har du en slik hjelper som kan være sammen med deg det første døgnet etter inngrepet/ undersøkelsen?',
          type: 'choice',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: true,
          repeats: false,
          readOnly: false,
          answerValueSet: '#1101',
        },
      ],
    },
    {
      linkId: '4c6bfc80-fd33-4889-8a56-194dba31de10',
      text: 'Spørsmål til timeavtalen',
      type: 'group',
      required: false,
      item: [
        {
          linkId: '06a6ef90-10de-4ec4-9561-a2bca01933e4',
          text: 'Trenger du tolk?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
          item: [
            {
              extension: [
                {
                  url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
                  valueString:
                    'Fyll ut feltet med minimum 1 tegn og maksimum 250 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
                },
              ],
              linkId: '41f29e51-d17a-4663-a4b1-5b6c698a12a3',
              text: 'Hvilket språk?',
              type: 'string',
              enableWhen: [
                {
                  question: '06a6ef90-10de-4ec4-9561-a2bca01933e4',
                  operator: '=',
                  answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
                },
              ],
              required: true,
              maxLength: 250,
            },
          ],
        },
        {
          linkId: '7e3cfede-16a6-4475-9e06-c14de67c8b0d',
          text: 'Kan du komme til time på kort varsel?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
      ],
    },
    {
      linkId: '96fe5f6e-e804-4553-8442-d5aaefa0f647',
      text: 'Hjelp oss å hindre smitte',
      type: 'group',
      required: false,
      item: [
        {
          linkId: 'eab51662-f833-40f5-cc83-60c9feb38ee3',
          text: 'For å gi deg og andre pasienter i sykehuset trygg behandling, må du teste deg for motstandsdyktige (resistente) bakterier dersom du svarer ja på ett eller flere av punktene under.',
          type: 'display',
          required: false,
        },
        {
          linkId: '930d154a-9248-40d1-bf24-27bc601071ff',
          text: 'Har du i løpet av de siste 12 måneder:',
          type: 'display',
          required: false,
        },
        {
          linkId: '26ae8b51-f73e-4e77-85a3-1dd8f9aeef04',
          text: 'Vært smittet av eller bodd i samme husstand som en person som har vært smittet av resistente bakterier (MRSA, VRE eller ESBL)?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: 'a5b41ecc-c840-4446-b616-fc00ae4b275b',
          text: 'Arbeidet som helsearbeider eller vært innlagt i sykehus eller annen helseinstitusjon utenfor Norden?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: '9f257d1d-718d-4dc1-859f-a93b596ebd9d',
          text: 'Fått omfattende undersøkelse, behandling, injeksjoner eller tannbehandling i en helsetjeneste utenfor Norden?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: '6a5ec8b0-8504-48c1-ad19-1d64255dda5e',
          text: 'Oppholdt deg i flyktningleir eller barnehjem utenfor Norden?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: '130c51fd-3a5a-4ee6-8c0f-b0c155c68fda',
          text: 'Oppholdt deg sammenhengende i mer enn 6 uker utenfor Norden og du i tillegg har kronisk eksem, sår eller hudinfeksjon?',
          type: 'choice',
          required: true,
          answerValueSet: '#1101',
        },
        {
          linkId: '348fcd5a-b8e4-45e5-9494-464027fc9895',
          text: 'Test deg for resistente bakterier hos fastlegen. Du må teste deg i god tid før oppmøte på sykehuset. Testen er gratis.  Kontakt sykehuset hvis du er usikker på om du trenger å teste deg. Ring oss så fort som mulig hvis du vet at du selv eller noen du bor sammen med, har eller har hatt resistente bakterier.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Test deg for resistente bakterier hos fastlegen. Du må teste deg i god tid før oppmøte på sykehuset. Testen er gratis. \n\nKontakt sykehuset hvis du er usikker på om du trenger å teste deg.\n\n**Ring oss så fort som mulig hvis du vet at du selv eller noen du bor sammen med, har eller har hatt resistente bakterier.**',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '26ae8b51-f73e-4e77-85a3-1dd8f9aeef04',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'a5b41ecc-c840-4446-b616-fc00ae4b275b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '9f257d1d-718d-4dc1-859f-a93b596ebd9d',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '6a5ec8b0-8504-48c1-ad19-1d64255dda5e',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '130c51fd-3a5a-4ee6-8c0f-b0c155c68fda',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
      ],
    },
    {
      extension: [
        {
          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
          valueString:
            'Fyll ut feltet med minimum 1 tegn og maksimum 1000 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
        },
      ],
      linkId: '12',
      text: 'Er det noe annet vi bør vite for å kunne gi deg god behandling?',
      type: 'text',
      enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
      required: false,
      repeats: false,
      readOnly: false,
      maxLength: 1000,
    },
    {
      extension: [
        {
          url: 'http://ehelse.no/fhir/StructureDefinition/validationtext',
          valueString:
            'Fyll ut feltet med minimum 1 tegn og maksimum 1000 tegn. Skriv kun norske bokstaver og tall. Spesialtegn og tegn på andre språk er ikke mulig.',
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: '^(?:[æøåÆØÅëËäÄöÖáÁéÉóÓàÀèÈòÒa-zA-Z0-9,.!?()+\\-\\/:"\']|[ \\r\\n\\t])*$',
        },
      ],
      linkId: 'cde2bd0b-87bb-4f42-95fb-a790042d30e8',
      text: 'Er det noe du gruer deg spesielt til, eller noe annet vi bør vite for å kunne gi deg god behandling?',
      type: 'text',
      enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
      required: false,
      repeats: false,
      readOnly: false,
      maxLength: 1000,
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'summary' }] },
        },
      ],
      linkId: '13',
      text: 'Oppsummering',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: '13.1',
          text: 'Dette er en forenklet oppstilling av svarene dine.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Dette er en forenklet oppstilling av svarene dine.**',
              },
            ],
          },
          type: 'display',
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'score', display: '(KMI)' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString:
                "QuestionnaireResponse.descendants().where(linkId='8.2').answer.value.value / ((QuestionnaireResponse.descendants().where(linkId='8.1').answer.value.value/10000) * QuestionnaireResponse.descendants().where(linkId='8.1').answer.value.value)",
            },
          ],
          linkId: '13.4',
          text: 'Kroppsmasseindeks',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'score', display: '(KMI)' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString:
                "QuestionnaireResponse.descendants().where(linkId='8.5').answer.value.value / ((QuestionnaireResponse.descendants().where(linkId='8.4').answer.value.value/10000) * QuestionnaireResponse.descendants().where(linkId='8.4').answer.value.value)",
            },
          ],
          linkId: 'ac044d09-ffd3-4d3c-832c-502736a8e6ec',
          text: 'Kroppsmasseindeks',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'cm', display: 'cm' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='8.1').answer.value.value",
            },
          ],
          linkId: '037d1c57-dd30-4f5b-86c4-b6bd67b9e9db',
          text: 'Høyde',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'cm', display: 'cm' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='8.4').answer.value.value",
            },
          ],
          linkId: 'bedfdd82-e32e-4c17-b4e2-06206b7e1f6e',
          text: 'Høyde',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='8.2').answer.value.value",
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'kg', display: 'kg' },
            },
          ],
          linkId: '93a9beb9-6268-44ff-8db5-c37219350684',
          text: 'Vekt',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '>=', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          extension: [
            { url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces', valueInteger: 2 },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: { system: 'http://ehelse.no/Score', code: 'kg', display: 'kg' },
            },
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='8.5').answer.value.value",
            },
          ],
          linkId: '51fdcdd0-c423-4851-f1d9-45b100ce9f1c',
          text: 'Vekt',
          type: 'quantity',
          enableWhen: [{ question: '4.1.3', operator: '<', answerInteger: 16 }],
          required: false,
          repeats: false,
          readOnly: true,
        },
        {
          linkId: '13.5',
          text: 'Har eneansvar for barn under 18 år eller andre med spesielle behov',
          type: 'display',
          enableWhen: [{ question: '4.4.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.6',
          text: 'Har en eller flere arbeidsgivere',
          type: 'display',
          enableWhen: [{ question: '4.5.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.7',
          text: 'Helse',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Helse**' }] },
          type: 'display',
          enableWhen: [
            {
              question: '3c855cc8-1c92-4399-fbeb-c47d1f7f60c8',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '45dd2dfc-fa5e-45aa-8439-5177ba6451f2',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '69835343-423f-4022-8e60-7e5a93516c1f',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'd727a93c-da5a-4636-f99e-f80b83a342fb',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '870ca577-125a-4d75-8473-70328ea16432',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'b188d3ca-677a-4961-864d-951bae2057fa',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '32d1825b-1593-4f6f-e99e-d8f23d5d12d9',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'b13ddc1a-d6f3-4f22-e0b8-3d69b0cf78ee',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '347e9839-291a-43d7-c640-7d6480af423a',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '32b090b0-3be1-4197-8601-d1142e22079f',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '2d617e01-0555-499e-8817-9bdfb202bb28',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '9741cd16-73a6-45ba-e193-34e6076cc183',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '7f03eb20-b5b8-4577-f81a-2d725886e389',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '66b2ae92-8389-4f01-8630-20a67be643ed',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'dbf67538-3da4-4dab-91d3-eed72726dfd9',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '8fd3f7b0-6404-466f-8784-d11166bd980b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'brystsmerter' },
            },
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'tungpustet' },
            },
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'kan-ikke-gå-i-trapper' },
            },
            { question: '5.14', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '5.15', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            {
              question: '559583f9-275a-47b4-8412-8cba9972c70e',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '587d60ed-e59c-49e6-8e53-5813b4c9cbb6',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'e5cd2d99-5301-4d5e-8ba5-ac157e12d9a6',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: 'aa63605c-3a85-4927-dab4-793170089a8c',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '8aa5477f-c313-49aa-a1c4-4c928a2618ef',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '19cee86d-9e1e-445e-8490-b6ddd6773217',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '8c55bf2b-9218-4bec-fef4-eafed1294ab3',
          text: 'Hjerte-karsykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Hjerte-karsykdom**' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '3c855cc8-1c92-4399-fbeb-c47d1f7f60c8',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '73b9a6ea-1731-46cc-e246-1199cea0ee9c',
          text: 'Angina pectoris (hjertekrampe)',
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'angina-pectoris-(hjertekrampe)' },
            },
          ],
          required: false,
        },
        {
          linkId: 'f8507025-77f9-4422-8df9-5c4dc6ad8bf2',
          text: 'Hjertesvikt',
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'hjertesvikt' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ec58449a-4aac-4324-a087-61dea1c628a0',
          text: 'Rytmeforstyrrelse (atrieflimmer)',
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'rytmeforstyrrelse-(atrieflimmer)' },
            },
          ],
          required: false,
        },
        {
          linkId: '66a1e193-a258-4f50-811e-bad58be1c5f1',
          text: 'Klaffefeil',
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'klaffefeil' },
            },
          ],
          required: false,
        },
        {
          linkId: '30fd0847-7d25-4faf-8c8e-38432ba22eab',
          text: 'Hjerteoperert',
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'hjerteoperert' },
            },
          ],
          required: false,
        },
        {
          linkId: 'a17a112b-86ed-46d3-cc31-29dabd491322',
          text: 'Annen hjerte- og karsykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Annen hjerte- og karsykdom' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: 'c0a1c440-dfa4-4308-8248-fbff575a5d9a',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9937ba45-16c3-46eb-a15c-f0e2763a47be', code: 'annen-hjerte--og-karsykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'd974caff-4f45-4e10-8225-840a0f455d2e',
          text: 'Utblokking av kransårene i hjertet (PCI)',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Utblokking av kransårene i hjertet (PCI)',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '2c0f5806-6277-4f30-897c-155f84d04457',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '337fac5f-6de5-4b5b-fc08-2f0b3672d216',
          text: 'Åpen hjerteoperasjon på hjertets kransårer (bypassoperasjon)',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Åpen hjerteoperasjon på hjertets kransårer (bypassoperasjon)',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: 'f89e8a48-ee59-46b9-93ee-e4567d0142b0',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '7a62decf-92db-4462-d3e3-cb8568c3359b',
          text: 'Hjerteklaffoperasjon',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Hjerteklaffoperasjon' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '66680c89-c2fc-4edb-8434-5a9cdfc515b4',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '13.9',
          text: 'Pacemaker',
          type: 'display',
          enableWhen: [{ question: '5.1.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: 'a9881c50-d549-4259-8201-8852c30f2ad9',
          text: 'Høyt blodtrykk (hypertensjon)',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Høyt blodtrykk (hypertensjon)**' },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '45dd2dfc-fa5e-45aa-8439-5177ba6451f2',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '8f3e95ea-c8b6-4f14-87db-f01f55d779c0',
          text: 'Blodtrykket er ikke velkontrollert med medisiner',
          type: 'display',
          enableWhen: [
            {
              question: 'ed30475e-45ab-4041-8265-022fbe39ac70',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '2' },
            },
          ],
          required: false,
        },
        {
          linkId: '4a02a692-d70b-49c7-8363-ae12a4366f66',
          text: 'Økt blødningstendens eller bruker du blodfortynnende medisiner',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Økt blødningstendens eller bruker du blodfortynnende medisiner**',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '69835343-423f-4022-8e60-7e5a93516c1f',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'b9c5fd44-2c8f-4d64-895b-248ddb554657',
          text: 'Blodfortynnende medisiner',
          type: 'display',
          enableWhen: [
            {
              question: '8a1d7b4f-32c0-402e-dc4c-617844e9243f',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8', code: 'blodfortynnende-medisiner' },
            },
          ],
          required: false,
        },
        {
          linkId: '898c7443-f55b-4fdf-a09a-dca3f86f363b',
          text: 'Blødersykdom eller andre koagulasjonsforstyrrelser (forstyrrelser i blodets levringsevne)',
          type: 'display',
          enableWhen: [
            {
              question: '8a1d7b4f-32c0-402e-dc4c-617844e9243f',
              operator: '=',
              answerCoding: {
                system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8',
                code: 'blødersykdom-eller-andre-koagulasjonsforstyrrelser-(forstyrrelser-i-blodets-levringsevne)',
              },
            },
          ],
          required: false,
        },
        {
          linkId: 'c116f276-5db3-4eb6-8023-9117b21f86e3',
          text: 'Annen blødningstendens',
          type: 'display',
          enableWhen: [
            {
              question: '8a1d7b4f-32c0-402e-dc4c-617844e9243f',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9a6e80b1-207d-4ec0-c437-3dc5c98723d8', code: 'annen-blødningstendens' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ddc5779a-2592-42af-8115-2caf945e42b4',
          text: 'Lungesykdom',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Lungesykdom**' }] },
          type: 'display',
          enableWhen: [
            {
              question: 'd727a93c-da5a-4636-f99e-f80b83a342fb',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'b6b6fc0a-5cc6-4b31-9a1b-4543457789ab',
          text: 'Astma',
          type: 'display',
          enableWhen: [
            {
              question: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2', code: 'astma' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '769b17eb-2423-4e05-89f2-e9d828378bdd',
          text: 'KOLS',
          type: 'display',
          enableWhen: [
            {
              question: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2', code: 'kols' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'b71875b1-4cc9-43da-9852-f63a7d1178ce',
          text: 'Lungefibrose',
          type: 'display',
          enableWhen: [
            {
              question: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2', code: 'lungefibrose' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '325cb6d9-14dd-421f-a228-21f978c9d4a7',
          text: 'Annen lungesykdom',
          type: 'display',
          enableWhen: [
            {
              question: '937d0a30-fe39-4e72-88c2-86d7e26b8c6c',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1d00ec53-c765-430e-bba9-2927d2992fc2', code: 'annen-lungesykdom' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '52aeec2b-5bed-4c15-bb41-747ec1c737ab',
          text: 'Bruker oksygen hjemme',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Bruker oksygen hjemme' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '7110533c-25ac-43e8-99c3-75e3b137d2a3',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '16ef29b4-722f-4672-a667-903829f5fd7f',
          text: 'Søvnapné',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Søvnapné**' }] },
          type: 'display',
          enableWhen: [
            {
              question: '870ca577-125a-4d75-8473-70328ea16432',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'adf845b7-5a14-49f9-fb98-21743480c183',
          text: 'Bruker pustemaske ved søvn',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Bruker pustemaske ved søvn' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: 'ee8c92a2-e5ec-4d86-840b-6c50c05a471e',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '91b3c298-e982-4755-90cd-3b2945fc9c16',
          text: 'Nevrologisk sykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Nevrologisk sykdom**' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: 'b188d3ca-677a-4961-864d-951bae2057fa',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '59b0a18e-4a3c-4beb-8d82-6c1f5865d604',
          text: 'Parkinsons sykdom',
          type: 'display',
          enableWhen: [
            {
              question: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342', code: 'parkinsons-sykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'f664c38e-64ce-4c65-9043-0d8c69c9a061',
          text: 'Multippel sklerose (MS)',
          type: 'display',
          enableWhen: [
            {
              question: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342', code: 'multippel-sklerose-(ms)' },
            },
          ],
          required: false,
        },
        {
          linkId: 'c8d866f2-5419-4e13-8e54-12829202076b',
          text: 'Migrene',
          type: 'display',
          enableWhen: [
            {
              question: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342', code: 'migrene' },
            },
          ],
          required: false,
        },
        {
          linkId: '03170b38-3879-4923-8ed9-aa6e48361662',
          text: 'Annen nevrologisk sykdom',
          type: 'display',
          enableWhen: [
            {
              question: 'b58bc134-89a5-49dd-8381-9192bbef3d7d',
              operator: '=',
              answerCoding: { system: 'urn:uuid:1cd0dfb7-7361-4d13-9fe3-7453e0912342', code: 'annen-nevrologisk-sykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'c6bd59ad-ed72-4754-8086-15c8248570f2',
          text: 'Nyresykdom',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Nyresykdom**' }] },
          type: 'display',
          enableWhen: [
            {
              question: '32d1825b-1593-4f6f-e99e-d8f23d5d12d9',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '7adfd5ef-1589-4b33-89be-a55591598b41',
          text: 'Nyresvikt',
          type: 'display',
          enableWhen: [
            {
              question: 'f85095a9-80a4-46e5-8911-792b28a58b24',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0', code: 'nyresvikt' },
            },
          ],
          required: false,
        },
        {
          linkId: '87942c3b-f1b3-454e-86bc-381010757e50',
          text: 'Nyrestein',
          type: 'display',
          enableWhen: [
            {
              question: 'f85095a9-80a4-46e5-8911-792b28a58b24',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0', code: 'nyrestein' },
            },
          ],
          required: false,
        },
        {
          linkId: 'f67a5144-9a95-4e1e-8687-2e7192ceca2a',
          text: 'Annen nyresykdom',
          type: 'display',
          enableWhen: [
            {
              question: 'f85095a9-80a4-46e5-8911-792b28a58b24',
              operator: '=',
              answerCoding: { system: 'urn:uuid:9956e6e0-58d1-48ed-bd32-23e5378925b0', code: 'annen-nyresykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'cfd8dda8-2601-4e8e-81de-e6c5fbbe7f2b',
          text: 'Leversykdom',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Leversykdom**' }] },
          type: 'display',
          enableWhen: [
            {
              question: 'b13ddc1a-d6f3-4f22-e0b8-3d69b0cf78ee',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '79aa7409-fcf7-470a-8868-037cddc7be28',
          text: 'Skrumplever/fettlever',
          type: 'display',
          enableWhen: [
            {
              question: '645a725a-bb7e-4fcb-9f7c-054c8b3e4348',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697', code: 'skrumplever/fettlever' },
            },
          ],
          required: false,
        },
        {
          linkId: '0b8bd330-6770-4e53-e10a-6197aa83255a',
          text: 'Leversvikt',
          type: 'display',
          enableWhen: [
            {
              question: '645a725a-bb7e-4fcb-9f7c-054c8b3e4348',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697', code: 'leversvikt' },
            },
          ],
          required: false,
        },
        {
          linkId: 'd2a4c9b5-de9b-4b96-8a17-e3b8066b3b87',
          text: 'Annen leversykdom',
          type: 'display',
          enableWhen: [
            {
              question: '645a725a-bb7e-4fcb-9f7c-054c8b3e4348',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ef7cc783-bbce-4142-82d3-3e546efef697', code: 'annen-leversykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'e7430cde-437c-4075-c107-2aec898c49a5',
          text: 'Diabetes',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Diabetes**' }] },
          type: 'display',
          enableWhen: [
            {
              question: '347e9839-291a-43d7-c640-7d6480af423a',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '1bbfc7a2-5173-43da-8882-df0ef7985031',
          text: 'Diabetes type 1',
          type: 'display',
          enableWhen: [
            {
              question: '08556ec1-992f-457d-8083-95e5814845ac',
              operator: '=',
              answerCoding: { system: 'urn:uuid:b3031217-152e-4282-8b69-c73516d04191', code: 'diabetes-type-1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'a30dcb98-e648-4f9b-d328-6fd9cc58a79d',
          text: 'Diabetes type 2',
          type: 'display',
          enableWhen: [
            {
              question: '08556ec1-992f-457d-8083-95e5814845ac',
              operator: '=',
              answerCoding: { system: 'urn:uuid:b3031217-152e-4282-8b69-c73516d04191', code: 'diabetes-type-2' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '5b139562-1a56-41e0-a06b-03be70308fc3',
          text: 'Stoffskiftesykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Stoffskiftesykdom**' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '32b090b0-3be1-4197-8601-d1142e22079f',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '13.18',
          text: 'Høyt stoffskifte (hypertyreose)',
          type: 'display',
          enableWhen: [
            {
              question: '4eebac0c-5064-4f70-e18c-113116e201e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098', code: 'høyt-stoffskifte-(hypertyreose)' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '5010d26b-31a6-4822-8e8d-6870aad786e2',
          text: 'Lavt stoffskifte (hypotyreose)',
          type: 'display',
          enableWhen: [
            {
              question: '4eebac0c-5064-4f70-e18c-113116e201e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098', code: 'lavt-stoffskifte-(hypotyreose)' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'd858fbd4-97c9-4b3c-80b8-cb5480176325',
          text: 'Binyrebarksvikt (Addisons sykdom)',
          type: 'display',
          enableWhen: [
            {
              question: '4eebac0c-5064-4f70-e18c-113116e201e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098', code: 'binyrebarksvikt-(addisons-sykdom)' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '28b1d055-c6b8-43c3-86b8-6f98425714cb',
          text: 'Annen stoffskiftesykdom',
          type: 'display',
          enableWhen: [
            {
              question: '4eebac0c-5064-4f70-e18c-113116e201e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:e527a017-0af5-421e-c95d-52f030823098', code: 'annen-stoffskiftesykdom' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'c2c33634-46b0-4155-d2be-ba0fec57576b',
          text: 'Leddgikt eller muskel-skjelettsykdom',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Leddgikt eller muskel-skjelettsykdom**',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '2d617e01-0555-499e-8817-9bdfb202bb28',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '9065f990-6d58-4287-9408-9637c380c68c',
          text: 'Arvelig muskelsykdom',
          type: 'display',
          enableWhen: [
            {
              question: '1db1edac-d501-407c-828e-f8a29b59f481',
              operator: '=',
              answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'arvelig-muskelsykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ad2621e3-8c67-4b0d-9e62-590850a95cf7',
          text: 'Leddgikt/RA',
          type: 'display',
          enableWhen: [
            {
              question: '1db1edac-d501-407c-828e-f8a29b59f481',
              operator: '=',
              answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'leddgikt/ra' },
            },
          ],
          required: false,
        },
        {
          linkId: '3bb22f84-bb07-4638-bb9c-902dad1cbc40',
          text: 'Psoriasisartritt',
          type: 'display',
          enableWhen: [
            {
              question: '1db1edac-d501-407c-828e-f8a29b59f481',
              operator: '=',
              answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'psoriasisartritt' },
            },
          ],
          required: false,
        },
        {
          linkId: '6393d4cc-149e-48dd-84e9-f8c1a1181955',
          text: 'ME/fibromyalgi',
          type: 'display',
          enableWhen: [
            {
              question: '1db1edac-d501-407c-828e-f8a29b59f481',
              operator: '=',
              answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'me/fibromyalgi' },
            },
          ],
          required: false,
        },
        {
          linkId: 'af77c0a9-be77-4ccc-ed6a-4aa9fc868d42',
          text: 'Annen muskel/skjelettsykdom',
          type: 'display',
          enableWhen: [
            {
              question: '1db1edac-d501-407c-828e-f8a29b59f481',
              operator: '=',
              answerCoding: { system: 'urn:uuid:736e86b3-ab3b-458a-d627-8c4425f06718', code: 'annen-muskel/skjelettsykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '0ff545c9-9e52-40ef-cb8f-a27695e9746b',
          text: 'Mage- eller tarmproblemer',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Mage- eller tarmproblemer**' },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '9741cd16-73a6-45ba-e193-34e6076cc183',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '682ec54a-7654-4c96-8cdf-8d5180b0a511',
          text: 'Irritabel tarmsyndrom (IBS)',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'irritabel-tarmsyndrom-(ibs)' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ecb2692e-b8d5-4390-87f3-81ed0c60de4a',
          text: 'Ulcerøs kolitt',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'ulcerøs-kolitt' },
            },
          ],
          required: false,
        },
        {
          linkId: '4ae60a3d-31f2-4ce1-8b8c-c0241c28efea',
          text: 'Crohns sykdom',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'crohns-sykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '73c02f77-8bd8-4025-8aab-28e78cb1dc9b',
          text: 'Magesår',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'magesår' },
            },
          ],
          required: false,
        },
        {
          linkId: '111ebe41-2be2-4cbc-f0de-b33071db2d3c',
          text: 'Sure oppstøt/refluks',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'sure-oppstøt/refluks' },
            },
          ],
          required: false,
        },
        {
          linkId: '546aa7dd-eb5e-4db0-8e19-a2b861cc8357',
          text: 'Annen mage eller tarmproblem',
          type: 'display',
          enableWhen: [
            {
              question: '667d12e9-6eed-4001-84f3-d7d1e53f7c49',
              operator: '=',
              answerCoding: { system: 'urn:uuid:ac6ec66a-36ee-4ad7-8a95-0f2581c7f6d4', code: 'annen-mage-eller-tarmproblem' },
            },
          ],
          required: false,
        },
        {
          linkId: '34bc88ce-0bb1-489e-8ed1-c9a6975c2ddf',
          text: 'Psykisk sykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Psykisk sykdom**' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '7f03eb20-b5b8-4577-f81a-2d725886e389',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '9fc47d45-deac-4bdf-f758-de62988dac48',
          text: 'Depresjon',
          type: 'display',
          enableWhen: [
            {
              question: '13665034-4d28-4e26-d07c-72de808610a8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d', code: 'depresjon' },
            },
          ],
          required: false,
        },
        {
          linkId: '5296eec7-f2fd-4f93-aafb-927ffff31f57',
          text: 'Angst',
          type: 'display',
          enableWhen: [
            {
              question: '13665034-4d28-4e26-d07c-72de808610a8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d', code: 'angst' },
            },
          ],
          required: false,
        },
        {
          linkId: '386f3ca9-1a6f-43f5-88a3-7511f018b0bc',
          text: 'ADHD',
          type: 'display',
          enableWhen: [
            {
              question: '13665034-4d28-4e26-d07c-72de808610a8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d', code: 'adhd' },
            },
          ],
          required: false,
        },
        {
          linkId: '573440bb-8e5f-473e-eb83-41c2f8c8c43d',
          text: 'Annen psykisk sykdom',
          type: 'display',
          enableWhen: [
            {
              question: '13665034-4d28-4e26-d07c-72de808610a8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:191dd210-dfbe-4d1d-832d-e2e571a00a8d', code: 'annen-psykisk-sykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '165d9718-54bd-4e0f-dc9d-c7985a056135',
          text: 'Smittsom sykdom',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Smittsom sykdom**' }],
          },
          type: 'display',
          enableWhen: [
            {
              question: '66b2ae92-8389-4f01-8630-20a67be643ed',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '5b5b99a8-d612-465f-8c12-b8c651e25ff1',
          text: 'Hepatitt',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'hepatitt' },
            },
          ],
          required: false,
        },
        {
          linkId: 'eb687677-c091-48ff-8881-a62bd43e9cc3',
          text: 'HIV',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'hiv' },
            },
          ],
          required: false,
        },
        {
          linkId: '0e9123ec-3de2-4c27-b434-a809ba1d52f6',
          text: 'MRSA',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'mrsa' },
            },
          ],
          required: false,
        },
        {
          linkId: '93f75929-a89c-45a0-db92-752af163e665',
          text: 'VRE',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'vre' },
            },
          ],
          required: false,
        },
        {
          linkId: '7b59b765-f121-4290-878e-ac531b488cf8',
          text: 'ESBL',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'esbl' },
            },
          ],
          required: false,
        },
        {
          linkId: 'f999e252-dc2a-4d87-8e94-0af0fb7e8d0e',
          text: 'Annen smittsom sykdom',
          type: 'display',
          enableWhen: [
            {
              question: 'a828079a-0f50-49cc-bd71-2e1e429de4e8',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'annen-smittsom-sykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '3b21404c-b765-4235-eda6-2f4edd6849e1',
          text: 'Kreft',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Kreft**' }] },
          type: 'display',
          enableWhen: [
            {
              question: 'dbf67538-3da4-4dab-91d3-eed72726dfd9',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '3874aa4f-95db-4e0b-8421-beebbc4f8ece',
          text: 'Aktiv kreftsykdom',
          type: 'display',
          enableWhen: [
            {
              question: '30c3b30e-2d40-4f74-b73f-ab828456c6bc',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'aktiv-kreftsykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '75dc0226-6e0d-4e7a-8649-ebeb980456c2',
          text: 'Ferdigbehandlet kreftsykdom',
          type: 'display',
          enableWhen: [
            {
              question: '30c3b30e-2d40-4f74-b73f-ab828456c6bc',
              operator: '=',
              answerCoding: { system: 'urn:uuid:56777958-d53e-423f-868e-efe5b3fc6706', code: 'ferdigbehandlet-kreftsykdom' },
            },
          ],
          required: false,
        },
        {
          linkId: '13.23',
          text: 'Annen sykdom',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Annen sykdom**' }] },
          type: 'display',
          enableWhen: [
            {
              question: '8fd3f7b0-6404-466f-8784-d11166bd980b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '11ac8d2f-2c29-4b90-f4ce-9e46c998fbcf',
          text: 'Annen sykdom er fylt ut',
          type: 'display',
          enableWhen: [
            {
              question: '8fd3f7b0-6404-466f-8784-d11166bd980b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            { question: '5.13.1', operator: 'exists', answerBoolean: true },
          ],
          enableBehavior: 'all',
        },
        {
          linkId: '5bb3d66e-f98f-4d40-8789-b2785544c7f1',
          text: 'Trappegang to etasjer i normalt tempo',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Trappegang to etasjer i normalt tempo**',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'brystsmerter' },
            },
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'tungpustet' },
            },
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'kan-ikke-gå-i-trapper' },
            },
          ],
          required: false,
        },
        {
          linkId: 'd397abc2-9400-46a3-e863-60746d0fe425',
          text: 'Brystsmerter ved trappegange',
          type: 'display',
          enableWhen: [
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'brystsmerter' },
            },
          ],
          required: false,
        },
        {
          linkId: '55ce80a3-c228-4e6b-f134-f82a6475e6a3',
          text: 'Tungpustet ved trappegange',
          type: 'display',
          enableWhen: [
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'tungpustet' },
            },
          ],
          required: false,
        },
        {
          linkId: '977b1b72-859c-45d9-87c8-091d25deb4f6',
          text: 'Kan ikke gå i trapper',
          type: 'display',
          enableWhen: [
            {
              question: '5.5',
              operator: '=',
              answerCoding: { system: 'urn:uuid:07956905-360a-428b-98c6-00b1772c3a80', code: 'kan-ikke-gå-i-trapper' },
            },
          ],
          required: false,
        },
        {
          linkId: '05580736-dcb9-4d37-8871-06813d8a9b59',
          text: 'Er gravid',
          type: 'display',
          enableWhen: [{ question: '5.14', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          required: false,
        },
        {
          linkId: '7656076f-aa19-44fd-8d01-a1b28341151e',
          text: 'Ammer',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Ammer' }] },
          type: 'display',
          enableWhen: [{ question: '5.15', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          required: false,
        },
        {
          linkId: 'eb6e53f7-b920-434c-cf26-6d994b366adc',
          text: 'Diabetes',
          type: 'display',
          enableWhen: [
            {
              question: '559583f9-275a-47b4-8412-8cba9972c70e',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.14',
          text: 'Nevrologiske sykdommer (for eksempel epilepsi)',
          type: 'display',
          enableWhen: [
            {
              question: '587d60ed-e59c-49e6-8e53-5813b4c9cbb6',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '08e3a021-04b0-4e17-8c5b-6e4402f760cb',
          text: 'Problemer med fordøyelsen',
          type: 'display',
          enableWhen: [
            {
              question: 'e5cd2d99-5301-4d5e-8ba5-ac157e12d9a6',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.12',
          text: 'Lungesykdom (for eksempel astma, cystisk fibrose eller søvnapné)',
          type: 'display',
          enableWhen: [
            {
              question: 'aa63605c-3a85-4927-dab4-793170089a8c',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'dbf290fe-b113-4887-8d32-5491194fa525',
          text: 'Bruker forstøver, pustemaske eller andre hjelpemidler',
          type: 'display',
          enableWhen: [
            {
              question: 'aeee391b-7890-47bf-8ae5-f90216d56cbb',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: 'acb721eb-1c8b-4124-bb90-96995cba9916',
          text: 'Medfødte sykdommer (for eksempel hjertefeil)',
          type: 'display',
          enableWhen: [
            {
              question: '8aa5477f-c313-49aa-a1c4-4c928a2618ef',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '194fda7f-e9e9-48ef-d3cb-bce1f7805ef4',
          text: 'Annen sykdom',
          type: 'display',
          enableWhen: [
            {
              question: '19cee86d-9e1e-445e-8490-b6ddd6773217',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '639d5cf7-3dd6-43be-863d-e6cd6d859427',
          text: 'Annen sykdom er fylt ut',
          type: 'display',
          enableWhen: [
            { question: '5743a72d-2641-47da-9f8e-bda82d996fdd', operator: 'exists', answerBoolean: true },
            {
              question: '19cee86d-9e1e-445e-8490-b6ddd6773217',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'all',
        },
        {
          linkId: '13.26',
          text: 'Medisiner og allergier',
          _text: {
            extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Medisiner og allergier**' }],
          },
          type: 'display',
          enableWhen: [
            { question: '6.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '6.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '6.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '6.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.27',
          text: 'Bruker medisiner',
          type: 'display',
          enableWhen: [
            { question: '6.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            {
              question: '0b923e48-3f69-4205-edb7-dcc9cb531eb4',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.28',
          text: 'Allergisk mot noen medisiner',
          type: 'display',
          enableWhen: [{ question: '6.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '87d6aca9-dbbd-4cf0-ecec-fa381c250b74',
          text: 'Allergisk mot noen matvarer, pollen, lateks, nikkel eller annet',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Allergisk mot noen matvarer, pollen, lateks, nikkel eller annet**',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '6.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          required: false,
        },
        {
          linkId: '13.29',
          text: 'Reaksjon: Mild',
          type: 'display',
          enableWhen: [{ question: '6.6.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Reaksjon', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '45d2e6cf-3d86-4ce1-d883-adeab9a45b87',
          text: 'Reaksjon: Moderat',
          type: 'display',
          enableWhen: [{ question: '6.6.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Reaksjon', code: '2' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '5ca3a218-1c3d-4dab-81ab-63238e1e7051',
          text: 'Reaksjon: Alvorlig',
          type: 'display',
          enableWhen: [{ question: '6.6.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Reaksjon', code: '3' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.30',
          text: 'Har reagert på røntgenkontrastmidler tidligere',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Har reagert på røntgenkontrastmidler tidligere',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '6.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.31',
          text: 'Mat, livsstil og dagligliv',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Mat, livsstil og dagligliv**' },
            ],
          },
          type: 'display',
          enableWhen: [
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '1' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '2' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '3' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '4' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '5' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '6' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '7' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '8' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '9' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '99' } },
            { question: '7.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '7.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '7.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } },
            { question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } },
            { question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } },
            { question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } },
            { question: '7.2.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '7.3', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } },
            { question: '7.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } },
            { question: '7.3', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } },
            { question: '7.3', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } },
            { question: '7.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '98' } },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.32',
          text: 'Kost: Diabeteskost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.33',
          text: 'Kost: Glutenfri kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '2' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.34',
          text: 'Kost: Halal kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '3' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.35',
          text: 'Kost: Kosher kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '4' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.36',
          text: 'Kost: Laktosefri kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '5' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.37',
          text: 'Kost: Melkeproteinfri kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '6' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.38',
          text: 'Kost: Saltredusert kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '7' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.39',
          text: 'Kost: Vegan kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '8' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.40',
          text: 'Kost: Vegetar kost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '9' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '7e044d86-822a-4a17-b487-29f357fc5be3',
          text: 'Kost: Matallergi',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '98' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.41',
          text: 'Kost: Annen spesialkost',
          type: 'display',
          enableWhen: [{ question: '7.1.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Kost', code: '99' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.42',
          text: 'Problemer med å dusje, kle på seg og gjøre daglige gjøremål selv',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Problemer med å dusje, kle på seg og gjøre daglige gjøremål selv',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '7.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.43',
          text: 'Problemer med å se, høre eller snakke',
          type: 'display',
          enableWhen: [{ question: '7.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.44',
          text: 'Røyker daglig',
          type: 'display',
          enableWhen: [{ question: '7.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.45',
          text: 'Røyker ukentlig',
          type: 'display',
          enableWhen: [{ question: '7.2', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.46',
          text: 'Røkt tidligere',
          type: 'display',
          enableWhen: [{ question: '7.2.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.47',
          text: 'Snuser daglig',
          type: 'display',
          enableWhen: [{ question: '7.3', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.48',
          text: 'Snuser ukentlig',
          type: 'display',
          enableWhen: [{ question: '7.3', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.50',
          text: 'Drikker alkohol ukentlig',
          type: 'display',
          enableWhen: [{ question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '3' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.49',
          text: 'Drikker alkohol daglig',
          type: 'display',
          enableWhen: [{ question: '7.4', operator: '=', answerCoding: { system: 'http://ehelse.no/Levevaner', code: '4' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.51',
          text: 'Rusmidler',
          type: 'display',
          enableWhen: [{ question: '7.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '554bc19f-f862-4633-9a83-57e48ead5b0d',
          text: '**Dagligliv**',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Dagligliv**' }] },
          type: 'display',
          enableWhen: [
            {
              question: 'bdd9d2a1-b62b-4493-d459-6632fd9ad474',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '39300f91-31b3-438f-86ee-5620a00306ec',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
            {
              question: '19d904db-6331-440e-8555-135152f8b685',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '7a7e7b17-546d-412e-81c3-bef6842144c3',
          text: 'Kost: Diabeteskost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '70777dd6-43c9-4095-9880-4b6d82becae3',
          text: 'Kost: Glutenfri kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '2' },
            },
          ],
          required: false,
        },
        {
          linkId: '585a552a-c557-4d04-820a-34bfa9414b5a',
          text: 'Kost: Halal kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '3' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ba32c5ef-1073-4682-eae5-bf15a5501d87',
          text: 'Kost: Kosher kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '4' },
            },
          ],
          required: false,
        },
        {
          linkId: 'd7715b5d-2429-415d-962f-542034533d69',
          text: 'Kost: Laktosefri kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '5' },
            },
          ],
          required: false,
        },
        {
          linkId: 'cf3dad08-a514-437d-aa70-18611da3f4ae',
          text: 'Kost: Melkeproteinfri kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '6' },
            },
          ],
          required: false,
        },
        {
          linkId: '5427474f-1d7c-439b-be42-51f45c40c28d',
          text: 'Kost: Saltredusert kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '7' },
            },
          ],
          required: false,
        },
        {
          linkId: '4d1e28a7-0ff0-4d56-fa1a-47aa92790f14',
          text: 'Kost: Vegan kost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '8' },
            },
          ],
          required: false,
        },
        {
          linkId: '4a7d622e-7f41-4be2-8815-bce6994e35bb',
          text: 'Kost: Matallergi',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '98' },
            },
          ],
          required: false,
        },
        {
          linkId: 'aa239d35-1d02-457a-c6a1-316740d4f7cf',
          text: 'Kost: Annen spesialkost',
          type: 'display',
          enableWhen: [
            {
              question: 'f1483959-d334-4c2a-82cb-4707cb95a824',
              operator: '=',
              answerCoding: { system: 'http://ehelse.no/Kost', code: '99' },
            },
          ],
          required: false,
        },
        {
          linkId: 'fd787e51-b70c-4b45-a47f-97cf286df57c',
          text: 'Behov for hjelpemidler',
          type: 'display',
          enableWhen: [
            {
              question: '39300f91-31b3-438f-86ee-5620a00306ec',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '899898f7-414e-41df-8138-80ac2753fc47',
          text: 'Går i barnehage eller på skole',
          type: 'display',
          enableWhen: [
            {
              question: '19d904db-6331-440e-8555-135152f8b685',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '13.52',
          text: 'Før eventuell operasjon eller undersøkelse i narkose',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: '**Før eventuell operasjon eller undersøkelse i narkose**',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
            { question: '11.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '11.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '2' } },
            { question: '11.2', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
            { question: '11.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '11.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '11.4', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '11.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
            { question: '11.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '11.8', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
            { question: '11.2', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
            { question: '11.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.53',
          text: 'Skal opereres eller undersøkes i narkose',
          type: 'display',
          enableWhen: [
            { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } },
            { question: '10', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '9' } },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.54',
          text: 'Vært i narkose tidligere',
          type: 'display',
          enableWhen: [{ question: '11.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.55',
          text: 'Ikke vært i narkose tidligere',
          type: 'display',
          enableWhen: [{ question: '11.1', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '2' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.56',
          text: 'Har reagert på narkose eller bedøvelse, eller noen i familien har reagert på narkose eller bedøvelse',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Har reagert på narkose eller bedøvelse, eller noen i familien har reagert på narkose eller bedøvelse',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '11.2', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.57',
          text: 'Problemer med å bevege kjeve eller nakke, eller med å gape',
          type: 'display',
          enableWhen: [{ question: '11.3', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.58',
          text: 'Tenner er reparerte eller løse',
          type: 'display',
          enableWhen: [
            { question: '11.5', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } },
            {
              question: '5e449598-28c2-4729-9bd0-3f3dc070b0e8',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          enableBehavior: 'any',
        },
        {
          linkId: '13.59',
          text: 'Problemer med å ligge flatt på ryggen',
          type: 'display',
          enableWhen: [{ question: '11.4', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '33d15647-83cb-4c8a-f203-468a32d37ae9',
          text: 'Har halsbrann, magesår, magekatarr, spiserørsbrokk, sure oppstøt eller lignende',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Har halsbrann, magesår, magekatarr, spiserørsbrokk, sure oppstøt eller lignende',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '11.6', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1102', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '13.61',
          text: 'Sår eller utslett i huden nær operasjonsstedet',
          type: 'display',
          enableWhen: [{ question: '11.7', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '4d0fc908-241c-446c-93f3-50de2047e103',
          text: 'Har ikke en voksen person som kan være sammen med seg det første døgnet etter inngrepet/undersøkelsen.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Har ikke en voksen person som kan være sammen med seg det første døgnet etter inngrepet/undersøkelsen.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '11.8', operator: '=', answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '2' } }],
          enableBehavior: 'any',
        },
        {
          linkId: 'c681e268-051f-4886-a85d-2f76dd13ef09',
          text: 'Skal til gynekologisk avdeling',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Skal til gynekologisk avdeling**' },
            ],
          },
          type: 'display',
          enableWhen: [
            {
              question: '55d16c5f-d0e6-4640-893f-764896ab3f0b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'a5a9bf0a-40a3-4641-9cc0-889bcad34d0f',
          text: 'Har vært gravid tidligere',
          type: 'display',
          enableWhen: [
            {
              question: '37cd2a60-1663-4cb0-98b6-e704379a1019',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '6c7ea88a-6590-4479-825f-8c7493974044',
          text: 'Har født ett eller flere barn',
          type: 'display',
          enableWhen: [
            {
              question: 'ce7e2c56-6f98-47a3-89bd-c204afe75386',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '651bc978-62a6-4d90-9715-cfba93b2c17c',
          text: 'Har abortert',
          type: 'display',
          enableWhen: [
            {
              question: '9a6271f1-4519-4964-9f02-582a89580f55',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'cd73c351-c6c1-4e51-f471-89c1b338c2ce',
          text: 'Har hatt svangerskap utenfor livmoren',
          type: 'display',
          enableWhen: [
            {
              question: 'f9c7cfb6-f5df-4722-9b09-bb7b1abcb28c',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '2faabfff-6fa0-4eb4-96d0-dc16765df8fc',
          text: 'Ble operert relatert til svangerskap utenfor livmoren',
          type: 'display',
          enableWhen: [
            {
              question: '32077b26-cdb1-438f-8762-49367bf2e451',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '565d3dad-ccb6-4512-8362-e13a46779523',
          text: 'Er tidligere behandlet for livmorhalsforandringer',
          type: 'display',
          enableWhen: [
            {
              question: '552ee1c4-cb95-49ca-8667-6b245a1b6a98',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '3531f7b2-af05-40ae-b3d3-5c42eb1f6852',
          text: 'Har fått vaksine mot HPV (Humant papillomavirus)',
          type: 'display',
          enableWhen: [
            {
              question: 'af6614e7-41b0-459a-9592-f2b0a0856d54',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '7891a283-2510-4954-8054-356670e42e81',
          text: 'Har kommet i overgangsalderen (menopause)',
          type: 'display',
          enableWhen: [
            {
              question: '0c5bb2e8-10a4-4c60-bef9-44715e207637',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '2609927b-f4d6-44b9-8a82-3755ed2b0c14',
          text: 'Har blitt operert i eller via skjeden',
          type: 'display',
          enableWhen: [
            {
              question: '6e343068-ebd4-4f3b-f2b6-e11a4f81a3ca',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '2f68cd30-cbc6-432a-9ef8-db2c99f38695',
          text: 'Har blitt operert med kikkhull i magen/buken',
          type: 'display',
          enableWhen: [
            {
              question: '2774a6ed-517d-4fe8-eebb-69210f4bcdd2',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '49813b82-f9ed-4ce0-952c-5713386840c6',
          text: 'Har blitt operert med åpen mage/bukoperasjon',
          type: 'display',
          enableWhen: [
            {
              question: '5dd664a4-4120-41d6-8fff-79f591037724',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'e9cc08bd-47a6-49a6-ad1d-f6c4de3bad36',
          text: 'Spørsmål til timeavtalen',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**Spørsmål til timeavtalen**' },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '12', operator: 'exists', answerBoolean: true }],
          required: false,
        },
        {
          linkId: 'bbe875e1-cbed-4ea9-9020-648df1a73e12',
          text: 'Har vært smittet av eller bodd i samme husstand som en person som har vært smittet av resistente bakterier (MRSA, VRE eller ESBL)',
          type: 'display',
          enableWhen: [
            {
              question: '26ae8b51-f73e-4e77-85a3-1dd8f9aeef04',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '69bb7621-8c59-41f3-e5b7-d7f08f6332be',
          text: 'Har arbeidet som helsearbeider eller vært innlagt i sykehus eller annen helseinstitusion utenfor Norden.',
          type: 'display',
          enableWhen: [
            {
              question: 'a5b41ecc-c840-4446-b616-fc00ae4b275b',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: 'ad30598f-2d4a-401c-8a4c-fd1afbc13be3',
          text: 'Har fått omfattende undersøkelse, behandling, injeksjoner eller tannbehandling i en helsetjeneste utenfor Norden',
          type: 'display',
          enableWhen: [
            {
              question: '9f257d1d-718d-4dc1-859f-a93b596ebd9d',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '4420a865-595f-44ce-c944-4855d72caa1f',
          text: 'Har oppholdt seg i flyktningleir eller barnehjem utenfor Norden',
          type: 'display',
          enableWhen: [
            {
              question: '6a5ec8b0-8504-48c1-ad19-1d64255dda5e',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '873ab1ec-f815-4a43-a5eb-5ccdc012259c',
          text: 'Har oppholdt seg sammenhengende i mer enn 6 uker utenfor Norden og har i tillegg kronisk eksem, sår eller hudinfeksjon',
          type: 'display',
          enableWhen: [
            {
              question: '130c51fd-3a5a-4ee6-8c0f-b0c155c68fda',
              operator: '=',
              answerCoding: { system: 'urn:oid:2.16.578.1.12.4.1.1101', code: '1' },
            },
          ],
          required: false,
        },
        {
          linkId: '1517da5f-b516-4f1a-8844-0804bce42d66',
          text: 'Annet vi bør vite for å kunne gi deg god behandling',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown: 'Annet vi bør vite for å kunne gi deg god behandling',
              },
            ],
          },
          type: 'display',
          enableWhen: [
            { question: '12', operator: 'exists', answerBoolean: true },
            { question: 'cde2bd0b-87bb-4f42-95fb-a790042d30e8', operator: 'exists', answerBoolean: true },
          ],
          required: false,
        },
        {
          linkId: 'd21eebda-a649-4a59-8f68-28e30dac6091',
          code: [
            {
              id: '29a3ac7a-d040-407b-d9d2-9f7b5e3fbfed',
              system: 'http://helsenorge.no/fhir/CodeSystem/RenderOptions',
              code: '2',
              display: 'KunPdf',
            },
          ],
          text: '----- Oppsummering slutt -----',
          _text: {
            extension: [
              { url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: '**\\----- Oppsummering slutt -----**' },
            ],
          },
          type: 'display',
          required: false,
        },
      ],
    },
    {
      linkId: '99',
      text: 'Innsending',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden', valueBoolean: true }],
          linkId: '99.1',
          text: 'Helse Sør-Øst',
          _text: { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown', valueMarkdown: 'Helse Sør-Øst' }] },
          type: 'display',
        },
        {
          linkId: '99.2',
          text: 'Skjemaet vil bli sendt til Akershus universitetssykehus HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Akershus universitetssykehus HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/4' } }],
          enableBehavior: 'any',
        },
        {
          linkId: 'a959a24a-439d-4296-8d5f-ddc5da6b4c4f',
          text: 'Skjemaet vil bli sendt til Diakonhjemmet sykehus. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Diakonhjemmet sykehus**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/44' } }],
          enableBehavior: 'any',
        },
        {
          linkId: 'dbd2de88-ac3c-4230-b43e-235149702c3f',
          text: 'Skjemaet vil bli sendt til Martina Hansens Hospital. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Martina Hansens Hospital**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/36' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.3',
          text: 'Skjemaet vil bli sendt til Oslo universitetssykehus HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Oslo universitetssykehus HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/1' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '040a7472-8c34-44fc-9fa9-0923e8c5026b',
          text: 'Skjemaet vil bli sendt til Sunnaas sykehus HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sunnaas** **sykehus HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/5' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.5',
          text: 'Skjemaet vil bli sendt til Sykehuset i Vestfold HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sykehuset i Vestfold HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/6' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.6',
          text: 'Skjemaet vil bli sendt til Sykehuset Innlandet HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sykehuset Innlandet HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/7' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.7',
          text: 'Skjemaet vil bli sendt til Sykehuset Telemark HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sykehuset Telemark HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/8' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.8',
          text: 'Skjemaet vil bli sendt til Sykehuset Østfold HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sykehuset Østfold HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/9' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.9',
          text: 'Skjemaet vil bli sendt til Sørlandet sykehus HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Sørlandet sykehus HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/10' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.10',
          text: 'Skjemaet vil bli sendt til Vestre Viken HF. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Vestre Viken HF**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/11' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.11',
          text: 'Skjemaet vil bli sendt til Revmatismesykehuset Lillehammer. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Revmatismesykehuset Lillehammer**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/31' } }],
          enableBehavior: 'any',
        },
        {
          linkId: '99.12',
          text: 'Skjemaet vil bli sendt til Betanien Hospital Skien. Er ikke dette korrekt, endre mottaker over. Sender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                valueMarkdown:
                  'Skjemaet vil bli sendt til **Betanien Hospital Skien**. Er ikke dette korrekt, endre mottaker over.  \nSender du skjemaet til feil sykehus, må du selv kontakte sykehuset for å få det slettet fra din journal. I tillegg må du sende inn skjemaet på nytt, til rett sykehus.',
              },
            ],
          },
          type: 'display',
          enableWhen: [{ question: '33a69e13-1594-4c4d-8b10-0eff240cdb84', operator: '=', answerReference: { reference: 'Endpoint/34' } }],
          enableBehavior: 'any',
        },
      ],
    },
  ],
};
const FormFillerPreview = (props: Props): JSX.Element => {
  const store = configureStore({ reducer: rootReducer, middleware: getDefaultMiddleware => getDefaultMiddleware() });

  const questionnaireForPreview = JSON.parse(JSON.stringify(skjema ?? {}, emptyPropertyReplacer)) as Bundle<Questionnaire> | Questionnaire;
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>();
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const handleSubmit = (questionnaireResponse: QuestionnaireResponse): void => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(questionnaireResponse));
  };
  const [lang, setLang] = useState<number>(0);
  const uploadAttachment = (file: File[], onSuccess: (attachment: Attachment) => void): void => {
    onSuccess({ data: file[0].name, contentType: file[0].type, url: 'url' });
  };
  //@ts-expect-error error
  const onDeleteAttachment = (fileId: string, onSuccess: () => void): void => {
    onSuccess();
  };
  const onOpenAttachment = (fileId: string): void => {
    // eslint-disable-next-line no-console
    console.log(fileId);
  };
  const dispatch = store.dispatch;
  const onChange = (
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: QuestionnaireItem,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    answer: QuestionnaireResponseItemAnswer,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    actionRequester: IActionRequester,
    //@ts-expect-error error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    questionnaireInspector: IQuestionnaireInspector
  ): void => {
    // eslint-disable-next-line no-console
    // console.log(item, answer, actionRequester, questionnaireInspector);
  };
  return (
    <Provider store={store}>
      <div className="overlay">
        <div className="preview-window">
          <div className="title align-everything">
            <h1>{'Preview'}</h1>
            <button onClick={(): void => setLang(lang === 0 ? 1 : 0)}>{`Endre språk ${lang === 0 ? 'til engelsk' : 'til norsk'}`}</button>
          </div>
          <FormFillerSidebar questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview, lang)} />

          <div className="referoContainer-div">
            {!showResponse ? (
              <div className="page_refero">
                <ReferoContainer
                  questionnaire={getQuestionnaireFromBubndle(questionnaireForPreview, lang)}
                  onCancel={() => {}}
                  onChange={onChange}
                  onSave={(questionnaireResponse: QuestionnaireResponse): void => {
                    // setQuestionnaireResponse(questionnaireResponse);
                    // setShowResponse(true);
                    dispatch(
                      setSkjemaDefinitionAction({
                        syncQuestionnaireResponse: true,
                        questionnaire: getQuestionnaireFromBubndle(questionnaireForPreview, lang),
                        questionnaireResponse,
                      })
                    );
                  }}
                  // eslint-disable-next-line no-console
                  onSubmit={handleSubmit}
                  authorized={true}
                  resources={getResources('')}
                  sticky={true}
                  saveButtonDisabled={false}
                  loginButton={<button>{'Login'}</button>}
                  syncQuestionnaireResponse
                  validateScriptInjection
                  language={LanguageLocales.NORWEGIAN}
                  fetchValueSet={fetchValueSetFn}
                  fetchReceivers={fetchReceiversFn}
                  uploadAttachment={uploadAttachment}
                  onDeleteAttachment={onDeleteAttachment}
                  onOpenAttachment={onOpenAttachment}
                  attachmentValidTypes={[MimeTypes.PNG, MimeTypes.JPG, MimeTypes.PDF, MimeTypes.PlainText]}
                  attachmentMaxFileSize={1}
                  // onStepChange={(newIndex: number): void => setStepIndex(newIndex)}
                />
              </div>
            ) : (
              <div>
                <pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>
                <button onClick={(): void => setShowResponse(false)}>{'Tilbake til skjemautfyller'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default FormFillerPreview;
