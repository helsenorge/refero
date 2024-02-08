// add all of thiese "string" | "boolean" | "group" | "display" | "decimal" | "date" | "dateTime" | "time" | "text" | "integer" | "choice" | "open-choice" | "attachment" | "quantity" | "question" | "url" | "reference"' is not assignable to parameter of type '"string" | "boolean" | "group" | "display" | "decimal" | "date" | "dateTime" | "time" | "text" | "integer" | "choice" | "open-choice" | "attachment" | "quantity"

export default {
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
