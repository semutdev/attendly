'use server';
/**
 * @fileOverview Server-side actions for interacting with Google Sheets to manage student data.
 */

import * as sheetService from '@/services/sheets';
import type { AddStudentInput, UpdateStudentInput, SheetStudent, SheetClass, LoginStudentInput } from '@/lib/definitions';

export async function getStudentsByClass(classId: string): Promise<SheetStudent[]> {
  return await sheetService.getStudentsByClass(classId);
}

export async function addStudent(input: AddStudentInput): Promise<void> {
  await sheetService.addStudent(input);
}

export async function updateStudent(input: UpdateStudentInput): Promise<void> {
  await sheetService.updateStudent(input);
}

export async function deleteStudent(id: string): Promise<void> {
  await sheetService.deleteStudent(id);
}

export async function getClassDetails(id: string): Promise<SheetClass | null> {
    return await sheetService.getClass(id);
}

export async function loginStudent(input: LoginStudentInput): Promise<SheetStudent | null> {
    const students = await sheetService.getAllStudents();
    const student = students.find(s => s.username === input.username && s.password === input.password);
    return student || null;
}
