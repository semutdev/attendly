export type Student = {
  id: string;
  name: string;
};

export type Class = {
  id: string;
  name: string;
  students: Student[];
};

export type Subject = {
  id: string;
  name: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AttendanceRecord = {
  id: string;
  date: string;
  class: string;
  subject: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
};

const studentsClass10A: Student[] = [
  { id: 'S001', name: 'Budi Santoso' },
  { id: 'S002', name: 'Citra Lestari' },
  { id: 'S003', name: 'Dewi Anggraini' },
  { id: 'S004', name: 'Eko Prasetyo' },
  { id: 'S005', name: 'Fitri Handayani' },
];

const studentsClass10B: Student[] = [
  { id: 'S006', name: 'Gilang Ramadhan' },
  { id: 'S007', name: 'Hana Yuliana' },
  { id: 'S008', name: 'Indra Wijaya' },
  { id: 'S009', name: 'Joko Susilo' },
  { id: 'S010', name: 'Kartika Sari' },
];

export const classes: Class[] = [
  { id: 'C01', name: 'Kelas 10-A', students: studentsClass10A },
  { id: 'C02', name: 'Kelas 10-B', students: studentsClass10B },
  { id: 'C03', name: 'Kelas 11-A', students: studentsClass10A.slice(0,3) },
  { id: 'C04', name: 'Kelas 11-B', students: studentsClass10B.slice(0,4) },
];

export const subjects: Subject[] = [
  { id: 'SUB01', name: 'Matematika' },
  { id: 'SUB02', name: 'Bahasa Indonesia' },
  { id: 'SUB03', name: 'Fisika' },
  { id: 'SUB04', name: 'Biologi' },
  { id: 'SUB05', name: 'Sejarah' },
];

// Generate some mock attendance data
export const mockAttendance: AttendanceRecord[] = [];
const today = new Date();
const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  const dateString = date.toISOString().split('T')[0];

  classes.forEach(c => {
    subjects.slice(0, 2).forEach(sub => {
      c.students.forEach(stu => {
        if (Math.random() > 0.1) { // 90% chance to have a record
          mockAttendance.push({
            id: `ATT${mockAttendance.length + 1}`,
            date: dateString,
            class: c.name,
            subject: sub.name,
            studentId: stu.id,
            studentName: stu.name,
            status: statuses[Math.floor(Math.random() * statuses.length)],
          });
        }
      });
    });
  });
}
