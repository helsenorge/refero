import * as React from 'react';

import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import ExtensionConstants from '../../../constants/extensions';
import { isRequired } from '../../../util';
import { getExtension, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import { isString } from '../../../util/typeguards';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface SliderProps extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  handleChange: (sliderStep: string) => void;
  selected?: Array<string | undefined>;
  children: React.ReactNode;
}

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const SliderView: React.FC<SliderProps> = ({ item, handleChange, selected, children, register }) => {
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
  const sliderSteps = item?.answerOption?.map(option => mapToSliderStep(option));
  const leftRightLabels = getLeftRightLabels(item?.answerOption);
  // maxValue={getMaxValueExtensionValue(item)}
  // minValue={getMinValueExtensionValue(item)}
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <FormGroup mode="ongrey">
        <Slider
          {...register(item.linkId, {
            required: isRequired(item),
          })}
          title={title}
          labelLeft={leftRightLabels?.leftLabel}
          labelRight={leftRightLabels?.rightLabel}
          steps={sliderSteps}
          onChange={onValueChange}
          selected={selected && selected[0] ? true : false}
          value={getSelectedStep()}
        />
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

function mapToSliderStep(answerOptions: QuestionnaireItemAnswerOption): SliderStep {
  return {
    label: getStepLabel(answerOptions),
    emojiUniCode: getStepEmoji(answerOptions),
  };
}

function getDisplay(answerOptions?: QuestionnaireItemAnswerOption[]): string[] {
  return answerOptions?.map(option => option.valueCoding?.display).filter(isString) || [];
}

function getCodes(answerOptions?: QuestionnaireItemAnswerOption[]): string[] {
  return answerOptions?.map(option => option.valueCoding?.code).filter(isString) || [];
}

function getLeftRightLabels(answerOptions?: QuestionnaireItemAnswerOption[]): LeftRightLabels | undefined {
  const displayLabels = getDisplay(answerOptions);

  if (displayLabels.length > 1) {
    return { leftLabel: displayLabels[0], rightLabel: displayLabels[displayLabels.length - 1] };
  }

  return undefined;
}

function getStepLabel(option: QuestionnaireItemAnswerOption): number | undefined {
  const label = getExtension(ExtensionConstants.ORDINAL_VALUE, option.valueCoding)?.valueDecimal;
  return label;
}

function getStepEmoji(option: QuestionnaireItemAnswerOption): string | undefined {
  const emojiLabel = getExtension(ExtensionConstants.VALUESET_LABEL, option.valueCoding)?.valueString;
  return emojiLabel;
}

export default SliderView;
