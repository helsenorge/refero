// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import React, { type ReactNode, useMemo } from 'react';

import type { AutoSuggestProps } from '@/types/autoSuggestProps';
import type { OrgenhetHierarki } from '@/types/orgenhetHierarki';
import type { FormViewChange } from '@/types/referoProps';
import type { IActionRequester } from '@/util/actionRequester';
import type { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import type { Resources } from '@/util/resources';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';

import { ExternalRenderContext } from './externalRenderContext';

import { useAppDispatch, useAppSelector } from '@/reducers';
import { actions } from '@/reducers/form';

type ExternalRenderProviderProps = {
  children: ReactNode;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => React.JSX.Element;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    helpItem: QuestionnaireItem,
    helpItemType: string,
    helpText: string,
    isHelpVisible: boolean
  ) => React.JSX.Element;
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
  onFormViewChange?: FormViewChange;
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
  onFormViewChange,
}: ExternalRenderProviderProps): React.JSX.Element => {
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
      onFormViewChange,
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
      onFormViewChange,
    ]
  );

  return <ExternalRenderContext.Provider value={contextValue}>{children}</ExternalRenderContext.Provider>;
};
