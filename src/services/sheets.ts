/**
 * @fileoverview Service for interacting with the Google Sheets API.
 */
import { google } from 'googleapis';
import type { AddClassInput, SheetClass } from '@/lib/definitions';
import dotenv from 'dotenv';

dotenv.config();


// This is the ID of your Google Sheet.
const SPREADSHEET_ID = "1uAj6drt6llPnE5ql-xKA-wi8ZAiStSMjTsuEI6dFiSM";
// This is the name of the sheet (tab) within your Google Sheet.
const SHEET_NAME = 'Classes';
const DATA_RANGE = `${SHEET_NAME}!A2:B`; // Range to get data, skipping header
const FULL_RANGE = `${SHEET_NAME}!A:B`; // Range for full sheet operations

function getAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Google service account credentials are not set in environment variables.");
  }
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: "absen-kelas@schoolbell-attendance.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDZ10v9pKzcv550\nxlPxRD4Xnvt4LNxGamIMtXWODK/TQ2viKu2El8MwHSembDl4JN4QmKMYtKGT+g1J\nzxn0k6gSVI7Y9LHL6wyzL2DT/QzSLMorK9W2dksP3oDbLT/0EfWjy3i+ar9+6Az0\nqoXvSbygpHnGvPk3DOfsGOufyGaY0Sr6AeAEbWtjxeHNPkPa9EmPRv745eKQYyAy\nh/rUNJTe/ngU9PJpo8O8Nshrk5mmPXWbNYDbPCDvjt8JQoPWWD1hmvOfo1AtU3lg\nykKMfWoqzhoTjdsr2xflhJfvcvt8XYv15DCr6SRoez1OJzkBkQMU33Ky67uUYRo0\nXGAcwMIZAgMBAAECggEAP/RJ3osApwRouF7bmRsQYa3upQ8Ckne8FoAVpaEK46rJ\nGwrAVauahd8hW2Ytjxy/xz6Qr3mkcEW6rf8r3xaUguEpWP+pzTTSMy8HLeV+ZJv6\ntKb3ZMyg5+VKjk5gFr9JDw/3AGxlkRP+bbw8ew56Xu06xUKIpgVXd4SvdGcI2/cN\n5OU+HVVTsL2mfGtZ0HvKanaa3DFZ6ItfgKN6jCgA9uIb2zmR3imL2iuKSig2yOZI\nT2xBfIJI8hoK7ERgJ01BOSX36nWaPIfJsP0F+Vql1KpTM2eCwtaSS/F1YdTLgNlv\n9nYB2+4f+MDD7Oy4TbSBkhIyaqZ3Uvifl2PU1We6MwKBgQD3zzrY113z9IezshIN\nKZaBR/oAimuDp3umDwm53sqXMzq5kkchtPmXb2v5Y1J1vhmpv3AKmfMzQMXnXVif\nCtU2r/eDqF5WdjUky3tNKARvdQ5OlTSSWqDiRumDq4OyO46Ll+iKtpPWlxPGjKAW\nVI0KHqRq0tNQ1hQxs/EfHxVBywKBgQDhCn8++HxFIhFbuOpc3iuhJPPzYlxaS1OA\nf5eteYBa/uAAWpI7cbNR+kSKBZfl5WXml7oxjnBCaYZNFKD39yrpY+0sn0t1i7CU\nNkXPyx1MA6f3iZ9GTEbXTF6CXoeS46VaDy0iCZWEOY+wo1Ri2SAAxxRurjjebUWk\niBBZbEF/KwKBgQDIOv+Xml1l8x17CtUfIY1kpJ3StgWteTSlttzq/KPBjDlVHGax\nS6OowvUBq0lDrfjaeb60MjSaIypFid1DlOM2rvRVw0OGpTjHpEraywzaakDHKjQy\nVVxNuXKRW5Kr/wdsr6/L9T57U9M8yP/JS0Qy+xNq5TKtzGzAxF5+AQWSBQKBgQCp\nr0iTKrpJRo7gImZU8BDlyP9JHXmVfAbSdWLhIyRteJFesuxgdjNINPVJPT5z0q0r\nWmzCwSxUZ00lAdD+KBjrMrW7V8GGOHZEy0eIjxbgIkGcnODEGO+xl5wLoUuIrq4X\nYiod6CwdL2nxPrZ6ck13SKVXb3biAHLqxM3PH5mjUQKBgQCWEhA2Ot3fDQMEUPIw\nrCt3BsXKCCQrWPONOve2MPA24Ovm81th5XB0FkD/FqhAYjlPqYL5bGflHGTCt9rY\n1dTIP/hcz5qj1oRggyHNSOHzRh+24L3tUGqAS+vpxjuEnfG16bzfIkHpYHQrSthE\nDU7IrwMWklWOhW2A38vc/MC8Zg==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
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
    range: DATA_RANGE,
  });

  const rows = response.data.values;
  if (rows && rows.length) {
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
    })).filter(c => c.id && c.name); // Filter out empty rows
  }
  return [];
}

export async function addClass(classData: AddClassInput): Promise<void> {
  const sheets = await getSheetsApi();
  const newId = `C${Date.now()}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: DATA_RANGE,
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
      range: FULL_RANGE, // We need the full range to get the correct row index
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');
  
    // Find the index of the row to update.
    const rowIndex = rows.findIndex(row => row[0] === classData.id);
  
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${classData.id} not found.`);
    }
  
    // Sheet rows are 1-based, so add 1 to the 0-based rowIndex.
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
      range: FULL_RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');

    const rowIndex = rows.findIndex(row => row[0] === id);
  
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${id} not found.`);
    }

    const sheetRowNumber = rowIndex + 1;

    await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${sheetRowNumber}:B${sheetRowNumber}`,
    });
}
