import { z } from 'zod'

export const SubjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
})
export type SubjectDTO = z.infer<typeof SubjectSchema>

export const SubjectsResponseSchema = z.array(SubjectSchema)

export const CentralContentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
})
export const CentralContentResponseSchema = z.array(CentralContentItemSchema)
