// import React from 'react';

// import { getHours, getMinutes } from 'date-fns';
// import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
// import { ThunkDispatch } from 'redux-thunk';

// import Label from '@helsenorge/designsystem-react/components/Label';

// import TimeInput from '@helsenorge/date-time/components/time-input';
// import * as DateTimeConstants from '@helsenorge/date-time/constants/datetime';

// import { NewValueAction, newTimeValueAsync } from '../../../actions/newValue';
// import { Extensions } from '../../../constants/extensions';
// import { GlobalState } from '../../../reducers';
// import { safeParseJSON } from '../../../util/date-fns-utils';
// import { getExtension, getValidationTextExtension } from '../../../util/extension';
// import { isReadOnly, isRequired, getId, getSublabelText, getLabelText } from '../../../util/index';
// import { Path } from '../../../util/refero-core';
// import { Resources } from '../../../util/resources';
// import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
// import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
// import SubLabel from '../sublabel';
// import TextView from '../textview';

// export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
//   value?: string;
//   answer: QuestionnaireResponseItemAnswer;
//   item: QuestionnaireItem;
//   questionnaire?: Questionnaire;
//   responseItem: QuestionnaireResponseItem;
//   resources?: Resources;
//   path: Array<Path>;
//   pdf?: boolean;
//   promptLoginMessage?: () => void;
//   id?: string;
//   renderFieldset?: boolean;
//   className?: string;
//   enable?: boolean;
//   renderDeleteButton: (className?: string) => JSX.Element | null;
//   repeatButton: JSX.Element;
//   renderHelpButton: () => JSX.Element;
//   renderHelpElement: () => JSX.Element;
//   onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
//   onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
// }
export const Time = () => <div />;
export default Time;
// class Time extends React.Component<Props> {
//   static defaultProps: Partial<Props> = {
//     renderFieldset: true,
//     path: [],
//   };

//   constructor(props: Props) {
//     super(props);

//     this.onTimeChange = this.onTimeChange.bind(this);
//     this.getValue = this.getValue.bind(this);
//   }

//   convertAnswerToString(answer: QuestionnaireResponseItemAnswer): string {
//     if (answer && answer.valueTime) {
//       return answer.valueTime;
//     }
//     if (answer && answer.valueDate) {
//       return this.getTimeStringFromDate(safeParseJSON(String(answer.valueDate)));
//     }
//     if (answer && answer.valueDateTime) {
//       return this.getTimeStringFromDate(safeParseJSON(String(answer.valueDateTime)));
//     }
//     return '';
//   }

//   getValue(): string | undefined {
//     const { value, answer } = this.props;
//     if (value) {
//       return value;
//     }
//     if (Array.isArray(answer)) {
//       return answer.map(m => this.convertAnswerToString(m)).join(', ');
//     }
//     return this.convertAnswerToString(answer);
//   }

//   getPDFValue(): string {
//     const value = this.getValue();
//     if (!value) {
//       let text = '';
//       if (this.props.resources && this.props.resources.ikkeBesvart) {
//         text = this.props.resources.ikkeBesvart;
//       }
//       return text;
//     }
//     return value;
//   }

//   getTimeStringFromDate(date: Date | undefined): string {
//     if (!date) {
//       return '';
//     }
//     const hours = getHours(date);
//     const minutes = getMinutes(date);
//     const formattedHours = String(hours).padStart(2, '0');
//     const formattedMinutes = String(minutes).padStart(2, '0');

//     return `${formattedHours}${DateTimeConstants.TIME_SEPARATOR}${formattedMinutes}`;
//   }

//   getMaxHour(): number {
//     const maxTime = getExtension(Extensions.MAX_VALUE_URL, this.props.item);
//     if (!maxTime) {
//       return 23;
//     }
//     const maxTimeString = String(maxTime.valueTime);
//     const hoursString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
//     return parseInt(hoursString, 10);
//   }

//   getMaxMinute(): number {
//     const maxTime = getExtension(Extensions.MAX_VALUE_URL, this.props.item);
//     if (!maxTime) {
//       return 59;
//     }
//     const maxTimeString = String(maxTime.valueTime);
//     const minuteString = (maxTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
//     return parseInt(minuteString, 10);
//   }

//   getMinHour(): number {
//     const minTime = getExtension(Extensions.MIN_VALUE_URL, this.props.item);
//     if (!minTime) {
//       return 0;
//     }
//     const minTimeString = String(minTime.valueTime);
//     const hoursString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[0];
//     return parseInt(hoursString, 10);
//   }

//   getMinMinute(): number {
//     const minTime = getExtension(Extensions.MIN_VALUE_URL, this.props.item);
//     if (!minTime) {
//       return 0;
//     }
//     const minTimeString = String(minTime.valueTime);
//     const minuteString = (minTimeString || '').split(DateTimeConstants.TIME_SEPARATOR)[1];
//     return parseInt(minuteString, 10);
//   }

//   dispatchNewTime(newTime: string): void {
//     const { dispatch, item, path, onAnswerChange } = this.props;
//     if (dispatch) {
//       dispatch(newTimeValueAsync(path, newTime, item))?.then(newState => onAnswerChange(newState, path, item, { valueTime: newTime }));
//     }
//   }

//   onTimeChange(newTime: string = ''): void {
//     const validTime = this.makeValidTime(newTime);

//     this.dispatchNewTime(validTime);
//     if (this.props.promptLoginMessage) {
//       this.props.promptLoginMessage();
//     }
//   }

//   makeValidTime(time: string): string {
//     const values = time.split(':');
//     const hours = values[0] || '00';
//     const minutes = values[1] || '00';
//     return this.addSeconds(`${hours.slice(-2)}:${minutes.slice(-2)}`);
//   }

//   addSeconds(time: string): string {
//     if (time !== '' && time.split(':').length === 2) {
//       return (time += ':00');
//     }
//     return time;
//   }

//   padNumber(value?: string): string {
//     if (value) {
//       const values = value.split(':');
//       let retVal = '';
//       for (let i = 0; i < values.length; i++) {
//         let timeString = '';
//         if (parseInt(values[i], 10) < 10 && values[i].length === 1) {
//           timeString += '0';
//         }
//         timeString += values[i];
//         if (i !== values.length - 1) {
//           timeString += ':';
//         }
//         retVal += timeString;
//       }
//       return retVal;
//     }
//     return '';
//   }

//   getResetButtonText(): string {
//     if (this.props.resources && this.props.resources.resetTime) {
//       return this.props.resources.resetTime;
//     }
//     return '';
//   }

//   shouldComponentUpdate(nextProps: Props): boolean {
//     const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
//     const answerHasChanged = this.props.answer !== nextProps.answer;
//     const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
//     const repeats = this.props.item.repeats ?? false;

//     return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
//   }

//   render(): JSX.Element | null {
//     const { pdf, item, renderFieldset, id, onRenderMarkdown } = this.props;
//     const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources);

//     if (pdf || isReadOnly(this.props.item)) {
//       const value = this.getPDFValue();
//       if (renderFieldset) {
//         return (
//           <TextView
//             id={id}
//             item={this.props.item}
//             value={this.padNumber(value)}
//             onRenderMarkdown={onRenderMarkdown}
//             helpButton={this.props.renderHelpButton()}
//             helpElement={this.props.renderHelpElement()}
//           >
//             {this.props.children}
//           </TextView>
//         );
//       } else if (value) {
//         return (
//           <span>
//             {', kl. '} {this.padNumber(value)}
//           </span>
//         );
//       }
//       return <span />;
//     }

//     return (
//       <div className="page_refero__component page_refero__component_time">
//         <TimeInput
//           {...this.props.register(this.props.item.linkId, {
//             required: isRequired(this.props.item),
//           })}
//           id={getId(id)}
//           value={this.getValue()}
//           legend={
//             <Label
//               labelTexts={[
//                 { text: getLabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources) },
//               ]}
//             />
//           }
//           subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
//           isRequired={isRequired(item)}
//           maxHour={this.getMaxHour()}
//           minHour={this.getMinHour()}
//           maxMinute={this.getMaxMinute()}
//           minMinute={this.getMinMinute()}
//           onBlur={this.onTimeChange}
//           className={this.props.className + ' page_refero__input'}
//           renderFieldset={this.props.renderFieldset}
//           errorMessage={getValidationTextExtension(item)}
//           resetButton={{
//             resetButtonText: this.getResetButtonText(),
//             onReset: this.onTimeChange,
//           }}
//           helpButton={this.props.renderHelpButton()}
//           helpElement={this.props.renderHelpElement()}
//         />
//         {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
//         {this.props.repeatButton}
//         {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
//       </div>
//     );
//   }
// }
// const withFormProps = ReactHookFormHoc(Time);
// const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
// export default withCommonFunctionsComponent;
