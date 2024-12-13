export enum ButtonType {
  submitButton = 'submitButton',
  draftButton = 'draftButton',
  cancelButton = 'cancelButton',
  pauseButton = 'pauseButton',
}
export interface ButtonOrder {
  1: ButtonType;
  2: ButtonType;
  3: ButtonType;
}

export const buttonOrderStepView: ButtonOrder = {
  1: ButtonType.pauseButton,
  2: ButtonType.submitButton,
  3: ButtonType.cancelButton,
};
export const buttonOrderNormalView: ButtonOrder = {
  1: ButtonType.submitButton,
  2: ButtonType.pauseButton,
  3: ButtonType.cancelButton,
};

export const buttonOrderMicrowebStep: ButtonOrder = {
  1: ButtonType.pauseButton,
  2: ButtonType.submitButton,
  3: ButtonType.cancelButton,
};
