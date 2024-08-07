import { OrgenhetHierarki } from '@/types/orgenhetHierarki';
import { QuestionnaireItem, ValueSet } from 'fhir/r4';
import { createContext, useContext, ReactNode } from 'react';

type ExternalRenderType = {
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    helpItem: QuestionnaireItem,
    helpItemType: string,
    helpText: string,
    isHelpVisible: boolean
  ) => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  fetchReceivers?: (successCallback: (receivers: OrgenhetHierarki[]) => void, errorCallback: () => void) => void;
};

const ExternalRender = createContext<ExternalRenderType | undefined>(undefined);

export type ExternalRenderProviderProps = {
  children: ReactNode;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    helpItem: QuestionnaireItem,
    helpItemType: string,
    helpText: string,
    isHelpVisible: boolean
  ) => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  fetchReceivers?: (successCallback: (receivers: OrgenhetHierarki[]) => void, errorCallback: () => void) => void;
};
export const ExternalRenderProvider = ({
  children,
  onRequestHelpButton,
  onRequestHelpElement,
  onRenderMarkdown,
  fetchValueSet,
  fetchReceivers,
}: ExternalRenderProviderProps): JSX.Element => {
  return (
    <ExternalRender.Provider value={{ onRequestHelpElement, onRequestHelpButton, onRenderMarkdown, fetchValueSet, fetchReceivers }}>
      {children}
    </ExternalRender.Provider>
  );
};

export const useExternalRenderContext = (): ExternalRenderType => {
  const context = useContext(ExternalRender);
  if (context === undefined) {
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
