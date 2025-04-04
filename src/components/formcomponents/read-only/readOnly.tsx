import { useEffect } from 'react';

import { Attachment, QuestionnaireItem } from 'fhir/r4';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import TextView from '../textview';

import { getErrorMessage } from '@/components/validation/rules';
import { getId, shouldValidateReadOnly } from '@/util';

type Props = {
  pdf?: boolean;
  id?: string;
  idWithLinkIdAndItemIndex?: string;
  item?: QuestionnaireItem;
  value?: string | (string | undefined)[] | number | number[] | Attachment | Attachment[] | undefined;
  pdfValue?: string | number;
  errors?: FieldError;
  textClass?: string;
  children?: React.ReactNode;
};

export const ReadOnly = ({ pdf, id, idWithLinkIdAndItemIndex, item, value, pdfValue, children, errors, textClass }: Props): JSX.Element => {
  const { setValue } = useFormContext<FieldValues>();

  useEffect(() => {
    if (idWithLinkIdAndItemIndex && shouldValidateReadOnly(item)) {
      setValue(idWithLinkIdAndItemIndex, value);
    }
  }, [value]);

  if (pdf) {
    return (
      <TextView id={id} testId={`${getId(id)}-pdf`} item={item} value={pdfValue} textClass={textClass}>
        {children}
      </TextView>
    );
  } else if (shouldValidateReadOnly(item)) {
    return (
      <FormGroup error={getErrorMessage(item, errors)}>
        <TextView id={id} testId={`${getId(id)}-readonly`} item={item} value={pdfValue} textClass={textClass}>
          {children}
        </TextView>
      </FormGroup>
    );
  } else {
    return (
      <TextView id={id} testId={`${getId(id)}-readonly`} item={item} value={pdfValue} textClass={textClass}>
        {children}
      </TextView>
    );
  }
};
