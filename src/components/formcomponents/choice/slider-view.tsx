import * as React from 'react';

import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import codeSystems from '../../../constants/codingsystems';
import ExtensionConstants from '../../../constants/extensions';
import { getCodes as getCodingSystemCodes } from '../../../util/codingsystem';
import { getExtension } from '../../../util/extension';
import { isString } from '../../../util/typeguards';

interface SliderProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  handleChange: (sliderStep: string) => void;
  selected?: Array<string | undefined>;
  children: React.ReactNode;
}
enum SliderDisplayTypes {
  Label = 'label',
  OrdinalValue = 'ordnialValue',
  default = 'label',
}

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const SliderView: React.FC<SliderProps> = ({ item, handleChange, selected, children }) => {
  const title = item.text;

  const onValueChange = (index: number): void => {
    const code = item.answerOption?.[index]?.valueCoding?.code;

    if (code) {
      handleChange(code);
    }
  };

  const getSelectedStep = (): number | undefined => {
    if (item.answerOption && selected && selected[0]) {
      const stepCodes = getCodes(item.answerOption);
      for (let i = 0; i < stepCodes.length; i++) {
        if (stepCodes[i] === selected[0]) {
          const selectedStepIndex = i;
          return selectedStepIndex;
        }
      }
    } else {
      return undefined;
    }
  };
  const displayType = getCodingSystemCodes(item, codeSystems.SliderDisplayType);
  const sliderSteps = item?.answerOption?.map(option =>
    mapToSliderStep(option, (displayType?.[0]?.code as SliderDisplayTypes) || SliderDisplayTypes.OrdinalValue)
  );
  const leftRightLabels = getLeftRightLabels(item);
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <Slider
        title={title}
        labelLeft={leftRightLabels?.leftLabel}
        labelRight={leftRightLabels?.rightLabel}
        onChange={onValueChange}
        steps={sliderSteps}
        value={getSelectedStep()}
        selected={selected && selected[0] ? true : false}
      />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

function mapToSliderStep(answerOptions: QuestionnaireItemAnswerOption, displayType: SliderDisplayTypes): SliderStep {
  return {
    label: getStepLabel(answerOptions, displayType),
    emojiUniCode: getStepEmoji(answerOptions),
  };
}

function getCodes(answerOptions?: QuestionnaireItemAnswerOption[]): string[] {
  return answerOptions?.map(option => option.valueCoding?.code).filter(isString) || [];
}

function getLeftRightLabels(item?: QuestionnaireItem): LeftRightLabels | undefined {
  if (!item) return undefined;

  const displayLabels = getCodingSystemCodes(item, codeSystems.SliderLabels);

  return {
    leftLabel: displayLabels?.find(x => x.code === 'LabelLeft')?.display || '',
    rightLabel: displayLabels?.find(x => x.code === 'LabelRight')?.display || '',
  };
}

function getStepLabel(option: QuestionnaireItemAnswerOption, displayType: SliderDisplayTypes): number | string | undefined {
  if (displayType === SliderDisplayTypes.OrdinalValue)
    return getExtension(ExtensionConstants.ORDINAL_VALUE, option.valueCoding)?.valueDecimal;
  return option.valueCoding?.display;
}

function getStepEmoji(option: QuestionnaireItemAnswerOption): string | undefined {
  const emojiLabel = getExtension(ExtensionConstants.VALUESET_LABEL, option.valueCoding)?.valueString?.trim();
  if (!emojiLabel) return undefined;

  return convertToEmoji(emojiLabel);
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
    } catch (error) {
      return value;
    }
  } else {
    return value;
  }
};

export default SliderView;
