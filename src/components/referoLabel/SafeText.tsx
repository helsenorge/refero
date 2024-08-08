import styles from './safetext.module.css';

import { SanitizeText } from '@/util/sanitize/domPurifyHelper';

type SafeTextOwnProps<E extends React.ElementType = React.ElementType> = {
  text: string;
  as?: E;
};

type SafeTextProps<E extends React.ElementType> = SafeTextOwnProps<E> & Omit<React.ComponentProps<E>, keyof SafeTextOwnProps | 'children'>;

const __DEFAULT_ELEMENT__ = 'h2';

function SafeText<E extends React.ElementType = typeof __DEFAULT_ELEMENT__>({ text, as, ...props }: SafeTextProps<E>): JSX.Element {
  const Component = as || __DEFAULT_ELEMENT__;
  return (
    <Component
      {...props}
      className={props.className ? props.className : styles.safetext}
      dangerouslySetInnerHTML={{
        __html: SanitizeText(text) ?? '',
      }}
    />
  );
}

export default SafeText;
