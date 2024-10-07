export interface StepProps {
  isMicroweb: boolean;
  isMicrowebStep: boolean;
  nextBtnTitle?: string;
  backBtnTitle?: string;
  cancelBtnTitle?: string;
  showCancelBtn: boolean;
  documentGuid?: string;
  onStepProcessCancel?: () => void;
  onStepProcessBack?: () => void;
  onStepProcessForward?: () => void;
}