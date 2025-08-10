import { z } from 'zod';

export const SheetClassSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SheetClass = z.infer<typeof SheetClassSchema>;

export const AddClassInputSchema = z.object({
  name: z.string(),
});
export type AddClassInput = z.infer<typeof AddClassInputSchema>;
