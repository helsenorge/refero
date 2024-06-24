import DOMPurify from 'dompurify';

import styles from './safetext.module.css';
interface Props {
  text: string;
}

const SafeText = ({ text }: Props): JSX.Element => {
  return (
    <span
      className={styles.safetext}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(text),
      }}
    />
  );
};

export default SafeText;
