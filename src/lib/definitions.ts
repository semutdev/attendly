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

export const SheetStudentSchema = z.object({
    id: z.string(),
    name: z.string(),
    classId: z.string(),
});
export type SheetStudent = z.infer<typeof SheetStudentSchema>;

export const AddStudentInputSchema = z.object({
    name: z.string(),
    classId: z.string(),
});
export type AddStudentInput = z.infer<typeof AddStudentInputSchema>;

export const UpdateStudentInputSchema = z.object({
    id: z.string(),
    name: z.string(),
});
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>;
