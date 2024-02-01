import * as React from 'react';

import { Collapse } from 'react-collapse';
import { useForm } from 'react-hook-form';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface DropdownViewProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn?: boolean;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
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
    answer,
    handleChange,
    selected,
    // validateInput,
    resources,
    children,
    repeatButton,
    renderDeleteButton,
    renderOpenField,
    renderHelpButton,
    renderHelpElement,
    onRenderMarkdown,

    ...other
  } = props;
  if (!options) {
    return null;
  }

  const { register } = useForm();

  const dropdownOptions: HTMLOptionElement[] = options.map((o: Options) => {
    return new Option(o.label, o.type);
  });
  const selectId = getId(id);
  const labelText = getText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // showLabel={true}
  // onChangeValidator={validateInput}

  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
      <Collapse isOpened>
        <Validation {...other}>
          <Label
            htmlFor={selectId}
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
            afterLabelChildren={renderHelpButton()}
          />
          {renderHelpElement()}
          <Select
            {...register(selectId, {
              required: isRequired(item),
            })}
            selectId={selectId}
            name={selectId}
            required={isRequired(item)}
            value={selected ? selected[0] : undefined}
            errorText={getValidationTextExtension(item)}
            className="page_refero__input"
            onChange={(evt: React.ChangeEvent<HTMLSelectElement>): void => handleChange(evt.target.value)}
          >
            {dropdownOptions}
          </Select>
        </Validation>
        {shouldShowExtraChoice(answer) ? (
          <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>
        ) : (
          <React.Fragment />
        )}
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </Collapse>
    </div>
  );
};

export default layoutChange(DropdownView);
