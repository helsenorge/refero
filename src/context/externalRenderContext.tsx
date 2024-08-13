import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { GlobalState } from '@/reducers';
import { AutoSuggestProps } from '@/types/autoSuggestProps';
import { OrgenhetHierarki } from '@/types/orgenhetHierarki';
import { IActionRequester } from '@/util/actionRequester';
import { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import { Resources } from '@/util/resources';
import { QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';
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
  onFieldsNotCorrectlyFilledOut?: () => void;
  onStepChange?: (newIndex: number) => void;
  promptLoginMessage?: () => void;
  resources?: Resources;
  validateScriptInjection?: boolean;
  autoSuggestProps?: AutoSuggestProps;
  onAnswerChange: (state: GlobalState, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
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
  onFieldsNotCorrectlyFilledOut?: () => void;
  onStepChange?: (newIndex: number) => void;
  promptLoginMessage?: () => void;
  resources?: Resources;
  validateScriptInjection?: boolean;
  autoSuggestProps?: AutoSuggestProps;
  onChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;
};
export const ExternalRenderProvider = ({
  children,
  onRequestHelpButton,
  onRequestHelpElement,
  onRenderMarkdown,
  fetchValueSet,
  fetchReceivers,
  onFieldsNotCorrectlyFilledOut,
  onStepChange,
  promptLoginMessage,
  resources,
  autoSuggestProps,
  validateScriptInjection,
  onChange,
}: ExternalRenderProviderProps): JSX.Element => {
  const onAnswerChange = useOnAnswerChange(onChange);
  return (
    <ExternalRender.Provider
      value={{
        onRequestHelpElement,
        onRequestHelpButton,
        onRenderMarkdown,
        fetchValueSet,
        fetchReceivers,
        onFieldsNotCorrectlyFilledOut,
        onStepChange,
        promptLoginMessage,
        resources,
        autoSuggestProps,
        validateScriptInjection,
        onAnswerChange,
      }}
    >
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
