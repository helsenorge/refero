import { createContext, useContext, ReactNode, useMemo } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';

import { useAppDispatch, useAppSelector } from '@/reducers';
import { actions } from '@/reducers/form';
import { AutoSuggestProps } from '@/types/autoSuggestProps';
import { OrgenhetHierarki } from '@/types/orgenhetHierarki';
import { IActionRequester } from '@/util/actionRequester';
import { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import { Resources } from '@/util/resources';

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
  globalOnChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;
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
  const dispatch = useAppDispatch();
  const isExternalUpdate = useAppSelector(state => state.refero.form.FormData.isExternalUpdate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOnChange = (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ): void => {
    if (isExternalUpdate) {
      dispatch(dispatch(actions.setIsExternalUpdateAction(false)));
    }
    onChange?.(item, answer, actionRequester, questionnaireInspector);
  };
  const contextValue = useMemo(
    () => ({
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
      globalOnChange: handleOnChange,
    }),
    [
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
      handleOnChange,
    ]
  );

  return <ExternalRender.Provider value={contextValue}>{children}</ExternalRender.Provider>;
};

export const useExternalRenderContext = (): ExternalRenderType => {
  const context = useContext(ExternalRender);
  if (context === undefined) {
    throw new Error('useExternalRenderContext must be used within a ExternalRenderProvider');
  }
  return context;
};
