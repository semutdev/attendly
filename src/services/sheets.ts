/**
 * @fileoverview Service for interacting with the Google Sheets API.
 */
import { google } from 'googleapis';
import type { AddClassInput, SheetClass } from '@/lib/definitions';
import dotenv from 'dotenv';

dotenv.config();


// This is the ID of your Google Sheet.
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
// This is the name of the sheet (tab) within your Google Sheet.
const SHEET_NAME = 'Classes';
const RANGE = `${SHEET_NAME}!A:B`;

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Google service account credentials are not set in environment variables.");
  }
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}


async function getSheetsApi() {
  const auth = getAuth();
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

export async function getClasses(): Promise<SheetClass[]> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;
  if (rows && rows.length) {
    // Skip header row
    return rows.slice(1).map((row) => ({
      id: row[0],
      name: row[1],
    }));
  }
  return [];
}

export async function addClass(classData: AddClassInput): Promise<void> {
  const sheets = await getSheetsApi();
  const newId = `C${Date.now()}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newId, classData.name]],
    },
  });
}

export async function updateClass(classData: SheetClass): Promise<void> {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');
  
    const rowIndex = rows.findIndex(row => row[0] === classData.id);
  
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${classData.id} not found.`);
    }
  
    // rowIndex is 0-based, but sheets are 1-based
    const sheetRowNumber = rowIndex + 1;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[classData.name]],
      },
    });
}

export async function deleteClass(id: string): Promise<void> {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');

    const rowIndex = rows.findIndex(row => row[0] === id);
  
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${id} not found.`);
    }

    const sheetId = await getSheetId(sheets, SPREADSHEET_ID, SHEET_NAME);
    if (sheetId === null) {
        throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex,
                        endIndex: rowIndex + 1
                    }
                }
            }]
        }
    });
}

async function getSheetId(sheets: any, spreadsheetId: string | undefined, sheetName: string): Promise<number | null> {
    if (!spreadsheetId) return null;
    const response = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId || null;
}
