export enum ButtonType {
  submitButton = 'submitButton',
  cancelButton = 'cancelButton',
  pauseButton = 'pauseButton',
  redirect = 'redirectButton',
  nextButton = 'nextButton',
  backButton = 'backButton',
}
export interface ButtonOrder {
  1: ButtonType;
  2: ButtonType;
  3: ButtonType;
  4: ButtonType;
  5?: ButtonType;
  6?: ButtonType;
}

export const buttonOrderStepView: ButtonOrder = {
  1: ButtonType.pauseButton,
  2: ButtonType.submitButton,
  3: ButtonType.cancelButton,
  4: ButtonType.redirect,
};
export const buttonOrderNormalView: ButtonOrder = {
  1: ButtonType.submitButton,
  2: ButtonType.pauseButton,
  3: ButtonType.cancelButton,
  4: ButtonType.redirect,
};

export const buttonOrderMicrowebStep: ButtonOrder = {
  1: ButtonType.pauseButton,
  2: ButtonType.submitButton,
  3: ButtonType.cancelButton,
  4: ButtonType.redirect,
};
