import { ScoringCalculator } from "../util/scoringCalculator";

export interface State {
  valid: boolean;
  validated: boolean;
  showCancelLightbox?: boolean;  
  scoringCalculator?: ScoringCalculator;
}