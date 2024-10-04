import { QuestionnaireItem } from 'fhir/r4';
import TextView from '../textview';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { FieldError } from 'react-hook-form';
import { getValidationTextExtension } from '@/util/extension';
import { getId } from '@/util';

type Props = {
  pdf?: boolean;
  id?: string;
  item?: QuestionnaireItem;
  pdfValue?: string | number;
  errors?: FieldError;
  textClass?: string;
  children?: React.ReactNode;
};

export const ReadOnly = ({ pdf, id, item, pdfValue, children, errors, textClass }: Props): JSX.Element => {
  const getErrorText = (error: FieldError | undefined): string | undefined => {
    if (error) {
      const validationTextExtension = getValidationTextExtension(item);
      if (validationTextExtension) {
        return validationTextExtension;
      }
      return error.message;
    }
  };

  return (
    <>
      {pdf ? (
        <TextView id={id} testId={`${getId(id)}-pdf`} item={item} value={pdfValue} textClass={textClass}>
          {children}
        </TextView>
      ) : (
        <FormGroup error={getErrorText(errors)}>
          <TextView id={id} testId={`${getId(id)}-readonly`} item={item} value={pdfValue} textClass={textClass}>
            {children}
          </TextView>
        </FormGroup>
      )}
    </>
  );
};
