import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
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
import { shouldShowExtraChoice } from '../../../util/choice';
import { getId, getSublabelText, getText } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';

interface DropdownViewProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
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
  children?: React.ReactNode;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  path: Path[];
}

const DropdownView = ({
  options,
  item,
  id,
  answer,
  handleChange,
  selected,
  path,
  resources,
  children,
  repeatButton,
  renderDeleteButton,
  renderOpenField,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
}: DropdownViewProps): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const questionnaire = useSelector<GlobalState, Questionnaire | undefined | null>(state => getFormDefinition(state)?.Content);
  const selectId = getId(id);
  const labelText = getText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
      {renderHelpElement()}
      <FormGroup error={error?.message} mode="ongrey">
        <Select
          {...register(formId)}
          selectId={selectId}
          className="page_refero__input"
          label={
            <Label
              htmlFor={selectId}
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          onChange={(e): void => {
            handleChange(e.target.value);
          }}
          value={selected && selected[0] ? selected[0] : undefined}
        >
          <option value={undefined}>{resources?.selectDefaultPlaceholder || ''}</option>
          {options.map(option => (
            <option key={selectId + option.label} value={option.type}>
              {option.label}
            </option>
          ))}
        </Select>
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      </FormGroup>

      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DropdownView);
