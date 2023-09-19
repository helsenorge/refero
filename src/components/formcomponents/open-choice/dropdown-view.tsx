import * as React from 'react';

import { Collapse } from 'react-collapse';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Options } from '../../../types/form types/radioGroupOptions';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Select from '@helsenorge/designsystem-react/components/Select';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import Label from '../label';
import SubLabel from '../sublabel';

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

class DropdownView extends React.Component<Props, {}> {
  render(): JSX.Element | null {
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
    } = this.props;
    if (!options) {
      return null;
    }
    const dropdownOptions: HTMLOptionElement[] = options.map((o: Options) => {
      return new Option(o.label, o.type);
    });
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    let placeholder;
    if (getPlaceholder(item)) {
      placeholder = new Option(getPlaceholder(item), '');
    } else if (resources) {
      placeholder = new Option(resources.selectDefaultPlaceholder, '');
    }

    //showLabel={true}
    //subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
    //onChange={(evt): void => handleChange((evt.target as HTMLInputElement).value)}
    //placeholder={placeholder}
    //onChangeValidator={validateInput}
    //helpButton={renderHelpButton()}
    //helpElement={renderHelpElement()}

    return (
      <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
        <Collapse isOpened>
          <Validation {...other}>
            <Select
              selectId={getId(id)}
              name={getId(id)}
              label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
              required={isRequired(item)}
              value={selected ? selected[0] : undefined}
              errorText={getValidationTextExtension(item)}
              className="page_refero__input"
              
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
  }
}

export default layoutChange(DropdownView);
