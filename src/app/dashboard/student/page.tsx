"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import * as attendanceFlow from "@/ai/flows/attendance-flow"
import type { SheetStudent, SheetAttendance } from "@/lib/definitions"
import { LogOut, Loader2, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Label } from "@/components/ui/label"

export default function StudentDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [student, setStudent] = React.useState<SheetStudent | null>(null)
  const [attendance, setAttendance] = React.useState<SheetAttendance | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [reason, setReason] = React.useState("")
  const [showReasonInput, setShowReasonInput] = React.useState(false)

  const todayString = format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
        const fetchedAttendance = await attendanceFlow.getStudentAttendanceForDate(parsedStudent.id, todayString);
        // Assuming one attendance record per day for simplicity now
        setAttendance(fetchedAttendance.length > 0 ? fetchedAttendance[0] : null);
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

  const handleAttendance = async (status: 'present' | 'excused') => {
    if (!student) return;

    if (status === 'excused' && !reason) {
        toast({
            title: "Alasan diperlukan",
            description: "Silakan isi alasan ketidakhadiran Anda.",
            variant: "destructive"
        })
        return;
    }

    try {
        await attendanceFlow.markStudentAttendance({
            studentId: student.id,
            studentName: student.name,
            classId: student.classId,
            date: todayString,
            status: status,
            reason: status === 'excused' ? reason : undefined
        });
        
        const fetchedAttendance = await attendanceFlow.getStudentAttendanceForDate(student.id, todayString);
        setAttendance(fetchedAttendance.length > 0 ? fetchedAttendance[0] : null);
        setShowReasonInput(false);

        toast({ title: "Sukses!", description: `Kehadiran Anda telah berhasil dicatat.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Gagal", description: "Tidak dapat menyimpan kehadiran.", variant: "destructive" });
    }
  }

  if (isLoading || !student) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg animate-fade-in-up">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-headline">Selamat Datang, {student?.name}</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </Button>
            </div>
            <div className="text-center pt-4">
                <p className="text-5xl font-bold font-mono tracking-wider text-primary">
                    {format(currentTime, "HH:mm:ss")}
                </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendance ? (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2"/>
                    <h3 className="text-lg font-semibold">Anda Sudah Absen Hari Ini</h3>
                    <p className="text-muted-foreground">Status: <span className="font-bold capitalize">{attendance.status}</span></p>
                </div>
            ) : (
                <div>
                {!showReasonInput ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Button size="lg" className="h-20 text-lg flex-col gap-1" onClick={() => handleAttendance('present')}>
                            <CheckCircle className="h-6 w-6"/>
                            Hadir
                        </Button>
                        <Button size="lg" variant="destructive" className="h-20 text-lg flex-col gap-1" onClick={() => setShowReasonInput(true)}>
                            <XCircle className="h-6 w-6"/>
                            Tidak Hadir
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in-up">
                        <Label htmlFor="reason" className="text-base">Alasan Tidak Hadir</Label>
                        <Textarea 
                            id="reason"
                            placeholder="Contoh: Sakit"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setShowReasonInput(false)}>Batal</Button>
                            <Button onClick={() => handleAttendance('excused')}>Kirim Alasan</Button>
                        </div>
                    </div>
                )}
                </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                {attendance ? 'Terima kasih telah melakukan absensi.' : 'Silakan lakukan absensi untuk hari ini.'}
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
