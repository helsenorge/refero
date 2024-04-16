import { palette } from '@helsenorge/designsystem-react/theme/palette';

export const validationSummaryList = `
  .validationSummary_list {
    list-style: none;
    padding: 30px 60px;
    margin: 0;
    background-color: ${palette.cherry100};
    border-left: 4px solid ${palette.cherry600};
  }
`;

export const validationSummaryHeader = `
  .validationSummary_header {
    padding: 0;
    margin-bottom: 1.5rem;
    font-weight: 400;
    font-size: 1.375rem;
  }
`;

export const validationSummaryListItem = `
  .validationSummary_listItem {
    margin-top: 1rem;
  }
`;

export const validationSummaryButton = `
  .validationSummary_button {
    color: ${palette.cherry600};
    font-size: 1.125rem;
    font-weight: 400;

    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
`;
