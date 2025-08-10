/**
 * @fileoverview Service for interacting with the Google Sheets API.
 */
import { google } from 'googleapis';
import type { AddClassInput, SheetClass, AddSubjectInput, SheetSubject, SheetStudent, AddStudentInput, UpdateStudentInput, StudentAttendanceInput, SheetAttendance } from '@/lib/definitions';
import dotenv from 'dotenv';

dotenv.config();


// This is the ID of your Google Sheet.
const SPREADSHEET_ID = "1uAj6drt6llPnE5ql-xKA-wi8ZAiStSMjTsuEI6dFiSM";
// Sheet Names
const CLASSES_SHEET_NAME = 'Classes';
const SUBJECTS_SHEET_NAME = 'Subjects';
const STUDENTS_SHEET_NAME = 'Students';
const ATTENDANCE_SHEET_NAME = 'Attendance';


// Data Ranges
const CLASSES_DATA_RANGE = `${CLASSES_SHEET_NAME}!A2:B`;
const CLASSES_FULL_RANGE = `${CLASSES_SHEET_NAME}!A:B`;
const SUBJECTS_DATA_RANGE = `${SUBJECTS_SHEET_NAME}!A2:B`;
const SUBJECTS_FULL_RANGE = `${SUBJECTS_SHEET_NAME}!A:B`;
const STUDENTS_DATA_RANGE = `${STUDENTS_SHEET_NAME}!A2:E`;
const STUDENTS_FULL_RANGE = `${STUDENTS_SHEET_NAME}!A:E`;
const ATTENDANCE_DATA_RANGE = `${ATTENDANCE_SHEET_NAME}!A2:H`;


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

// ========== Class Functions ==========

export async function getClass(id: string): Promise<SheetClass | null> {
  const classes = await getClasses();
  return classes.find(c => c.id === id) || null;
}

export async function getClasses(): Promise<SheetClass[]> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CLASSES_DATA_RANGE,
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
    range: CLASSES_DATA_RANGE,
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
      range: CLASSES_FULL_RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');
  
    const rowIndex = rows.findIndex(row => row[0] === classData.id);
  
    if (rowIndex === -1) {
      throw new Error(`Class with ID ${classData.id} not found.`);
    }
  
    const sheetRowNumber = rowIndex + 1;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CLASSES_SHEET_NAME}!B${sheetRowNumber}`,
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
      range: CLASSES_FULL_RANGE,
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
        range: `${CLASSES_SHEET_NAME}!A${sheetRowNumber}:B${sheetRowNumber}`,
    });
}

// ========== Subject Functions ==========

export async function getSubjects(): Promise<SheetSubject[]> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SUBJECTS_DATA_RANGE,
  });

  const rows = response.data.values;
  if (rows && rows.length) {
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
    })).filter(s => s.id && s.name);
  }
  return [];
}

export async function addSubject(subjectData: AddSubjectInput): Promise<void> {
  const sheets = await getSheetsApi();
  const newId = `S${Date.now()}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SUBJECTS_DATA_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newId, subjectData.name]],
    },
  });
}

export async function updateSubject(subjectData: SheetSubject): Promise<void> {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SUBJECTS_FULL_RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');
  
    const rowIndex = rows.findIndex(row => row[0] === subjectData.id);
  
    if (rowIndex === -1) {
      throw new Error(`Subject with ID ${subjectData.id} not found.`);
    }
  
    const sheetRowNumber = rowIndex + 1;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SUBJECTS_SHEET_NAME}!B${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[subjectData.name]],
      },
    });
}

export async function deleteSubject(id: string): Promise<void> {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SUBJECTS_FULL_RANGE,
    });
  
    const rows = response.data.values;
    if (!rows) throw new Error('Sheet not found or empty.');

    const rowIndex = rows.findIndex(row => row[0] === id);
  
    if (rowIndex === -1) {
      throw new Error(`Subject with ID ${id} not found.`);
    }

    const sheetRowNumber = rowIndex + 1;

    await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SUBJECTS_SHEET_NAME}!A${sheetRowNumber}:B${sheetRowNumber}`,
    });
}

// ========== Student Functions ==========

export async function getAllStudents(): Promise<SheetStudent[]> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: STUDENTS_DATA_RANGE,
  });

  const rows = response.data.values;
  if (rows && rows.length) {
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
      classId: row[2],
      username: row[3],
      password: row[4],
    })).filter(s => s.id && s.name && s.classId);
  }
  return [];
}

export async function getStudentsByClass(classId: string): Promise<SheetStudent[]> {
  const allStudents = await getAllStudents();
  return allStudents.filter(s => s.classId === classId);
}

export async function addStudent(studentData: AddStudentInput): Promise<void> {
  const sheets = await getSheetsApi();
  const newId = `S${Date.now()}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: STUDENTS_DATA_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[newId, studentData.name, studentData.classId, studentData.username, studentData.password]],
    },
  });
}

export async function updateStudent(studentData: UpdateStudentInput): Promise<void> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: STUDENTS_FULL_RANGE,
  });

  const rows = response.data.values;
  if (!rows) throw new Error('Student sheet not found or empty.');

  const rowIndex = rows.findIndex(row => row[0] === studentData.id);

  if (rowIndex === -1) {
    throw new Error(`Student with ID ${studentData.id} not found.`);
  }

  const sheetRowNumber = rowIndex + 1;

  // Note: We are updating from column B (name) to D (password). classId is not updated here.
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${STUDENTS_SHEET_NAME}!B${sheetRowNumber}:D${sheetRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[studentData.name, studentData.username, studentData.password]],
    },
  });
}

export async function deleteStudent(id: string): Promise<void> {
  const sheets = await getSheetsApi();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: STUDENTS_FULL_RANGE,
  });

  const rows = response.data.values;
  if (!rows) throw new Error('Student sheet not found or empty.');

  const rowIndex = rows.findIndex(row => row[0] === id);

  if (rowIndex === -1) {
    throw new Error(`Student with ID ${id} not found.`);
  }

  const sheetRowNumber = rowIndex + 1;

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${STUDENTS_SHEET_NAME}!A${sheetRowNumber}:E${sheetRowNumber}`,
  });
}


// ========== Attendance Functions ==========

export async function markStudentAttendance(attendanceData: StudentAttendanceInput): Promise<void> {
    const sheets = await getSheetsApi();
    const newId = `ATT${Date.now()}`;
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: ATTENDANCE_DATA_RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                newId,
                attendanceData.date,
                attendanceData.classId,
                attendanceData.subjectId || '', // Optional
                attendanceData.studentId,
                attendanceData.studentName,
                attendanceData.status,
                attendanceData.reason || '' // Optional
            ]],
        },
    });
}

export async function getStudentAttendanceForDate(studentId: string, date: string): Promise<SheetAttendance[]> {
    const sheets = await getSheetsApi();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: ATTENDANCE_DATA_RANGE,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
        const allAttendance = rows.map((row) => ({
            id: row[0],
            date: row[1],
            classId: row[2],
            subjectId: row[3],
            studentId: row[4],
            studentName: row[5],
            status: row[6],
            reason: row[7],
        })).filter(att => att.id && att.studentId && att.date);

        return allAttendance.filter(att => att.studentId === studentId && att.date === date);
    }
    return [];
}
