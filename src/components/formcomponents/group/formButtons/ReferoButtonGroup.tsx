import styles from './formGroupStyle.module.css';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
export const ReferoButtonGroup = (props: QuestionnaireComponentItemProps): React.JSX.Element | null => {
  return <div className={`page_refero_button_group ${styles.buttonGroup}`}>{props.children}</div>;
};
