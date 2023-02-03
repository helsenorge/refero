import DOMPurify from 'dompurify';

export function SanitizeText(textToSanitize: string): string | undefined {
  const sanitizedResult = DOMPurify.sanitize(textToSanitize, {
    RETURN_TRUSTED_TYPE: true,
    ADD_ATTR: ['target'],
  });

  // We call the toString() method to make sure where we return
  // a sanitized string result and not a object of type trusted type
  // https://github.com/cure53/DOMPurify/issues/361
  if (sanitizedResult !== undefined) {
    return sanitizedResult.toString();
  }

  return sanitizedResult;
}
