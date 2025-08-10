"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSubjects } from "@/ai/flows/subject-flow"
import * as attendanceFlow from "@/ai/flows/attendance-flow"
import type { SheetStudent, SheetSubject, SheetAttendance, AttendanceStatus } from "@/lib/definitions"
import { BookOpen, Check, LogOut, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function StudentDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [student, setStudent] = React.useState<SheetStudent | null>(null)
  const [subjects, setSubjects] = React.useState<SheetSubject[]>([])
  const [attendance, setAttendance] = React.useState<SheetAttendance[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const todayString = format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    const studentData = sessionStorage.getItem('student')
    if (!studentData) {
      router.push('/')
      return;
    }
    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent)

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedSubjects, fetchedAttendance] = await Promise.all([
          getSubjects(),
          attendanceFlow.getStudentAttendanceForDate(parsedStudent.id, todayString)
        ]);
        setSubjects(fetchedSubjects);
        setAttendance(fetchedAttendance);
      } catch (error) {
        console.error(error)
        toast({ title: "Gagal memuat data", description: "Tidak dapat mengambil data dari server.", variant: "destructive" })
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [router, toast, todayString])

  const handleLogout = () => {
    sessionStorage.removeItem('student');
    router.push('/');
  }

  const handleMarkPresent = async (subjectId: string) => {
    if (!student) return;

    try {
        await attendanceFlow.markStudentAttendance({
            studentId: student.id,
            studentName: student.name,
            classId: student.classId,
            subjectId: subjectId,
            date: todayString,
            status: 'present',
        });
        
        // Refresh attendance data
        const fetchedAttendance = await attendanceFlow.getStudentAttendanceForDate(student.id, todayString);
        setAttendance(fetchedAttendance);

        toast({ title: "Sukses!", description: `Kehadiran untuk mata pelajaran ini telah ditandai.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Gagal", description: "Tidak dapat menyimpan kehadiran.", variant: "destructive" });
    }
  }

  const getAttendanceStatusForSubject = (subjectId: string): AttendanceStatus | null => {
    const record = attendance.find(att => att.subjectId === subjectId);
    return record ? record.status : null;
  }

  if (isLoading || !student) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg animate-fade-in-up">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-headline">Selamat Datang, {student?.name}</CardTitle>
                <CardDescription>
                  Lakukan absensi untuk hari ini: {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => {
                    const status = getAttendanceStatusForSubject(subject.id);
                    return (
                        <TableRow key={subject.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                                    {subject.name}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {status === 'present' ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        <Check className="mr-1 h-4 w-4" />
                                        Telah Hadir
                                    </Badge>
                                ) : (
                                    <Button size="sm" onClick={() => handleMarkPresent(subject.id)}>
                                        <Check className="mr-2 h-4 w-4" /> Tandai Hadir
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
                Pastikan Anda menandai kehadiran untuk semua mata pelajaran hari ini.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
