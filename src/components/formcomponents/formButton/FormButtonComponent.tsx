import { Coding } from 'fhir/r4';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import BackButton from '@/components/formButtons/buttons/BackButton';
import { CancelFormButton } from '@/components/formButtons/buttons/CancelFormButton';
import NextButton from '@/components/formButtons/buttons/NextButton';
import { PauseFormButton } from '@/components/formButtons/buttons/PauseFormButton';
import { ReferoAnchorLink } from '@/components/formButtons/buttons/ReferoAnchorLink';
import { SubmitFormButton } from '@/components/formButtons/buttons/SubmitFormButton';
import { ReferoButtonTypes } from '@/constants/buttonTypes';
import { useButtonContext } from '@/context/ButtonContext';
// import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { isReadOnly } from '@/util';
import { getActionButtonGuidedActionCoding } from '@/util/extension';
export type Props = QuestionnaireComponentItemProps;

export const FormButtonComponent = (props: Props): JSX.Element | null => {
  const { idWithLinkIdAndItemIndex, children, linkId } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  // const answer = useGetAnswer(linkId, path);
  const buttonType = getActionButtonGuidedActionCoding(item);
  const { submitButtonProps, cancelButtonProps, saveButtonProps } = useButtonContext();
  const buttonText = item?.text || '';
  const isDisabled = isReadOnly(item);

  const getButtonBasedOnType = (buttonType: Coding | undefined): React.JSX.Element | null => {
    switch (buttonType?.code) {
      case ReferoButtonTypes.Save:
        return (
          <PauseFormButton
            pauseButtonText={buttonText}
            onPauseButtonClicked={saveButtonProps.onPauseButtonClicked}
            pauseButtonDisabled={isDisabled}
          />
        );
      case ReferoButtonTypes.Cancel:
        return <CancelFormButton cancelButtonText={buttonText} onCancelButtonClicked={cancelButtonProps.onCancelButtonClicked} />;
      case ReferoButtonTypes.Submit:
        return (
          <SubmitFormButton
            onSubmitButtonClicked={submitButtonProps?.onSubmitButtonClicked}
            submitButtonDisabled={isDisabled}
            submitButtonText={buttonText}
          />
        );
      case ReferoButtonTypes.Forward:
        return <NextButton text={buttonText} onNextButtonClicked={() => {}} disabled={isDisabled} />;
      case ReferoButtonTypes.Back:
        return <BackButton text={buttonText} onBackButtonClick={() => {}} disabled={isDisabled} />;
      case ReferoButtonTypes.ProceedInternal:
        return <ReferoAnchorLink text={buttonText} href={''} />;
      case ReferoButtonTypes.ProceedExternal:
        return <ReferoAnchorLink text={buttonText} href={''} />;
      default:
        return null;
    }
  };
  return (
    <div className={`page_refero_button`} data-testid={idWithLinkIdAndItemIndex}>
      {getButtonBasedOnType(buttonType)}
      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
export default FormButtonComponent;
