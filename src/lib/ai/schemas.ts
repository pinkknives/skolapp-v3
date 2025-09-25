import { z } from "zod";

// Shared enums
export const GradeBandSchema = z.enum([
  "ak1-3",
  "ak4-6",
  "ak7-9",
  "gy1",
  "gy2",
  "gy3",
]);

export const BloomLevelSchema = z.enum([
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
]);

export const QuestionTypeSchema = z.enum(["mcq", "short", "numeric", "open"]);

export const CurriculumRefSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

// Input schema for the API
export const InputSchema = z
  .object({
    gradeBand: GradeBandSchema,
    subject: z.string().min(1),
    topic: z.string().min(1),
    subtopic: z.string().optional(),
    difficulty: z.number().int().min(1).max(5),
    bloom: BloomLevelSchema.optional(),
    type: QuestionTypeSchema.optional(),
    count: z.number().int().min(1).max(20),
    language: z.literal("sv"),
    extra: z.string().optional(),
  })
  .strict();

// Question schema produced by the AI
export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    subject: z.string().min(1),
    grade_band: GradeBandSchema,
    topic: z.string().min(1),
    difficulty: z.number().int().min(1).max(5),
    bloom: BloomLevelSchema,
    type: QuestionTypeSchema,
    prompt: z.string().min(1),
    options: z.array(z.string()).min(2).optional(),
    answer: z.union([z.string(), z.number()]),
    rationale: z.string().optional(),
    curriculum: z.array(CurriculumRefSchema).optional(),
  })
  .strict();

export const OutputSchema = z
  .object({
    questions: z.array(QuestionSchema).min(1),
    warnings: z.array(z.string()).optional(),
  })
  .strict();

// Exported types
export type GradeBand = z.infer<typeof GradeBandSchema>;
export type BloomLevel = z.infer<typeof BloomLevelSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type CurriculumRef = z.infer<typeof CurriculumRefSchema>;
export type GenerateQuestionsInput = z.infer<typeof InputSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type GenerateQuestionsOutput = z.infer<typeof OutputSchema>;


