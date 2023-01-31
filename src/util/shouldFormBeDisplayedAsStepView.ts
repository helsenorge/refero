import { FormDefinition } from "../reducers/form";

export const shouldFormBeDisplayedAsStepView = (formDefinition: FormDefinition): boolean => {
  return formDefinition.Content?.item?.find(qItem =>
    qItem.extension?.find(extension => extension.valueCodeableConcept?.coding?.find(coding => coding.code === 'step'))
  )
    ? true
    : false;
};