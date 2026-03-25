import type React from 'react';

import type { AutoSuggestProps } from '@/types/autoSuggestProps';
import type { OrgenhetHierarki } from '@/types/orgenhetHierarki';
import type { FormViewChange } from '@/types/referoProps';
import type { IActionRequester } from '@/util/actionRequester';
import type { IQuestionnaireInspector } from '@/util/questionnaireInspector';
import type { Resources } from '@/util/resources';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer, ValueSet } from 'fhir/r4';

export type ExternalRenderType = {
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
  globalOnChange?: (
    item: QuestionnaireItem,
    answer: QuestionnaireResponseItemAnswer,
    actionRequester: IActionRequester,
    questionnaireInspector: IQuestionnaireInspector
  ) => void;
  onFormViewChange?: FormViewChange;
};
