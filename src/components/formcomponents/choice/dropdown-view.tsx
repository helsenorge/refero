import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { useFormContext } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';

interface DropdownViewProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string | undefined) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn?: boolean;
  children?: JSX.Element;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DropdownView: React.FC<DropdownViewProps> = props => {
  const {
    options,
    item,
    questionnaire,
    id,
    handleChange,
    selected,
    validateInput,
    resources,
    children,
    repeatButton,
    renderDeleteButton,
    renderHelpButton,
    renderHelpElement,
    onRenderMarkdown,
  } = props;
  if (!options) {
    return null;
  }

  const dropdownOptions: HTMLOptionElement[] = options.map((o: Options) => {
    return new Option(o.label, o.type);
  });
  const selectId = getId(id);

  // let placeholder;
  // if (getPlaceholder(item)) {
  //   placeholder = new Option(getPlaceholder(item), '');
  // } else if (resources) {
  //   placeholder = new Option(resources.selectDefaultPlaceholder, '');
  // }

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const handleSelectChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => handleChange(evt.target.value);
  // onChangeValidator={validateInput}
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(item.linkId));
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      <Collapse isOpened>
        {renderHelpElement()}
        <Validation errorSummary={error?.message}>
          <FormGroup>
            <Select
              {...register(getId(item.linkId), {
                required: { value: isRequired(item), message: getValidationTextExtension(item) || '' },
                onChange: handleSelectChange,
                value: selected ? selected[0] : undefined,
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
              errorText={error?.message}
              className="page_refero__input"
            >
              {dropdownOptions.map(dropdownOption => (
                <option key={selectId + dropdownOption.label} value={dropdownOption.value}>
                  {dropdownOption.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        </Validation>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </Collapse>
    </div>
  );
};

export default layoutChange(DropdownView);
