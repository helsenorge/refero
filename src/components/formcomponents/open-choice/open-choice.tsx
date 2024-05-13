import * as React from 'react';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Resource,
  Coding,
  QuestionnaireResponseItem,
  ValueSet,
  Questionnaire,
} from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { AutoSuggestProps } from '../../../types/autoSuggestProps';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import CheckboxView from './checkbox-view';
import DropdownView from './dropdown-view';
import RadioView from './radio-view';
import TextField from './text-field';
import {
  NewValueAction,
  removeCodingValueAsync,
  newCodingValueAsync,
  newCodingStringValueAsync,
  removeCodingStringValueAsync,
} from '../../../actions/newValue';
import { OPEN_CHOICE_ID, OPEN_CHOICE_SYSTEM } from '../../../constants';
import ItemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { isReadOnly, isDataReceiver } from '../../../util';
import {
  getOptions,
  shouldShowExtraChoice,
  getDisplay,
  getSystem,
  getIndexOfAnswer,
  getItemControlValue,
  hasCanonicalValueSet,
  hasOptions,
  isAboveDropdownThreshold,
} from '../../../util/choice';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import SliderView from '../choice/slider-view';
import AutosuggestView from '../choice-common/autosuggest-view';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer | QuestionnaireResponseItemAnswer[];
  questionnaire?: Questionnaire;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  resources?: Resources;
  containedResources?: Resource[];
  renderDeleteButton: () => JSX.Element | null;
  headerTag?: number;
  responseItem: QuestionnaireResponseItem;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  fetchValueSet?: (
    searchString: string,
    item: QuestionnaireItem,
    successCallback: (valueSet: ValueSet) => void,
    errorCallback: (error: string) => void
  ) => void;
  autoSuggestProps?: AutoSuggestProps;
  children: JSX.Element;
}

export class OpenChoice extends React.Component<Props> {
  getDataReceiverValue = (answer: Array<QuestionnaireResponseItemAnswer>): (string | undefined)[] => {
    return answer
      .filter(f => f.valueCoding?.code !== OPEN_CHOICE_ID)
      .map((el: QuestionnaireResponseItemAnswer) => {
        if (el && el.valueCoding) {
          return el.valueCoding.display;
        }
        if (el && el.valueString) {
          return el.valueString;
        }
      });
  };

  getPDFValue = (item: QuestionnaireItem, answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string => {
    const { resources, containedResources } = this.props;

    if (isDataReceiver(item)) {
      return this.getDataReceiverValue(answer as Array<QuestionnaireResponseItemAnswer>).join(', ');
    }

    const value = this.getValue(item, answer);
    if (!value) {
      let text = '';
      if (resources && resources.ikkeBesvart) {
        text = resources.ikkeBesvart;
      }
      return text;
    }

    const displayValues = value
      .filter(el => el !== OPEN_CHOICE_ID)
      .map(el => getDisplay(getOptions(resources, item, containedResources), el));
    const openValue = this.getOpenValue(answer);
    if (openValue) {
      displayValues.push(openValue);
    }

    return displayValues.join(', ');
  };

  getOpenValue = (answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer): string | undefined => {
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i];
        if (el.valueString) {
          return el.valueString;
        }
      }
    }

    return;
  };

  getValue = (
    item: QuestionnaireItem,
    answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer
  ): (string | undefined)[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map((el: QuestionnaireResponseItemAnswer) => {
        if (el) {
          if (el.valueCoding && el.valueCoding.code) {
            return el.valueCoding.code;
          }
        }
      });
    } else if (answer && !Array.isArray(answer) && answer.valueCoding && answer.valueCoding.code) {
      if (answer.valueCoding?.code === item.initial?.[0].valueCoding?.code && answer.valueCoding?.display === undefined) {
        this.resetInitialAnswer(answer.valueCoding.code);
      }
      return [answer.valueCoding.code];
    }
    const initialSelectedOption = item.answerOption?.filter(x => x.initialSelected);
    if (initialSelectedOption && initialSelectedOption.length > 0) {
      return [initialSelectedOption[0].valueCoding?.code];
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueCoding || !item.initial[0].valueCoding.code) {
      return undefined;
    }
    return [String(item.initial[0].valueCoding.code)];
  };

  handleStringChangeEvent = (event: React.FocusEvent<HTMLInputElement, Element>): void => {
    const value = event.target.value;
    this.handleStringChange(value);
  };

  handleStringChange = (value: string): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    if (dispatch) {
      if (value.length > 0) {
        dispatch(newCodingStringValueAsync(this.props.path, value, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
        );
      } else {
        dispatch(removeCodingStringValueAsync(this.props.path, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  getAnswerValueCoding = (code: string, systemArg?: string, displayArg?: string): Coding => {
    const display = displayArg
      ? displayArg
      : getDisplay(getOptions(this.props.resources, this.props.item, this.props.containedResources), code);
    const valueSetSystem = code === OPEN_CHOICE_ID ? OPEN_CHOICE_SYSTEM : getSystem(this.props.item, code, this.props.containedResources);
    const system = systemArg ? systemArg : valueSetSystem;
    return { code, display, system } as Coding;
  };

  resetInitialAnswer = (code: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }
      dispatch(newCodingValueAsync(path, coding, item, true))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  handleCheckboxChange = (code?: string): void => {
    const { dispatch, answer, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      if (getIndexOfAnswer(code, answer) > -1) {
        dispatch(removeCodingValueAsync(this.props.path, coding, item))?.then(newState =>
          onAnswerChange(newState, path, item, responseAnswer)
        );

        if (promptLoginMessage) {
          promptLoginMessage();
        }
      } else {
        dispatch(newCodingValueAsync(this.props.path, coding, this.props.item, true))?.then(newState =>
          onAnswerChange(newState, path, item, responseAnswer)
        );
        if (promptLoginMessage) {
          promptLoginMessage();
        }
      }

      this.interceptHandler(coding, getItemControlValue(item));
    }
  };

  clearCodingAnswer = (coding: Coding): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch) {
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(removeCodingValueAsync(path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  handleChange = (code?: string, systemArg?: string, displayArg?: string): void => {
    const { dispatch, promptLoginMessage, item, onAnswerChange, path } = this.props;
    if (dispatch && code) {
      const coding = this.getAnswerValueCoding(code, systemArg, displayArg);
      const responseAnswer = { valueCoding: coding } as QuestionnaireResponseItemAnswer;
      dispatch(newCodingValueAsync(this.props.path, coding, item))?.then(newState => onAnswerChange(newState, path, item, responseAnswer));
      if (promptLoginMessage) {
        promptLoginMessage();
      }

      this.interceptHandler(coding, getItemControlValue(item));
    }
  };

  interceptHandler = (coding: Coding, type: string | undefined): void => {
    switch (type) {
      case ItemControlConstants.CHECKBOX:
        return this.multiValueHandler(coding);
      default:
        return this.singleValueHandler(coding);
    }
  };

  singleValueHandler = (coding: Coding): void => {
    const { dispatch, item, path, onAnswerChange } = this.props;

    if (dispatch) {
      if (coding.code !== OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }
  };

  multiValueHandler = (coding: Coding): void => {
    const { dispatch, item, path, answer, onAnswerChange } = this.props;

    if (dispatch) {
      const isShown = shouldShowExtraChoice(answer);

      if (isShown && coding.code === OPEN_CHOICE_ID) {
        dispatch(removeCodingStringValueAsync(path, item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueString: '' } as QuestionnaireResponseItemAnswer)
        );
      }
    }
  };

  renderTextField(): JSX.Element {
    const { id, pdf, item, answer, onRenderMarkdown, ...other } = this.props;

    let a: QuestionnaireResponseItemAnswer = {};
    if (Array.isArray(answer)) {
      for (let i = 0; i < answer.length; i++) {
        const el = answer[i] as QuestionnaireResponseItemAnswer;
        if (el.valueString) {
          a = el;
          break;
        }
      }
    } else {
      a = answer;
    }

    return (
      <TextField
        id={id}
        pdf={pdf}
        item={item}
        answer={a}
        handleStringChange={this.handleStringChangeEvent}
        handleChange={this.handleStringChange}
        onRenderMarkdown={onRenderMarkdown}
        resources={this.props.resources}
        {...other}
      />
    );
  }

  renderCheckbox = (options: Array<Options> | undefined): JSX.Element => {
    return (
      <CheckboxView
        options={options}
        id={this.props.id}
        handleChange={this.handleCheckboxChange}
        selected={this.getValue(this.props.item, this.props.answer)}
        renderOpenField={(): JSX.Element => this.renderTextField()}
        onRenderMarkdown={this.props.onRenderMarkdown}
        {...this.props}
      >
        {this.props.children}
      </CheckboxView>
    );
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const repeats = this.props.item.repeats ?? false;
    const error = this.props.error !== nextProps.error;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || error;
  }
  renderComponentBasedOnType = (): JSX.Element | null => {
    const { resources, item, containedResources, answer } = this.props;
    const itemControlValue = getItemControlValue(item);
    if (!itemControlValue) {
      return null;
    }
    const options = getOptions(resources, item, containedResources);

    const commonProps = {
      handleChange: this.handleChange,
      selected: this.getValue(item, answer),
      renderOpenField: this.renderTextField,
      ...this.props,
    };

    const componentMap = {
      [ItemControlConstants.DROPDOWN]: <DropdownView options={options} {...commonProps} />,
      [ItemControlConstants.CHECKBOX]: <CheckboxView options={options} {...commonProps} />,
      [ItemControlConstants.RADIOBUTTON]: <RadioView options={options} {...commonProps} />,
      [ItemControlConstants.SLIDER]: <SliderView {...commonProps} />,
    };

    return componentMap[itemControlValue];
  };
  render(): JSX.Element | null {
    const { id, item, pdf, answer, containedResources, children, onRenderMarkdown, resources } = this.props;
    const hasOptionsAndNoCanonicalValueSet = hasOptions(resources, item, containedResources) && !hasCanonicalValueSet(item);
    const options = getOptions(resources, item, containedResources);
    const aboveDropdownThreshold = isAboveDropdownThreshold(options);
    const itemControlValue = getItemControlValue(item);
    const shouldRenderAutosuggest = hasCanonicalValueSet(item) && itemControlValue === ItemControlConstants.AUTOCOMPLETE;
    const getValue = this.getValue(item, answer);
    if (pdf || isReadOnly(item)) {
      return (
        <TextView id={id} item={item} value={this.getPDFValue(item, answer)} onRenderMarkdown={onRenderMarkdown}>
          {children}
        </TextView>
      );
    }

    return (
      <React.Fragment>
        {hasOptionsAndNoCanonicalValueSet ? (
          itemControlValue ? (
            this.renderComponentBasedOnType()
          ) : aboveDropdownThreshold ? (
            <DropdownView
              options={options}
              handleChange={this.handleChange}
              selected={getValue}
              renderOpenField={(): JSX.Element => this.renderTextField()}
              {...this.props}
            >
              {children}
            </DropdownView>
          ) : (
            <RadioView
              options={options}
              handleChange={this.handleChange}
              selected={getValue}
              renderOpenField={(): JSX.Element => this.renderTextField()}
              {...this.props}
            >
              {children}
            </RadioView>
          )
        ) : shouldRenderAutosuggest ? (
          <AutosuggestView
            handleChange={this.handleChange}
            clearCodingAnswer={this.clearCodingAnswer}
            handleStringChange={this.handleStringChange}
            {...this.props}
          >
            {children}
          </AutosuggestView>
        ) : null}
      </React.Fragment>
    );
  }
}
const withFormProps = ReactHookFormHoc(OpenChoice);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedStringComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedStringComponent;
