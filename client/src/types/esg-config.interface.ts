export interface EsgWeights {
  e: number;
  s: number;
  g: number;
}

export interface EsgConfigValueMap {
  auto_emission_calculation: boolean;
  evidence_required_for_approval: boolean;
  badge_auto_award: boolean;
  email_alerts_for_compliance_issues: boolean;
  esg_weights: EsgWeights;
  weekly_office_attendance: number;
}

export type EsgConfigKey = keyof EsgConfigValueMap;
