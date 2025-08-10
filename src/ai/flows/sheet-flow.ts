'use server';
/**
 * @fileOverview Server-side actions for interacting with Google Sheets to manage class data.
 */

import {z} from 'zod';
import * as sheetService from '@/services/sheets';

export const SheetClassSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SheetClass = z.infer<typeof SheetClassSchema>;

const AddClassInputSchema = z.object({
  name: z.string(),
});
export type AddClassInput = z.infer<typeof AddClassInputSchema>;


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
