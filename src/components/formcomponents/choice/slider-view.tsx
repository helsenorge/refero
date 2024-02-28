import * as React from 'react';

import { QuestionnaireItem, QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import ExtensionConstants from '../../../constants/extensions';
import { getExtension } from '../../../util/extension';
import { getValue } from '../../../util/itemHelper';

interface SliderProps {
  item: QuestionnaireItem;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  handleChange: (sliderStep: string) => void;
  children: React.ReactNode;
}

type LeftRightLabels = [leftLabel: string, rightLabel: string];

const SliderView: React.FC<SliderProps> = ({ item, answer, handleChange, children }) => {
  const title = item.text;
  const [sliderSteps, setSliderSteps] = React.useState<SliderStep[] | undefined>(undefined);
  const [leftRightLabels, setleftRightLabels] = React.useState<LeftRightLabels | undefined>(undefined);

  const hasValue = () => {
    if (Array.isArray(answer)) {
      return false;
    } else {
      const value = getValue(item, answer);
      return !!value;
    }
  };

  React.useEffect(() => {
    if (item.answerOption) {
      setSliderSteps(item.answerOption.map(option => mapToSliderStep(option)));
      setleftRightLabels(getLeftRightLabels(item.answerOption));
    }
  }, []);

  const onValueChange = (index: number): void => {
    const code = item.answerOption?.[index]?.valueCoding?.code;

    if (code) {
      handleChange(code);
    }
  };

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <Slider
        title={title}
        labelLeft={leftRightLabels?.[0]}
        labelRight={leftRightLabels?.[1]}
        onChange={onValueChange}
        steps={sliderSteps}
        selected={hasValue()}
      />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

function mapToSliderStep(answerOption: QuestionnaireItemAnswerOption): SliderStep {
  const step: SliderStep = {
    label: getStepLabel(answerOption),
    emojiUniCode: getStepEmoji(answerOption),
  };

  return step;
}

function getLeftRightLabels(answerOptions: QuestionnaireItemAnswerOption[]): LeftRightLabels | undefined {
  const displayLabels = answerOptions.map(option => option.valueCoding?.display).filter(display => display) as string[];

  if (displayLabels.length > 1) {
    const leftRightLabels: LeftRightLabels = [displayLabels[0], displayLabels[displayLabels.length - 1]];
    return leftRightLabels;
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
