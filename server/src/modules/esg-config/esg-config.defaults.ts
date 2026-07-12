export const ESG_CONFIG_DEFAULTS: Record<string, unknown> = {
  auto_emission_calculation: false,
  evidence_required_for_approval: true,
  badge_auto_award: true,
  esg_weights: { e: 0.4, s: 0.3, g: 0.3 },
  weekly_office_attendance: 5,
  e_pillar_sub_weights: { goal: 0.5, trend: 0.3, initiative: 0.2 },
  g_pillar_sub_weights: { policyAck: 0.3, audit: 0.3, complianceHealth: 0.4 },
  compliance_severity_weights: { low: 1, medium: 3, high: 7, critical: 15 },
  penalty_constants: { k1: 1.0, k2: 1.0, penaltyPerUnresolvedFinding: 5 },
};
