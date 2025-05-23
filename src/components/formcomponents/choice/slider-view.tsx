import { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { Slider, SliderStep } from '@helsenorge/designsystem-react/components/Slider';

import styles from '../common-styles.module.css';
import { convertToEmoji } from './sliderUtils';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, isInteger, maxValue, minValue, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import codeSystems from '@/constants/codingsystems';
import { Extensions } from '@/constants/extensions';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getId, isReadOnly } from '@/util';
import { getCodes as getCodingSystemCodes } from '@/util/codingsystem';
import { getExtension } from '@/util/extension';
import { isString } from '@/util/typeguards';

export type SliderProps = QuestionnaireComponentItemProps & {
  handleChange: (sliderStep: string) => void;
  selected?: Array<string | undefined>;
  pdfValue?: string | number;
};
enum SliderDisplayTypes {
  Label = 'label',
  OrdinalValue = 'ordnialValue',
  default = '',
}

type LeftRightLabels = { leftLabel: string; rightLabel: string };

const SliderView = (props: SliderProps): JSX.Element | null => {
  const { linkId, handleChange, selected, idWithLinkIdAndItemIndex, id, path, index, pdf, children, pdfValue } = props;
  const { resources } = useExternalRenderContext();
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
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
  const isSelected = selected && selected[0] ? true : false;

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    min: minValue({ item, resources }),
    max: maxValue({ item, resources }),
    shouldUnregister: true,
    setValueAs: value => (isSelected ? value : undefined),
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={selected}
        pdfValue={pdfValue}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_slider">
      <FormGroup onColor="ongrey" error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          htmlFor={getId(id)}
          item={item}
          labelId={`${getId(id)}-slider-choice-label`}
          testId={`${getId(id)}-slider-choice-label`}
          sublabelId={`${getId(id)}-slider-choice-sublabel`}
          resources={resources}
        />
        <Slider
          {...rest}
          id={getId(id)}
          labelLeft={leftRightLabels?.leftLabel}
          labelRight={leftRightLabels?.rightLabel}
          steps={sliderSteps}
          testId={`${getId(id)}-${index}-slider-choice`}
          onChange={(e): void => {
            const val = e.target.value;
            if (isInteger(val)) {
              onValueChange(Number(val));
              onChange(e);
            }
          }}
          selected={isSelected}
          value={getSelectedStep()}
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

export default SliderView;
