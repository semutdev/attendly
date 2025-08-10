'use server';
/**
 * @fileOverview Server-side actions for interacting with Google Sheets to manage class data.
 */

import * as sheetService from '@/services/sheets';
import type { AddClassInput, SheetClass } from '@/lib/definitions';

export async function getClasses(): Promise<SheetClass[]> {
  return await sheetService.getClasses();
}

export async function addClass(input: AddClassInput): Promise<void> {
  await sheetService.addClass(input);
}

export async function updateClass(input: SheetClass): Promise<void> {
  await sheetService.updateClass(input);
}

export async function deleteClass(id: string): Promise<void> {
  await sheetService.deleteClass(id);
}
