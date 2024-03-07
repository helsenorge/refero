const ItemControl = {
  CHECKBOX: 'check-box',
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

// Exporting types
export type ItemControlType = keyof typeof ItemControl;
export type ItemControlGroupType = keyof typeof ItemControl.Group;
export type ItemControlValue = typeof ItemControl[keyof Omit<typeof ItemControl, 'Group'>];
export type ItemControlGroupValue = typeof ItemControl.Group[keyof typeof ItemControl.Group];

export default ItemControl;
