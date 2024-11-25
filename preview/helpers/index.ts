import { Extension, QuestionnaireItem } from 'fhir/r4';

type Language = {
  code: string;
  display: string;
  localDisplay: string;
};
export interface CodeStringValue {
  [code: string]: string;
}
export interface ContainedTranslation {
  concepts: CodeStringValue;
}

export interface ContainedTranslations {
  [id: string]: ContainedTranslation;
}
export interface ItemTranslation {
  answerOptions?: CodeStringValue;
  entryFormatText?: string;
  initial?: string;
  text?: string;
  validationText?: string;
  sublabel?: string;
  repeatsText?: string;
  prefix?: string;
}
export interface ItemTranslations {
  [linkId: string]: ItemTranslation;
}
export interface SidebarItemTranslation {
  markdown: string;
}

export interface MetadataTranslations {
  [key: string]: string;
}

export interface SidebarItemTranslation {
  markdown: string;
}

export interface SidebarItemTranslations {
  [linkId: string]: SidebarItemTranslation;
}

export interface SettingTranslations {
  [key: string]: Extension;
}
export interface OrderItem {
  linkId: string;
  items: Array<OrderItem>;
}
export interface Translation {
  items: ItemTranslations;
  sidebarItems: SidebarItemTranslations;
  metaData: MetadataTranslations;
  contained: ContainedTranslations;
  settings: SettingTranslations;
}
export interface Items {
  [linkId: string]: QuestionnaireItem;
}
export interface Languages {
  [key: string]: Translation;
}

export const INITIAL_LANGUAGE: Language = { code: 'nb-NO', display: 'Bokmål', localDisplay: 'Bokmål' };
export const supportedLanguages: Language[] = [
  INITIAL_LANGUAGE,
  { code: 'nn-NO', display: 'Nynorsk', localDisplay: 'Nynorsk' },
  { code: 'se-NO', display: 'Samisk', localDisplay: 'Davvisámegillii' },
  { code: 'en-GB', display: 'Engelsk', localDisplay: 'English' },
  { code: 'pl-PL', display: 'Polsk', localDisplay: 'Polskie' },
  { code: 'ro-RO', display: 'Rumensk', localDisplay: 'Română' },
  { code: 'lt-LT', display: 'Litauisk', localDisplay: 'Lietuvis' },
  { code: 'ru-RU', display: 'Russisk', localDisplay: 'русский' },
  { code: 'fr-FR', display: 'Fransk', localDisplay: 'Français' },
];

const isEmptyObject = (value: unknown): boolean => {
  return typeof value === 'object' && Object.keys(<Record<string, unknown>>value).length === 0;
};

export const getLanguageFromCode = (languageCode: string): Language | undefined => {
  return supportedLanguages.find(x => x.code.toLowerCase() === languageCode.toLowerCase());
};

export const emptyPropertyReplacer = (_key: string, value: unknown): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    // remove empty objects from array (to avoid null values in arrays)
    const filteredValue = value.filter(x => !isEmptyObject(x));
    return filteredValue.length === 0 ? undefined : filteredValue;
  }
  if (isEmptyObject(value)) {
    return undefined;
  }
  return value;
};
