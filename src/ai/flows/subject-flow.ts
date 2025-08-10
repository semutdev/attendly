'use server';
/**
 * @fileOverview Server-side actions for interacting with Google Sheets to manage subject data.
 */

import * as sheetService from '@/services/sheets';
import type { AddSubjectInput, SheetSubject } from '@/lib/definitions';

export async function getSubjects(): Promise<SheetSubject[]> {
  return await sheetService.getSubjects();
}

export async function addSubject(input: AddSubjectInput): Promise<void> {
  await sheetService.addSubject(input);
}

export async function updateSubject(input: SheetSubject): Promise<void> {
  await sheetService.updateSubject(input);
}

export async function deleteSubject(id: string): Promise<void> {
  await sheetService.deleteSubject(id);
}
