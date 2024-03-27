import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { GlobalState } from '../../../store/reducers';
import { getFormDefinition } from '../../../store/selectors';
import { getPlaceholder } from '../../../util/extension';
import { getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';

interface DropdownViewProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string | undefined) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn?: boolean;
  children?: React.ReactNode;
  path: Path[];
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DropdownView = ({
  options,
  item,
  id,
  handleChange,
  resources,
  children,
  repeatButton,
  renderDeleteButton,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  path,
}: DropdownViewProps): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const questionnaire = useSelector<GlobalState, Questionnaire | undefined | null>(state => getFormDefinition(state)?.Content);
  const selectId = getId(id);

  let placeholder;
  if (getPlaceholder(item)) {
    placeholder = <option value="">{getPlaceholder(item)}</option>;
  } else if (resources) {
    placeholder = <option value="">{resources.selectDefaultPlaceholder}</option>;
  }

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const formId = createFromIdFromPath(path);
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(formId);
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      {renderHelpElement()}

      <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message} mode="ongrey">
        <Select
          {...register(formId, {
            onChange: onChange,
          })}
          label={
            <Label
              htmlFor={selectId}
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          selectId={selectId}
          className="page_refero__input"
        >
          {placeholder}
          {options.map(dropdownOption => (
            <option key={selectId + dropdownOption.label} value={dropdownOption.type}>
              {dropdownOption.label}
            </option>
          ))}
        </Select>
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DropdownView);
