import * as React from 'react';

import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import codeSystems from '../../../constants/codingsystems';
import { Extensions } from '../../../constants/extensions';
import { getId, isRequired } from '../../../util';
import { getCodes as getCodingSystemCodes } from '../../../util/codingsystem';
import { getExtension, getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { isString } from '../../../util/typeguards';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface SliderProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  handleChange: (sliderStep: string) => void;
  selected?: Array<string | undefined>;
  children?: React.ReactNode;
}
enum SliderDisplayTypes {
  Label = 'label',
  OrdinalValue = 'ordnialValue',
  default = 'label',
}

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const SliderView: React.FC<SliderProps> = ({ item, handleChange, selected, children, control, resources, idWithLinkIdAndItemIndex }) => {
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
  const minValue = getMinValueExtensionValue(item);
  const maxValue = getMaxValueExtensionValue(item);
  const displayType = getCodingSystemCodes(item, codeSystems.SliderDisplayType);
  const sliderSteps = item?.answerOption?.map(option =>
    mapToSliderStep(option, (displayType?.[0]?.code as SliderDisplayTypes) || SliderDisplayTypes.OrdinalValue)
  );
  const leftRightLabels = getLeftRightLabels(item);
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <Controller
        name={idWithLinkIdAndItemIndex}
        shouldUnregister={true}
        control={control}
        rules={{
          required: {
            message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
            value: isRequired(item),
          },
          ...(minValue && {
            min: {
              message: getValidationTextExtension(item) ?? '',
              value: minValue,
            },
          }),
          ...(maxValue && {
            min: {
              message: getValidationTextExtension(item) ?? '',
              value: maxValue,
            },
          }),
        }}
        render={({ field, fieldState: { error } }): JSX.Element => (
          <FormGroup mode="ongrey" error={error?.message}>
            <Slider
              title={title}
              labelLeft={leftRightLabels?.leftLabel}
              labelRight={leftRightLabels?.rightLabel}
              steps={sliderSteps}
              testId={getId(item.linkId)}
              onChange={(e): void => {
                onValueChange(e);
                field.onChange(e);
              }}
              selected={selected && selected[0] ? true : false}
              value={getSelectedStep()}
            />
          </FormGroup>
        )}
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
  if (displayType === SliderDisplayTypes.OrdinalValue) return getExtension(Extensions.ORDINAL_VALUE_URL, option.valueCoding)?.valueDecimal;
  return option.valueCoding?.display;
}

function getStepEmoji(option: QuestionnaireItemAnswerOption): string | undefined {
  const emojiLabel = getExtension(Extensions.VALUESET_LABEL_URL, option.valueCoding)?.valueString?.trim();
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
