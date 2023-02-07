import { FormDefinition } from "../reducers/form";

export const shouldFormBeDisplayedAsStepView = (formDefinition: FormDefinition): boolean => {
  let test = false;
  formDefinition.Content?.item?.find(qItem =>
    qItem.extension?.find(extension => extension.valueCodeableConcept?.coding?.find(coding => {if (coding.code === 'step') {
      test = true;
      console.log(test);
    }}))
  )
    return test;
};