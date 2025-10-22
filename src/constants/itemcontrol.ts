const ItemControlConstants = {
  CHECKBOX: 'check-box',
  IFRAME: 'iframe',
  DROPDOWN: 'drop-down',
  RADIOBUTTON: 'radio-button',
  AUTOCOMPLETE: 'autocomplete',
  HELP: 'help',
  HELPLINK: 'help-link',
  INLINE: 'inline',
  HIGHLIGHT: 'highlight',
  SIDEBAR: 'sidebar',
  YEAR: 'year',
  YEARMONTH: 'yearMonth',
  RECEIVERCOMPONENT: 'receiver-component',
  DATARECEIVER: 'data-receiver',
  Group: {
    VERTICAL_TABLE: 'table',
    HORIZONTAL_TABLE: 'htable',
    GROUP_TABLE: 'gtable',
    ANSWER_TABLE: 'atable',
    GRID: 'grid',
  },
  SLIDER: 'slider',
} as const;

export default ItemControlConstants;
export type ValueOf<T> = T[keyof T];
export type ItemControlValue = ValueOf<typeof ItemControlConstants | typeof ItemControlConstants.Group>;
