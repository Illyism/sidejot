import { z } from 'zod'

export const taskSchema = z.object({
  content: z.string(),
  duration: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const generatePlanSchema = z.object({
  reasoning: z.string(),
  tasks: z.array(taskSchema.required()),
  backlog: z.array(taskSchema.required()),
  notes: z.string(),
})
