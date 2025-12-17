import { useEffect, useState } from 'react';

import { parseISO } from 'date-fns';

import type { QuestionnaireItem } from 'fhir/r4';

import { Extensions } from '@/constants/extensions';
import { getExtension } from '@/util/extension';
import { evaluateFhirpathExpressionToGetDate } from '@/util/fhirpathHelper';

export const useMinMaxDate = (item?: QuestionnaireItem): { minDateTime: Date | undefined; maxDateTime: Date | undefined } => {
  const [minDateTime, setMinDateTime] = useState<Date | undefined>();
  const [maxDateTime, setMaxDateTime] = useState<Date | undefined>();
  const getMinDateWithExtension = (): Date | undefined => {
    const minDate = getExtension(Extensions.MIN_VALUE_URL, item);

    if (!minDate) {
      return;
    }
    if (minDate.valueDate) {
      return parseISO(minDate.valueDate);
    } else if (minDate.valueDateTime) {
      return parseISO(minDate.valueDateTime);
    } else if (minDate && minDate.valueInstant) {
      return parseISO(minDate.valueInstant);
    }
    return undefined;
  };
  const getMaxDateWithExtension = (): Date | undefined => {
    const maxDate = getExtension(Extensions.MAX_VALUE_URL, item);
    if (!maxDate) {
      return;
    }
    if (maxDate.valueDate) {
      return parseISO(maxDate.valueDate);
    } else if (maxDate.valueDateTime) {
      return parseISO(maxDate.valueDateTime);
    } else if (maxDate && maxDate.valueInstant) {
      return parseISO(maxDate.valueInstant);
    }
    return undefined;
  };

  useEffect(() => {
    const getMinDate = async (): Promise<void> => {
      const minDate = getExtension(Extensions.DATE_MIN_VALUE_URL, item);
      if (minDate && minDate.valueString) {
        const date = await evaluateFhirpathExpressionToGetDate(item, minDate.valueString);
        setMinDateTime(date);
      } else {
        setMinDateTime(getMinDateWithExtension());
      }
    };
    const getMaxDate = async (): Promise<void> => {
      const maxDate = getExtension(Extensions.DATE_MAX_VALUE_URL, item);
      if (maxDate && maxDate.valueString) {
        const date = await evaluateFhirpathExpressionToGetDate(item, maxDate.valueString);
        setMaxDateTime(date);
      } else {
        setMaxDateTime(getMaxDateWithExtension());
      }
    };

    getMaxDate();
    getMinDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  return { minDateTime, maxDateTime };
};
