import * as React from 'react';

import { Collapse } from 'react-collapse';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Select from '@helsenorge/designsystem-react/components/Select';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { useForm } from 'react-hook-form';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
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

const DropdownView: React.FC<Props> = (props) => {
    const {
      options,
      item,
      questionnaire,
      id,
      answer,
      handleChange,
      selected,
      validateInput,
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
    const labelText = getText(item, onRenderMarkdown, questionnaire, resources);
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    let placeholder;
    if (getPlaceholder(item)) {
      placeholder = new Option(getPlaceholder(item), '');
    } else if (resources) {
      placeholder = new Option(resources.selectDefaultPlaceholder, '');
    }

    // showLabel={true}
    // onChangeValidator={validateInput}

    return (
      <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
        <Collapse isOpened>
          <Validation {...other}>
            <Select
              {...register("dropdownView_openChoice")}
              selectId={getId(id)}
              name={getId(id)}
              label={
                <Label
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={
                    <>
                      {renderHelpButton()}
                    </>
                  }
                />
              }
              required={isRequired(item)}
              value={selected ? selected[0] : undefined}
              errorText={getValidationTextExtension(item)}
              className="page_refero__input"
              onChange={(evt): void => handleChange(evt.target.value)}
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
          {props.renderHelpElement()}
        </Collapse>
      </div>
    );
}

export default layoutChange(DropdownView);
