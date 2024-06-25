import React, { useEffect, useRef } from 'react';

import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';

import { Resources } from '../../util/resources';
import SafeText from '../referoLabel/SafeText';

import styles from './validationSummary.module.css';

import { GlobalState } from '@/reducers';
import { FormData, FormDefinition, getFormData, getFormDefinition } from '@/reducers/form';
import { getText } from '@/util';
import { getQuestionnaireDefinitionItem, getResponseItemAndPathWithLinkId } from '@/util/refero-core';

type ValidationSummaryProps = {
  resources: Resources;
};
type StateProps = {
  formDefinition: FormDefinition | null;
  formData: FormData | null;
};

type Props = ValidationSummaryProps & StateProps;

const ValidationSummary = ({ resources, formData, formDefinition }: Props): JSX.Element | null => {
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const { setFocus, formState } = useFormContext();
  const { submitCount, errors } = formState;
  const errorArray = Object.entries(errors);

  const handleErrorButtonClicked = (e: React.MouseEvent<HTMLButtonElement>, fieldName: string): void => {
    e.preventDefault();
    setFocus(fieldName, {
      shouldSelect: true,
    });
  };

  const getItemFromErrorKeys = (
    errors: FieldErrors<FieldValues>,
    formData?: FormData | null
  ): {
    item: QuestionnaireResponseItem;
    fieldName: string;
  }[] => {
    const items: {
      item: QuestionnaireResponseItem;
      fieldName: string;
    }[] = [];
    if (formData !== null && formData !== undefined && errors !== undefined) {
      errorArray.forEach(([fieldName]) => {
        if (formData?.Content) {
          let linkId;
          const isExtraField = fieldName.includes('-extra-field');
          const isRepeated = fieldName.includes('^');
          if (isExtraField) {
            linkId = fieldName.split('-extra-field')[0];
          } else if (isRepeated) {
            linkId = fieldName.split('^')[0];
          } else {
            linkId = fieldName;
          }
          const itm = getResponseItemAndPathWithLinkId(linkId, formData.Content);
          if (itm) {
            items.push({ item: itm[0].item, fieldName });
          }
        }
      });
    }
    return items;
  };
  const getItemTextFromErrors = (
    errors: FieldErrors<FieldValues>,
    formData: FormData | null
  ): { text: string; linkId: string; fieldName: string }[] => {
    const data = getItemFromErrorKeys(errors, formData);
    const qItems = data
      .map(({ item, fieldName }) => ({ qitem: getQuestionnaireDefinitionItem(item.linkId, formDefinition?.Content?.item), fieldName }))
      .filter(({ qitem }) => qitem !== null && qitem !== undefined) as { qitem: QuestionnaireItem; fieldName: string }[];

    return qItems.map(({ fieldName, qitem }) => ({ text: getText(qitem), linkId: qitem.linkId, fieldName }));
  };

  useEffect(() => {
    if (errorSummaryRef && errorSummaryRef.current && submitCount > 0 && Object.keys(errors).length > 0) {
      errorSummaryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [submitCount, errors]);
  const allErrors = getItemTextFromErrors(errors, formData);
  return errorArray.length > 0 ? (
    <div ref={errorSummaryRef}>
      <ol className={styles.validationSummary_list}>
        <h3 className={styles.validationSummary_header}>{resources.validationSummaryHeader}</h3>
        {errorArray &&
          allErrors.map(({ linkId, text, fieldName }) => (
            <li className={styles.validationSummary_listItem} key={linkId}>
              <button className={styles.validationSummary_button} onClick={(e): void => handleErrorButtonClicked(e, fieldName)}>
                <SafeText text={text} />
              </button>
            </li>
          ))}
      </ol>
    </div>
  ) : null;
};
const ValidationSummaryComponent = connect(
  (state: GlobalState): StateProps => ({
    formDefinition: getFormDefinition(state),
    formData: getFormData(state),
  }),
  {}
)(ValidationSummary);
export { ValidationSummaryComponent };
export default ValidationSummaryComponent;
