enum ButtonType {
  submitButton = "submitButton",
  draftButton = "draftButton",
  cancelButton = "cancelButton",
  pauseButton = "pauseButton"
}
interface ButtonOrder {
  1: ButtonType;
  2: ButtonType;
  3: ButtonType;
  4: ButtonType;
}

export const buttonOrderStepView: ButtonOrder = {
  1: ButtonType.pauseButton,
  2: ButtonType.submitButton,
  3: ButtonType.cancelButton,
  4: ButtonType.draftButton,
};
export const buttonOrderNormalView: ButtonOrder = {
  1: ButtonType.submitButton,
  2: ButtonType.pauseButton,
  3: ButtonType.cancelButton,
  4: ButtonType.draftButton,
};