'use server';
/**
 * @fileOverview Flow for interacting with Google Sheets to manage class data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as sheetService from '@/services/sheets';

export const SheetClassSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SheetClass = z.infer<typeof SheetClassSchema>;

const AddClassInputSchema = z.object({
  name: z.string(),
});

// Exported wrapper functions

export async function getClasses(): Promise<SheetClass[]> {
  return getClassesFlow();
}

export async function addClass(input: z.infer<typeof AddClassInputSchema>): Promise<void> {
  return addClassFlow(input);
}

export async function updateClass(input: SheetClass): Promise<void> {
  return updateClassFlow(input);
}

export async function deleteClass(id: string): Promise<void> {
  return deleteClassFlow(id);
}

// Genkit Flows

const getClassesFlow = ai.defineFlow(
  {
    name: 'getClassesFlow',
    outputSchema: z.array(SheetClassSchema),
  },
  async () => {
    return await sheetService.getClasses();
  }
);

const addClassFlow = ai.defineFlow(
  {
    name: 'addClassFlow',
    inputSchema: AddClassInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    await sheetService.addClass(input);
  }
);

const updateClassFlow = ai.defineFlow(
  {
    name: 'updateClassFlow',
    inputSchema: SheetClassSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    await sheetService.updateClass(input);
  }
);

const deleteClassFlow = ai.defineFlow(
  {
    name: 'deleteClassFlow',
    inputSchema: z.string(),
    outputSchema: z.void(),
  },
  async (id) => {
    await sheetService.deleteClass(id);
  }
);
