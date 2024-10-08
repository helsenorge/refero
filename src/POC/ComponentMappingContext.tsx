import React, { ComponentType } from 'react';

import ItemType from '../constants/itemType';
import String from '@/components/formcomponents/string/string';
import Integer from '@/components/formcomponents/integer/integer';
import Text from '@/components/formcomponents/text/text';
import Time from '@/components/formcomponents/date/time';
import DateTimeInput from '@/components/formcomponents/date/date-time';
import DateComponent from '@/components/formcomponents/date/date';
import Decimal from '@/components/formcomponents/decimal/decimal';
import Boolean from '@/components/formcomponents/boolean/boolean';
import Choice from '@/components/formcomponents/choice/choice';
import OpenChoice from '@/components/formcomponents/open-choice/open-choice';
import AttachmentComponent from '@/components/formcomponents/attachment/attachment';
import Quantity from '@/components/formcomponents/quantity/quantity';
import Group from '@/components/formcomponents/group/group';
import Display from '@/components/formcomponents/display/display';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

type ComponentMapping = {
  [itemType: string]: ComponentType<QuestionnaireComponentItemProps>;
};

const defaultComponentMapping: ComponentMapping = {
  [ItemType.STRING]: String,
  [ItemType.INTEGER]: Integer,
  [ItemType.DECIMAL]: Decimal,
  [ItemType.DATE]: DateComponent,
  [ItemType.DATETIME]: DateTimeInput,
  [ItemType.TIME]: Time,
  [ItemType.TEXT]: Text,
  [ItemType.BOOLEAN]: Boolean,
  [ItemType.CHOICE]: Choice,
  [ItemType.OPENCHOICE]: OpenChoice,
  [ItemType.ATTATCHMENT]: AttachmentComponent,
  [ItemType.QUANTITY]: Quantity,
  [ItemType.GROUP]: Group,
  [ItemType.DISPLAY]: Display,
};

export const ComponentMappingContext = React.createContext<{
  componentMapping: ComponentMapping;
}>({
  componentMapping: defaultComponentMapping,
});
export { defaultComponentMapping };
export default ComponentMappingContext;
export type { ComponentMapping };
