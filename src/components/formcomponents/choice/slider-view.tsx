import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { Controller, FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';
import styles from '../common-styles.module.css';
import codeSystems from '@/constants/codingsystems';
import { Extensions } from '@/constants/extensions';
import { getId } from '@/util';
import { getCodes as getCodingSystemCodes } from '@/util/codingsystem';
import { getExtension } from '@/util/extension';
import { isString } from '@/util/typeguards';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getErrorMessage, required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { GlobalState } from '@/reducers';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { shouldValidate } from '@/components/validation/utils';

export type SliderProps = QuestionnaireComponentItemProps & {
  handleChange: (sliderStep: string) => void;
  selected?: Array<string | undefined>;
};
enum SliderDisplayTypes {
  Label = 'label',
  OrdinalValue = 'ordnialValue',
  default = '',
}

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const SliderView = (props: SliderProps): JSX.Element | null => {
  const { linkId, handleChange, selected, idWithLinkIdAndItemIndex, id, path, index, pdf, children } = props;
  const { resources } = useExternalRenderContext();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { formState, getFieldState, control } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const onValueChange = (index: number): void => {
    const code = item?.answerOption?.[index]?.valueCoding?.code;
    if (code) {
      handleChange(code);
    }
  };

  const getSelectedStep = (): number | undefined => {
    if (item?.answerOption && selected && selected[0]) {
      const stepCodes = getCodes(item.answerOption);
      for (let i = 0; i < stepCodes.length; i++) {
        if (stepCodes[i] === selected[0]) {
          return i;
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

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
  };

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <FormGroup mode="ongrey" error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          htmlFor={id}
          item={item}
          labelId={`${getId(id)}-slider-choice-label`}
          testId={`${getId(id)}-slider-choice-label`}
          resources={resources}
        />

        <Controller
          name={idWithLinkIdAndItemIndex}
          shouldUnregister={true}
          rules={shouldValidate(item, pdf) ? validationRules : undefined}
          control={control}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Slider
              {...rest}
              labelLeft={leftRightLabels?.leftLabel}
              labelRight={leftRightLabels?.rightLabel}
              steps={sliderSteps}
              testId={getId(item?.linkId)}
              onChange={(value): void => {
                if (!isNaN(value)) {
                  onValueChange(value);
                  onChange(value);
                }
              }}
              selected={selected && selected[0] ? true : false}
              value={getSelectedStep()}
            />
          )}
        />
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
        <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
      </FormGroup>
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
