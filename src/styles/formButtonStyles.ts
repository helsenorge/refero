export const formButtonsWrapper = `
    .formButtonsWrapper {
      position: sticky;
      bottom: 0px;
      padding: 15px; 
      background-color: white;
    }
    @media (max-width: 563px) {
      .formButtonsWrapper {
        position: relative;
      }
    }
  `;

export const submitButtonStyle = `
    .submitButtonStyle {
      display: inline-block; 
      margin-right: 15px;
    }
    @media (max-width: 563px) {
      .submitButtonStyle {
        display: block;
        margin-bottom: 15px;
      }
    }
  `;

export const pauseButtonStyle = `
    .pauseButtonStyle {
      display: inline-block; 
      margin-right: 15px;
    }
  `;

export const displayPauseButtonOnSmallScreen = `
  @media (max-width: 563px) {
    .pauseButtonStyle {
      display: block;
    }
  }
  `;

export const hidePauseButtonOnSmallScreen = `
  @media (max-width: 563px) {
    .pauseButtonStyle {
      display: none;
    }
  }
  `;

export const cancelButtonStyle = `
    .cancelButtonStyle {
      display: inline-block;
    }
    @media (max-width: 563px) {
      .cancelButtonStyle {
        display: block;
      }
    }
  `;
