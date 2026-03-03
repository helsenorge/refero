import { memo, useMemo } from 'react';

import styles from './safetext.module.css';

import { SanitizeText } from '@/util/sanitize/domPurifyHelper';

type SafeTextOwnProps<E extends React.ElementType = React.ElementType> = {
  text: string;
  safeTextId?: string;
  as?: E;
};

type SafeTextProps<E extends React.ElementType> = SafeTextOwnProps<E> & Omit<React.ComponentProps<E>, keyof SafeTextOwnProps | 'children'>;

const __DEFAULT_ELEMENT__ = 'h2';

function SafeText<E extends React.ElementType = typeof __DEFAULT_ELEMENT__>({
  text,
  safeTextId,
  as,
  ...props
}: SafeTextProps<E>): React.JSX.Element {
  const Component = as || __DEFAULT_ELEMENT__;
  const sanitizedText = useMemo(() => SanitizeText(text), [text]);
  return (
    <Component
      {...props}
      id={safeTextId}
      className={props.className ? props.className : styles.safetext}
      dangerouslySetInnerHTML={{
        __html: sanitizedText,
      }}
    />
  );
}

export default memo(SafeText);
