"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import * as attendanceFlow from "@/ai/flows/attendance-flow"
import type { SheetStudent, SheetAttendance, AttendanceStatus } from "@/lib/definitions"
import { LogOut, Loader2, CheckCircle, XCircle, Calendar, Clock, Info, MapPin, Sparkles, UserCheck } from "lucide-react"
import { format, startOfWeek, startOfMonth, isWithinInterval } from "date-fns"
import { id } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type HistoryFilter = "today" | "week" | "month"

const motivationalQuotes = [
    "Kehadiranmu hari ini adalah langkah pertama menuju sukses.",
    "Setiap ilmu yang kamu serap hari ini, membangun masa depanmu.",
    "Jangan takut salah, karena dari situlah kita belajar.",
    "Buka pikiranmu, siap untuk petualangan belajar hari ini!",
    "Fokus pada tujuan, satu langkah setiap harinya.",
    "Semangatmu hari ini menentukan cerahnya esok hari.",
    "Percaya pada dirimu, kamu lebih hebat dari yang kamu duga.",
    "Jadikan hari ini lebih baik dari hari kemarin.",
    "Setiap usaha kecil yang kamu lakukan sangat berarti.",
    "Mulai dengan senyuman, taklukkan harimu!",
];

const getStatusBadge = (status: AttendanceStatus) => {
  const variants: Record<AttendanceStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode, text: string, className: string }> = {
    present: { variant: "default", icon: <CheckCircle className="h-4 w-4" />, text: "Hadir", className: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20"},
    absent: { variant: "destructive", icon: <XCircle className="h-4 w-4" />, text: "Absen", className: "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20" },
    late: { variant: "secondary", icon: <Clock className="h-4 w-4" />, text: "Terlambat", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20" },
    excused: { variant: "outline", icon: <Info className="h-4 w-4" />, text: "Izin", className: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20" },
  }
  const { variant, icon, text, className } = variants[status];
  return <Badge variant={variant} className={cn("gap-1.5", className)}>{icon}{text}</Badge>
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [student, setStudent] = React.useState<SheetStudent | null>(null)
  const [todaysAttendance, setTodaysAttendance] = React.useState<SheetAttendance | null>(null)
  const [allAttendance, setAllAttendance] = React.useState<SheetAttendance[]>([])
  const [filteredHistory, setFilteredHistory] = React.useState<SheetAttendance[]>([])
  const [historyFilter, setHistoryFilter] = React.useState<HistoryFilter>("today")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [reason, setReason] = React.useState("")
  const [showReasonInput, setShowReasonInput] = React.useState(false)
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const [motivationalQuote, setMotivationalQuote] = React.useState("");

  const todayString = format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  React.useEffect(() => {
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation tidak didukung oleh browser Anda.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
            },
            () => {
                setLocationError("Gagal mendapatkan lokasi. Fitur lokasi tidak wajib.");
                 toast({
                    variant: 'default',
                    title: 'Info Lokasi',
                    description: 'Gagal mendapatkan lokasi. Anda tetap bisa absen.',
                });
            }
        );
    };
    getLocation();
  }, [toast]);

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
        const [todayRecords, allRecords] = await Promise.all([
          attendanceFlow.getStudentAttendanceForDate(parsedStudent.id, todayString),
          attendanceFlow.getAllAttendanceForStudent(parsedStudent.id)
        ]);
        
        const todayRecord = todayRecords.find(att => att.date === todayString) || null;
        setTodaysAttendance(todayRecord);
        setAllAttendance(allRecords);
      } catch (error) {
        console.error(error)
        setAllAttendance([]);
        toast({ title: "Gagal memuat riwayat", description: "Tidak dapat mengambil riwayat absensi dari server.", variant: "destructive" })
      } finally {
        setIsLoading(false);
      }
    }
    fetchData()
  }, [router, toast, todayString])

  React.useEffect(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(today);

    let data = allAttendance;
    if (historyFilter === "today") {
      data = allAttendance.filter(att => att.date === todayString);
    } else if (historyFilter === "week") {
      data = allAttendance.filter(att => isWithinInterval(new Date(att.date), { start: startOfThisWeek, end: today }));
    } else if (historyFilter === "month") {
      data = allAttendance.filter(att => isWithinInterval(new Date(att.date), { start: startOfThisMonth, end: today }));
    }
    setFilteredHistory(data);
  }, [allAttendance, historyFilter, todayString]);

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

    setIsSubmitting(true);
    const now = new Date();
    try {
        await attendanceFlow.markStudentAttendance({
            studentId: student.id,
            studentName: student.name,
            classId: student.classId,
            date: format(now, "yyyy-MM-dd"),
            time: format(now, "HH:mm:ss"),
            status: status,
            reason: status === 'excused' ? reason : undefined,
            location: location ? `${location.latitude}, ${location.longitude}` : undefined,
        });
        
        const fetchedAttendance = await attendanceFlow.getStudentAttendanceForDate(student.id, todayString);
        const todayRecord = fetchedAttendance.find(att => att.date === todayString) || null;
        setTodaysAttendance(todayRecord);
        if(todayRecord) {
            setAllAttendance(prev => [todayRecord, ...prev.filter(a => a.id !== todayRecord.id)]);
        }
        setShowReasonInput(false);

        toast({ title: "Sukses!", description: `Kehadiran Anda telah berhasil dicatat.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Gagal", description: "Tidak dapat menyimpan kehadiran.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading && !student) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-8">
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
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : todaysAttendance ? (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2"/>
                    <h3 className="text-lg font-semibold">Anda Sudah Absen Hari Ini</h3>
                    <p className="text-muted-foreground">Status: <span className="font-bold capitalize">{todaysAttendance.status}</span></p>
                </div>
            ) : (
                 <div className="flex flex-col items-center gap-4">
                      {!showReasonInput ? (
                          <div className="w-full max-w-sm flex flex-col gap-4">
                              <Alert className="border-primary/50 bg-primary/5">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary font-semibold">Motivasi Hari Ini</AlertTitle>
                                <AlertDescription>
                                   {motivationalQuote}
                                </AlertDescription>
                              </Alert>
                              <Button size="lg" className="h-20 text-lg flex-col gap-1" onClick={() => handleAttendance('present')} disabled={isSubmitting}>
                                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin"/> : <UserCheck className="h-6 w-6"/>}
                                  Hadir
                              </Button>
                              <Button size="lg" variant="outline" className="h-20 text-lg flex-col gap-1" onClick={() => setShowReasonInput(true)} disabled={isSubmitting}>
                                  <XCircle className="h-6 w-6"/>
                                  Izin / Sakit
                              </Button>
                              {locationError && (
                                <Alert variant="default" className="mt-4">
                                    <MapPin className="h-4 w-4" />
                                    <AlertTitle>Info Lokasi</AlertTitle>
                                    <AlertDescription>
                                        {locationError}
                                    </AlertDescription>
                                </Alert>
                            )}
                          </div>
                      ) : (
                          <div className="w-full max-w-sm space-y-4 animate-fade-in-up">
                              <Label htmlFor="reason" className="text-base">Alasan Tidak Hadir</Label>
                              <Textarea 
                                  id="reason"
                                  placeholder="Contoh: Sakit"
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                  <Button variant="ghost" onClick={() => setShowReasonInput(false)} disabled={isSubmitting}>Batal</Button>
                                  <Button onClick={() => handleAttendance('excused')} disabled={isSubmitting || !reason}>
                                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Kirim Alasan
                                  </Button>
                              </div>
                          </div>
                      )}
                </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                {todaysAttendance ? 'Terima kasih telah melakukan absensi.' : 'Silakan lakukan absensi untuk hari ini.'}
            </p>
          </CardFooter>
        </Card>

        <Card className="shadow-lg animate-fade-in-up">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-xl">Riwayat Absensi</CardTitle>
                <CardDescription>Catatan kehadiran Anda.</CardDescription>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted p-1">
                  <Button variant={historyFilter === 'today' ? 'primary' : 'ghost'} size="sm" onClick={() => setHistoryFilter('today')}>Hari Ini</Button>
                  <Button variant={historyFilter === 'week' ? 'primary' : 'ghost'} size="sm" onClick={() => setHistoryFilter('week')}>Minggu Ini</Button>
                  <Button variant={historyFilter === 'month' ? 'primary' : 'ghost'} size="sm" onClick={() => setHistoryFilter('month')}>Bulan Ini</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Alasan</TableHead>
                            <TableHead>Lokasi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHistory.length > 0 ? filteredHistory.map(att => (
                            <TableRow key={att.id}>
                                <TableCell>{format(new Date(att.date), "dd MMM yyyy")}</TableCell>
                                <TableCell>{att.time || '-'}</TableCell>
                                <TableCell>{getStatusBadge(att.status)}</TableCell>
                                <TableCell>{att.reason || '-'}</TableCell>
                                <TableCell>{att.location || '-'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Tidak ada data untuk periode ini.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
