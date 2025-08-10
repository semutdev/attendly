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

export const SheetSubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SheetSubject = z.infer<typeof SheetSubjectSchema>;

export const AddSubjectInputSchema = z.object({
  name: z.string(),
});
export type AddSubjectInput = z.infer<typeof AddSubjectInputSchema>;
