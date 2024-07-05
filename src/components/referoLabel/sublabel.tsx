import SafeText from './SafeText';

interface Props {
  subLabelText: string;
  id?: string;
  testId?: string;
}

const SubLabel = ({ subLabelText, id, testId }: Props): JSX.Element | null => {
  return (
    <SafeText as='span' id={id} data-testid={testId} className='page_refero__sublabel' text={subLabelText} />

  );
};

export default SubLabel;
