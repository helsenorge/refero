import { ReactNode, useState } from 'react';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import { shouldShowExtraChoice } from '@/util/choice';
import { isRequired, getId } from '@/util/index';
import { Resources } from '@/util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpElement from '@/components/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/help-button/RenderHelpButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton?: JSX.Element;
  renderDeleteButton?: (className?: string) => JSX.Element | null;
  renderOpenField: () => JSX.Element | undefined;
  children?: ReactNode;
}

const CheckboxView = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
  resources,
  children,
  index,
  renderOpenField,
  control,
  error,
  idWithLinkIdAndItemIndex,
  selected,
  onAnswerChange,
  renderContext,
  responseItems,
  responseItem,
  path,
}: Props): JSX.Element | null => {
  const answer = useGetAnswer(responseItem) || [];
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
          afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
        />

        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        {options?.map((option, index) => (
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            control={control}
            shouldUnregister={true}
            defaultValue={selected}
            rules={{
              required: {
                message: resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
                value: isRequired(item),
              },
            }}
            render={({ field: { value, onChange, ...rest } }): JSX.Element => (
              <Checkbox
                {...rest}
                inputId={`${id}-${option.type}`}
                testId={`${getId(id)}-${index}-checkbox-openchoice`}
                label={<Label testId={`${getId(id)}-${index}-checkbox-openchoice-label`} labelTexts={[{ text: option.label }]} />}
                checked={selected?.some((val: string | undefined) => val === option?.type)}
                value={option.type}
                onChange={(e): void => {
                  const valueCopy = value ? [...value] : [];
                  if (e.target.checked) {
                    valueCopy.push(option.type);
                  } else {
                    const idx = valueCopy.findIndex(code => option.type === code);
                    valueCopy.splice(idx, 1);
                  }
                  onChange(valueCopy);
                  handleChange(option.type);
                }}
              />
            )}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        renderContext={renderContext}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default CheckboxView;
