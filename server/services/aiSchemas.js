/**
 * Zod schemas for validating Gemini AI JSON responses.
 * Each service's expected AI output shape is defined here so that
 * one malformed response never crashes the user experience.
 */

import { z } from 'zod';

// ── admissionChance.js — AI enhancement tips ────────────────────────────────
export const AdmissionTipSchema = z.array(
  z.object({
    schoolId: z.string(),
    classification: z.enum(['Safety', 'Target', 'Reach']).optional(),
    aiTip: z.string().optional(),
  })
);

// ── aiTaskGenerator.js — AI-generated roadmap tasks ─────────────────────────
const validCategories = ['Testing', 'Application', 'Financial', 'Visit', 'Portfolio', 'Recommendation', 'Other'];

export const RoadmapTaskSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    category: z.enum(validCategories),
    dueDate: z.string().nullable().optional().default(null),
  })
);

// ── collegeComparison.js — AI yourChance estimates ──────────────────────────
export const ComparisonAISchema = z.array(
  z.object({
    name: z.string(),
    yourChance: z.number().nullable().optional().default(null),
  })
);

// ── collegeStrategy.js — AI school recommendations ──────────────────────────
export const StrategyAISchema = z.object({
  rationale: z.string().optional().default(''),
  schools: z.array(
    z.object({
      name: z.string(),
      tier: z.enum(['reach', 'target', 'safety']),
      programStrength: z.string().optional().default(''),
      whyFit: z.string().optional().default(''),
    })
  ).default([]),
});

// ── schoolDiscovery.js — AI school discovery ────────────────────────────────
export const DiscoveryAISchema = z.object({
  schools: z.array(
    z.object({
      name: z.string(),
      tier: z.enum(['reach', 'target', 'safety']),
      programStrength: z.string().optional().default(''),
      whyFit: z.string().optional().default(''),
    })
  ).default([]),
});

// ── portfolioAdvice.js — AI portfolio tips ──────────────────────────────────
export const PortfolioTipSchema = z.array(
  z.object({
    school: z.string(),
    tip: z.string().optional().default(''),
    emphasis: z.string().optional().default(''),
    portfolioSize: z.string().optional().default(''),
  })
);

/**
 * Safely parse AI JSON text through a Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 * Strips markdown code fences before parsing.
 */
export function safeParseAI(schema, rawText) {
  let text = (rawText || '').trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return { success: false, error: `JSON parse failed: ${err.message}` };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return { success: false, error: `Schema validation failed: ${result.error.message}` };
  }

  return { success: true, data: result.data };
}
