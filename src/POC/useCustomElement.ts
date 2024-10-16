import { getExtension, getMarkdownExtensionValue } from '@/util/extension';
import { CUSTOM_ELEMENT_EXTENSION_URL } from './constants';
import { QuestionnaireItem } from 'fhir/r4';
import { createElement, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getText } from '@/util';
import { useExternalRenderContext } from '@/context/externalRenderContext';

export const useCustomElement = (item?: QuestionnaireItem): JSX.Element | null => {
  const customElementExtension = getExtension(CUSTOM_ELEMENT_EXTENSION_URL, item);
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const { onRenderMarkdown, resources } = useExternalRenderContext();
  const questionnaire = formDefinition?.Content;
  if (!customElementExtension || !customElementExtension.valueString || !item) {
    return null;
  }

  const elementName = customElementExtension.valueString;
  const customElementRef = useRef<HTMLElement | null>(null);
  const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
  const text = getText(item, onRenderMarkdown, questionnaire, resources);

  useEffect(() => {
    if (customElementRef.current) {
      customElementRef.current.setAttribute('text', markdown ? markdown : text || '');
    }
  }, [customElementRef]);

  return createElement(elementName, {
    ref: customElementRef,
  });
};
