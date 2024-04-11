import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  children?: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class DropdownView extends React.Component<Props, Record<string, unknown>> {
  render(): JSX.Element | null {
    const {
      options,
      item,
      questionnaire,
      id,
      answer,
      handleChange,
      selected,
      resources,
      children,
      repeatButton,
      renderDeleteButton,
      renderOpenField,
      renderHelpButton,
      renderHelpElement,
      onRenderMarkdown,
      register,
    } = this.props;
    if (!options) {
      return null;
    }

    const labelText = getText(item, onRenderMarkdown, questionnaire, resources);
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    return (
      <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
        <FormGroup error={''} mode="ongrey">
          {renderHelpElement()}
          <Select
            {...register(item.linkId, {
              required: isRequired(item),
            })}
            selectId={getId(id)}
            className="page_refero__input"
            label={
              <Label
                htmlFor={getId(id)}
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
              <option key={getId(id) + option.label} value={option.type}>
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
  }
}

export default layoutChange(DropdownView);
