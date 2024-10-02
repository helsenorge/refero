import { QuestionnaireItem } from 'fhir/r4';
import TextView from '../textview';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import { FieldError } from 'react-hook-form';
import { getValidationTextExtension } from '@/util/extension';

type Props = {
  pdf?: boolean;
  id?: string;
  item?: QuestionnaireItem;
  pdfValue?: string | number;
  errors: FieldError | undefined;
  children?: React.ReactNode;
};

export const ReadOnly = ({ pdf, id, item, pdfValue, children, errors }: Props): JSX.Element => {
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
        <TextView id={id} item={item} value={pdfValue}>
          {children}
        </TextView>
      ) : (
        <FormGroup error={getErrorText(errors)}>
          <TextView id={id} item={item} value={pdfValue}>
            {children}
          </TextView>
        </FormGroup>
      )}
    </>
  );
};
