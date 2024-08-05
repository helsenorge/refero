import { QuestionnaireItem } from 'fhir/r4';
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
};

const ExternalRender = createContext<ExternalRenderType | undefined>(undefined);

type MyProviderProps = {
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
};
export const ExternalRenderProvider = ({
  children,
  onRequestHelpButton,
  onRequestHelpElement,
  onRenderMarkdown,
}: MyProviderProps): JSX.Element => {
  return (
    <ExternalRender.Provider value={{ onRequestHelpElement, onRequestHelpButton, onRenderMarkdown }}>{children}</ExternalRender.Provider>
  );
};

export const useExternalRenderContext = (): ExternalRenderType => {
  const context = useContext(ExternalRender);
  if (context === undefined) {
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
