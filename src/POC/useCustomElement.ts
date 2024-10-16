import { getExtension, getMarkdownExtensionValue } from '@/util/extension';
import { CUSTOM_ELEMENT_EXTENSION_URL } from './constants';
import { QuestionnaireItem } from 'fhir/r4';
import { createElement, useEffect, useRef } from 'react';

export const useCustomElement = (item?: QuestionnaireItem): JSX.Element | null => {
  const customElementExtension = getExtension(CUSTOM_ELEMENT_EXTENSION_URL, item);
  if (!customElementExtension || !customElementExtension.valueString) {
    return null;
  }

  const elementName = customElementExtension.valueString;
  const customElementRef = useRef<HTMLElement | null>(null);
  const isMakdown = getMarkdownExtensionValue(item);
  useEffect(() => {
    if (customElementRef.current) {
      customElementRef.current.setAttribute('text', isMakdown ? isMakdown : item?.text || '');
    }
  }, [customElementRef]);

  return createElement(elementName, {
    ref: customElementRef,
  });
};
