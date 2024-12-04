import DOMPurify from 'dompurify';

export function SanitizeText(textToSanitize: string): string {
  const sanitizedResult = DOMPurify.sanitize(textToSanitize, {
    RETURN_TRUSTED_TYPE: true,
    ADD_ATTR: ['target'],
  });

  return sanitizedResult as string;
}
