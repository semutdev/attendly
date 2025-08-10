'use server';
/**
 * @fileOverview Server-side actions for the teacher dashboard.
 */

import * as sheetService from '@/services/sheets';
import type { SheetClass, SheetAttendance } from '@/lib/definitions';

export async function getClasses(): Promise<SheetClass[]> {
  return await sheetService.getClasses();
}

export async function getAllAttendance(): Promise<SheetAttendance[]> {
  return await sheetService.getAllAttendance();
}
