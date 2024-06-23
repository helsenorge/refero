// import React from 'react';

// import { format } from 'date-fns';
// import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireItemInitial } from 'fhir/r4';

// import { LanguageLocales } from '@helsenorge/core-utils/constants/languages';
// // import { DateRangePicker } from '@helsenorge/date-time/components/date-range-picker';
// // import { DatePickerErrorPhrases } from '@helsenorge/date-time/components/date-range-picker/date-range-picker-types';

// import Constants from '../../../constants/index';
// import { safeParseJSON } from '../../../util/date-fns-utils';
// import { getValidationTextExtension } from '../../../util/extension';
// import { isReadOnly } from '../../../util/index';
// import { Resources } from '../../../util/resources';
// import { FormProps } from '../../../validation/ReactHookFormHoc';
// import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
// import TextView from '../textview';

// interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
//   id?: string;
//   pdf?: boolean;
//   item: QuestionnaireItem;
//   resources?: Resources;
//   locale: LanguageLocales.ENGLISH | LanguageLocales.NORWEGIAN;
//   label?: JSX.Element;
//   subLabel?: JSX.Element;
//   datepickerRef: React.RefObject<any>;
//   helpButton?: JSX.Element;
//   helpElement?: JSX.Element;
//   onDateValueChange: (newValue: string) => void;
//   onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
//   validationErrorRenderer?: JSX.Element;
//   className?: string;
//   maxDate?: Date;
//   minDate?: Date;
//   answer: QuestionnaireResponseItemAnswer;
// }

export const DateDayInput = () => <div />;
export default DateDayInput;
// export class DateDayInput extends React.Component<Props> {
//   getDatepickerErrorPhrases(): DatePickerErrorPhrases {
//     const { resources, item } = this.props;
//     // Vi får maks én valideringstekst, derfor settes alle til denne.
//     const validationErrorText = getValidationTextExtension(item);

//     return {
//       errorInvalidDate: validationErrorText ? validationErrorText : resources?.filterDateErrorDateFormat || '',
//       errorAfterMaxDate: resources?.errorAfterMaxDate || '',
//       errorBeforeMinDate: resources?.errorBeforeMinDate || '',
//       errorInvalidDateRange: '',
//       errorRequiredDate: resources?.dateRequired || '',
//       errorRequiredDateRange: '',
//       errorInvalidMinimumNights: '',
//     };
//   }

//   getDateAnswerValue(answer: QuestionnaireResponseItemAnswer | QuestionnaireItemInitial): string | undefined {
//     if (answer && answer.valueDate) {
//       return answer.valueDate;
//     }
//     if (answer && answer.valueDateTime) {
//       return answer.valueDateTime;
//     }
//   }

//   getValue(): (Date | undefined)[] | undefined {
//     const { item, answer } = this.props;

//     if (answer && Array.isArray(answer)) {
//       return answer.map(m => safeParseJSON(String(this.getDateAnswerValue(m))));
//     }

//     if (Array.isArray(item.initial)) {
//       return item.initial.map(m => safeParseJSON(String(this.getDateAnswerValue(m))));
//     }

//     if (answer) {
//       const parsedDate = [safeParseJSON(String(this.getDateAnswerValue(answer)))];
//       if (this.isValidDate(parsedDate[0]) === true) {
//         return parsedDate;
//       } else {
//         return undefined;
//       }
//     }
//   }

//   isValidDate = (date: Date | undefined): boolean => {
//     if (date instanceof Date) {
//       const text = Date.prototype.toString.call(date);
//       return text !== 'Invalid Date';
//     }
//     return false;
//   };

//   // toLocaleDate(moment: Moment | undefined): Moment | undefined {
//   //   return moment ? moment.locale(this.getLocaleFromLanguage()) : undefined;
//   // }

//   onDateChange = (value: Date | null): void => {
//     const newValue = value ? format(value, Constants.DATE_FORMAT) : '';
//     this.props.onDateValueChange(newValue);
//   };

//   getPDFValue = (): string => {
//     const date = this.getValue();
//     const ikkeBesvartText = this.props.resources?.ikkeBesvart || '';

//     return date ? date.map(d => d && format(d, 'd. MMMM yyyy')).join(', ') : ikkeBesvartText;
//   };

//   getSingleDateValue = (): Date | undefined => {
//     const date = this.getValue();
//     return date ? safeParseJSON(date[0]) : undefined;
//   };

//   render(): JSX.Element {
//     if (this.props.pdf || isReadOnly(this.props.item)) {
//       return (
//         <TextView
//           id={this.props.id}
//           item={this.props.item}
//           value={this.getPDFValue()}
//           onRenderMarkdown={this.props.onRenderMarkdown}
//           helpButton={this.props.helpButton}
//           helpElement={this.props.helpElement}
//         >
//           {this.props.children}
//         </TextView>
//       );
//     }

//     return <></>;
//   }
// }
