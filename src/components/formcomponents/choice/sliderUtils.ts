import type { Options } from '@/types/formTypes/radioGroupOptions';
import type { QuestionnaireItem } from 'fhir/r4';

import type { SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import codeSystems from '@/constants/codingsystems';
import { Extensions } from '@/constants/extensions';
import { getCodes as getCodingSystemCodes } from '@/util/codingsystem';
import { getExtensionFromExtensions } from '@/util/extension';
import { isString } from '@/util/typeguards';

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const ordinalValueDisplayTypes = ['ordinalValue', 'ordnialValue'] as const;

export enum SliderDisplayTypes {
  Label = 'label',
  OrdinalValue = 'ordinalValue',
  default = '',
}

export function isOrdinalValueDisplayType(displayType: unknown): boolean {
  return ordinalValueDisplayTypes.includes(displayType as (typeof ordinalValueDisplayTypes)[number]);
}

export function getStepLabel(
  option: Options,
  displayType: SliderDisplayTypes | ({ displayType: 'ordinalValue' } & SliderDisplayTypes)
): number | string | undefined {
  if (isOrdinalValueDisplayType(displayType))
    return getExtensionFromExtensions(Extensions.ORDINAL_VALUE_URL, option.extensions)?.valueDecimal;
  return option.label;
}

export function getStepEmoji(option: Options): string | undefined {
  const emojiLabel = getExtensionFromExtensions(Extensions.VALUESET_LABEL_URL, option.extensions)?.valueString?.trim();
  if (!emojiLabel) return undefined;

  return convertToEmoji(emojiLabel);
}

export function mapToSliderStep(option: Options, displayType: SliderDisplayTypes): SliderStep {
  return {
    label: getStepLabel(option, displayType),
    emojiUniCode: getStepEmoji(option),
  };
}

export function getCodes(options?: Options[]): string[] {
  return options?.map(option => option.type).filter(isString) || [];
}

export function getLeftRightLabels(item?: QuestionnaireItem): LeftRightLabels | undefined {
  if (!item) return undefined;

  const displayLabels = getCodingSystemCodes(item, codeSystems.SliderLabels);

  return {
    leftLabel: displayLabels?.find(x => x.code === 'LabelLeft')?.display || '',
    rightLabel: displayLabels?.find(x => x.code === 'LabelRight')?.display || '',
  };
}

export const isValidDecimal = (str: string): boolean => /^\d+$/.test(str);

export const isValidHex = (str: string): boolean => /^(0x)?[0-9A-Fa-f]{1,6}$/.test(str);

export const isValidHtmlCode = (str: string): boolean => /^&#(x[0-9A-Fa-f]+|\d+);$/.test(str);

export const isValidUnicodeHex = (str: string): boolean => /^U\+[0-9A-Fa-f]{4,6}$/.test(str);

export const getCodePoint = (value: string): number | null => {
  if (isValidDecimal(value)) {
    return parseInt(value, 10);
  }
  if (isValidHtmlCode(value)) {
    if (value.startsWith('&#x')) {
      return parseInt(value.replace(/^&#x|;$/g, ''), 16);
    } else {
      return parseInt(value.replace(/^&#|;$/g, ''), 10);
    }
  }
  if (isValidUnicodeHex(value)) {
    return parseInt(value.replace(/^U\+/, ''), 16);
  }
  if (isValidHex(value)) {
    return parseInt(value.replace(/^0x/, ''), 16);
  }
  return null;
};
export const convertToEmoji = (value: string): string => {
  const codePoint = getCodePoint(value);

  if (codePoint !== null && codePoint >= 0 && codePoint <= 0x10ffff) {
    try {
      return String.fromCodePoint(codePoint);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return value;
    }
  } else {
    return value;
  }
};
