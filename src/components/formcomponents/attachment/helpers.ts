import type { Attachment, QuestionnaireResponseItemAnswer } from 'fhir/r4';

export const getAttachmentsFromAnswer = (answer?: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[]): Attachment[] => {
  if (Array.isArray(answer)) {
    return answer.map(ans => ans.valueAttachment).filter((attachment): attachment is Attachment => attachment !== undefined);
  } else if (answer && answer.valueAttachment) {
    return [answer.valueAttachment];
  }
  return [];
};
