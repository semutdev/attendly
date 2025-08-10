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
    username: z.string(),
    password: z.string(),
});
export type SheetStudent = z.infer<typeof SheetStudentSchema>;

export const AddStudentInputSchema = z.object({
    name: z.string(),
    classId: z.string(),
    username: z.string(),
    password: z.string(),
});
export type AddStudentInput = z.infer<typeof AddStudentInputSchema>;

export const UpdateStudentInputSchema = z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
});
export type UpdateStudentInput = z.infer<typeof UpdateStudentInputSchema>;

export const LoginStudentInputSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginStudentInput = z.infer<typeof LoginStudentInputSchema>;

export const AttendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const SheetAttendanceSchema = z.object({
    id: z.string(),
    date: z.string(),
    classId: z.string(),
    studentId: z.string(),
    studentName: z.string(),
    status: AttendanceStatusSchema,
    subjectId: z.string().optional(),
    reason: z.string().optional(),
    photoDataUri: z.string().optional(),
    location: z.string().optional(),
});
export type SheetAttendance = z.infer<typeof SheetAttendanceSchema>;

export const StudentAttendanceInputSchema = z.object({
  date: z.string(),
  classId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  status: AttendanceStatusSchema,
  subjectId: z.string().optional(),
  reason: z.string().optional(),
  photoDataUri: z.string().optional(),
  location: z.string().optional(),
});
export type StudentAttendanceInput = z.infer<typeof StudentAttendanceInputSchema>;
