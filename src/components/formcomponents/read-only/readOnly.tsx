import { Attachment, QuestionnaireItem } from 'fhir/r4';
import TextView from '../textview';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { FieldError, FieldValues, useFormContext } from 'react-hook-form';
import { getValidationTextExtension } from '@/util/extension';
import { getId, shouldValidateReadOnly } from '@/util';
import { useEffect } from 'react';

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

  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
      return error.message;
    }
  };

  if (pdf) {
    return (
      <TextView id={id} testId={`${getId(id)}-pdf`} item={item} value={pdfValue} textClass={textClass}>
        {children}
      </TextView>
    );
  } else if (shouldValidateReadOnly(item)) {
    return (
      <FormGroup error={getErrorText(errors)}>
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
