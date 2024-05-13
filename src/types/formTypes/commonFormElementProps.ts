import {
  Attachment,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Resource,
  ValueSet,
} from 'fhir/r4';
import { Resources } from '../../util/resources';
import { Path } from '../../util/refero-core';
import { UploadedFile } from '@helsenorge/file-upload/components/dropzone';
import { GlobalState } from '../../reducers';
import { RenderContext } from '../../util/renderContext';
import { AutoSuggestProps } from '../autoSuggestProps';
import { OrgenhetHierarki } from '../orgenhetHierarki';

export interface CommonFormElementProps {
  language?: string;
  pdf?: boolean;
  includeSkipLink?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null | undefined;
  responseItem: QuestionnaireResponseItem;
  answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  resources?: Resources;
  containedResources?: Resource[];
  path?: Path[];
  headerTag?: number;
  visibleDeleteButton?: boolean;
  repeatButton?: JSX.Element;
  onRequestAttachmentLink?: (file: string) => string;
  onOpenAttachment?: (fileId: string) => void;
  onDeleteAttachment?: (fileId: string, onSuccess: () => void) => void;
  uploadAttachment?: (
    files: File[],
    onSuccess: (attachment: Attachment) => void
  ) => void;
  onRequestHelpButton?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    itemHelp: QuestionnaireItem,
    helpType: string,
    helpText: string,
    opening: boolean
  ) => JSX.Element;
  attachmentErrorMessage?: string;
  attachmentMaxFileSize?: number;
  attachmentValidTypes?: string[];
  validateScriptInjection?: boolean;
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderContext: RenderContext;
  onRenderMarkdown?: (item: QuestionnaireItem, markup: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  fetchReceivers?: (successCallback: (receivers: OrgenhetHierarki[]) => void, errorCallback: () => void) => void;
}
