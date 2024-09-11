import React from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { shouldShowExtraChoice } from '@/util/choice';
import { getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';
import { required } from '@/components/validation/rules';

type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => JSX.Element | undefined;
};

const RadioView = (props: Props): JSX.Element | null => {
  const {
    options,
    item,
    id,
    handleChange,
    selected,
    resources,
    renderOpenField,
    idWithLinkIdAndItemIndex,
    responseItem,
    responseItems,
    path,
    index,
    children,
  } = props;
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  if (!options) {
    return null;
  }
  const selectedValue = (selected && selected[0]) || '';
  const answer = useGetAnswer(responseItem, item);
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    shouldUnregister: true,
  });
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <FormGroup error={error?.message} mode="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
          afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        {options.map((option: Options, index: number) => (
          <RadioButton
            {...rest}
            key={`${getId(id)}-${index.toString()}`}
            inputId={getId(id) + '-hn-' + index}
            testId={`${getId(id)}-${index}-radio-open-choice`}
            value={option.type}
            onChange={(e): void => {
              handleChange(option.type);
              onChange(e);
            }}
            label={<Label testId={`${getId(id)}-${index}-radio-open-choice-label`} labelTexts={[{ text: option.label }]} />}
            defaultChecked={selectedValue === option?.type}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) ? <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div> : null}
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default RadioView;
