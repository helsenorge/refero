import type { DOMPurify } from 'dompurify';

let DOMPurify: DOMPurify;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function importDOMPurify() {
  if (!DOMPurify) {
    DOMPurify = (await import('dompurify')).default;
  }
}

export async function SanitizeText(textToSanitize: string): Promise<string> {
  await importDOMPurify();

  const sanitizedResult = DOMPurify.sanitize(textToSanitize, {
    RETURN_TRUSTED_TYPE: true,
    ADD_ATTR: ['target'],
  });

  return sanitizedResult as string;
}
