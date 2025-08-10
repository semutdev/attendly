'use server';
/**
 * @fileOverview Server-side actions for managing student attendance.
 */

import * as sheetService from '@/services/sheets';
import type { StudentAttendanceInput, SheetAttendance } from '@/lib/definitions';

export async function markStudentAttendance(input: StudentAttendanceInput): Promise<void> {
  await sheetService.markStudentAttendance(input);
}

export async function getStudentAttendanceForDate(studentId: string, date: string): Promise<SheetAttendance[]> {
  return await sheetService.getStudentAttendanceForDate(studentId, date);
}
