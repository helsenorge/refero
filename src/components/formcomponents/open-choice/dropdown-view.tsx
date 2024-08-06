import React from 'react';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { shouldShowExtraChoice } from '@/util/choice';
import { getValidationTextExtension } from '@/util/extension';
import { isRequired, getId } from '@/util/index';
import { Resources } from '@/util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderOpenField: () => JSX.Element | undefined;
  children?: React.ReactNode;
}

const DropdownView = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
  selected,
  resources,
  children,
  renderOpenField,
  control,
  error,
  idWithLinkIdAndItemIndex,
  onAnswerChange,
  responseItems,
  responseItem,
  path,
  index,
}: Props): JSX.Element | null => {
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);

  if (!options) {
    return null;
  }

  const answer = useGetAnswer(responseItem) || [];
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
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
        <Controller
          name={idWithLinkIdAndItemIndex}
          control={control}
          shouldUnregister={true}
          defaultValue={selected?.[0] || ''}
          rules={{
            required: {
              message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? '',
              value: isRequired(item),
            },
          }}
          render={({ field: { onChange: handleChange, ...rest } }): JSX.Element => (
            <Select
              {...rest}
              selectId={getId(id)}
              className="page_refero__input"
              testId={getId(id)}
              onChange={(e): void => {
                handleChange(e);
                onChange(e);
              }}
              value={selected?.[0] || ''}
            >
              <option value={undefined}>{resources?.selectDefaultPlaceholder || ''}</option>
              {options.map(option => (
                <option key={getId(id) + option.label} value={option.type}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        />
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      </FormGroup>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DropdownView);
