import type { Options } from '@/types/formTypes/radioGroupOptions';
import type { UseFormRegisterReturn } from 'react-hook-form';

import Label from '@helsenorge/designsystem-react/components/Label';
import Radio from '@helsenorge/designsystem-react/components/Radio';

import { getId } from '@/util/index';

type RadioVariant = 'choice' | 'open-choice';

const TEST_ID_PREFIX: Record<RadioVariant, string> = {
  choice: 'test-choice-radio',
  'open-choice': 'test-openchoice-radio',
};

type RenderRadioOptionsParams = {
  variant: RadioVariant;
  id?: string;
  options?: Array<Options>;
  selectedValue: string;
  handleChange: (value: string) => void;
  registration: UseFormRegisterReturn;
};

// Plain function, not a component: FormGroup only injects name/error/onColor into direct Radio children.
export const renderRadioOptions = ({
  variant,
  id,
  options,
  selectedValue,
  handleChange,
  registration,
}: RenderRadioOptionsParams): React.JSX.Element[] | undefined => {
  const { onChange, ...rest } = registration;
  const baseId = getId(id);

  return options?.map((option: Options, index: number) => (
    <Radio
      {...rest}
      aria-describedby={`${baseId}-${variant}-label`}
      onChange={(e): void => {
        handleChange(option.type);
        onChange(e);
      }}
      value={option.type}
      key={option.id}
      inputId={`${baseId}-hn-${index}`}
      testId={`${TEST_ID_PREFIX[variant]}-${baseId}-${index}`}
      onColor={variant === 'choice' ? 'ongrey' : undefined}
      label={<Label testId={`${baseId}-${index}-radio-${variant}-label`} labelTexts={[{ text: option.label, type: 'subdued' }]} />}
      checked={selectedValue === option?.type}
    />
  ));
};
