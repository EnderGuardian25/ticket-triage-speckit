import { z } from 'zod'

export const PriorityEnum = z.enum(['P0', 'P1', 'P2'])

export const PatchTicketBodySchema = z.object({
  priority: PriorityEnum.optional(),
  owner: z.string().nullable().optional(),
})

export const ValidationErrorSchema = z.object({
  error: z.literal('Validation failed'),
  issues: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    })
  ),
})

export type PatchTicketBody = z.infer<typeof PatchTicketBodySchema>
