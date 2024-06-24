import DOMPurify from 'dompurify';

interface Props {
  subLabelText: string;
  id?: string;
  testId?: string;
}

const SubLabel = ({ subLabelText, id, testId }: Props): JSX.Element | null => {
  return (
    <span
      data-testid={testId}
      className="page_refero__sublabel"
      id={id}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(subLabelText, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'] }) as unknown as string,
      }}
    />
  );
};

export default SubLabel;
