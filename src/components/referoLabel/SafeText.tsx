import styles from './safetext.module.css';

import { SanitizeText } from '@/util/sanitize/domPurifyHelper';
interface Props {
  text: string;
}

const SafeText = ({ text }: Props): JSX.Element => {
  return (
    <span
      className={styles.safetext}
      dangerouslySetInnerHTML={{
        __html: SanitizeText(text) ?? '',
      }}
    />
  );
};

export default SafeText;
