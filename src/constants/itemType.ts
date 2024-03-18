const ItemType = {
  BOOLEAN: 'boolean',
  GROUP: 'group',
  DISPLAY: 'display',
  DECIMAL: 'decimal',
  DATE: 'date',
  DATETIME: 'dateTime',
  TIME: 'time',
  TEXT: 'text',
  STRING: 'string',
  INTEGER: 'integer',
  CHOICE: 'choice',
  OPENCHOICE: 'open-choice',
  ATTATCHMENT: 'attachment',
  QUANTITY: 'quantity',
  REFERENCE: 'reference',
  URL: 'url',
  QUESTION: 'question',
} as const;

export default ItemType;

export type IItemType = typeof ItemType[keyof typeof ItemType];
