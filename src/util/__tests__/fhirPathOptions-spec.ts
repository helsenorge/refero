import { describe, it, expect, afterEach } from 'vitest';

import {
  LEGACY_FHIRPATH_CALCULATION_OPTIONS,
  getFhirPathCalculationOptions,
  resolveFhirPathCalculationOptions,
  setFhirPathCalculationOptions,
} from '../fhirPathOptions';

describe('fhirPathOptions', () => {
  afterEach(() => {
    setFhirPathCalculationOptions(undefined);
  });

  it('Should resolve to the legacy behaviour when nothing is configured', () => {
    expect(resolveFhirPathCalculationOptions()).toEqual(LEGACY_FHIRPATH_CALCULATION_OPTIONS);
  });

  it('Should keep the legacy behaviour as the documented default', () => {
    expect(LEGACY_FHIRPATH_CALCULATION_OPTIONS).toEqual({
      keepZeroValues: false,
      omitNonNumericResults: false,
      expressionPriority: 'legacy',
      resolveExpressionChains: false,
      maxChainIterations: 10,
    });
  });

  it('Should only change what the application wide options name', () => {
    setFhirPathCalculationOptions({ keepZeroValues: true });

    expect(resolveFhirPathCalculationOptions()).toEqual({
      ...LEGACY_FHIRPATH_CALCULATION_OPTIONS,
      keepZeroValues: true,
    });
  });

  it('Should let per call options win over the application wide ones', () => {
    setFhirPathCalculationOptions({ keepZeroValues: true, expressionPriority: 'copy-first' });

    expect(resolveFhirPathCalculationOptions({ expressionPriority: 'calculated-first' })).toEqual({
      ...LEGACY_FHIRPATH_CALCULATION_OPTIONS,
      keepZeroValues: true,
      expressionPriority: 'calculated-first',
    });
  });

  it('Should not let an explicit undefined override a configured value', () => {
    setFhirPathCalculationOptions({ keepZeroValues: true });

    expect(resolveFhirPathCalculationOptions({ keepZeroValues: undefined })).toEqual({
      ...LEGACY_FHIRPATH_CALCULATION_OPTIONS,
      keepZeroValues: true,
    });
  });

  it('Should go back to the legacy behaviour when the options are cleared', () => {
    setFhirPathCalculationOptions({ resolveExpressionChains: true });
    setFhirPathCalculationOptions(undefined);

    expect(resolveFhirPathCalculationOptions()).toEqual(LEGACY_FHIRPATH_CALCULATION_OPTIONS);
  });

  it('Should expose the configured options without exposing the internal object', () => {
    setFhirPathCalculationOptions({ keepZeroValues: true });

    const options = getFhirPathCalculationOptions();
    options.keepZeroValues = false;

    expect(getFhirPathCalculationOptions()).toEqual({ keepZeroValues: true });
  });
});
