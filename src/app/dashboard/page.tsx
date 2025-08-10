import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockAttendance, classes } from "@/lib/data"
import { CheckCircle2, XCircle, Clock, Info, UserCheck, UserX, BarChartHorizontalBig } from "lucide-react"
import { AttendanceChart } from "./components/attendance-chart"
import type { AttendanceStatus } from "@/lib/data"

const getStatusBadge = (status: AttendanceStatus) => {
  const variants: Record<AttendanceStatus, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode, text: string, className: string }> = {
    present: { variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, text: "Hadir", className: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20"},
    absent: { variant: "destructive", icon: <XCircle className="h-4 w-4" />, text: "Absen", className: "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20" },
    late: { variant: "secondary", icon: <Clock className="h-4 w-4" />, text: "Terlambat", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20" },
    excused: { variant: "outline", icon: <Info className="h-4 w-4" />, text: "Izin", className: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20" },
  }
  const { variant, icon, text, className } = variants[status];
  return <Badge variant={variant} className={cn("gap-1.5", className)}>{icon}{text}</Badge>
}

export default function DashboardPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = mockAttendance.filter(a => a.date === todayStr);
  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);

  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const overallAttendanceRate = totalStudents > 0 ? (mockAttendance.filter(a => a.status === 'present' || a.status === 'late').length / mockAttendance.length * 100) : 0;

  const recentActivities = [...mockAttendance].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan data absensi siswa Anda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Kehadiran</CardTitle>
            <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Keseluruhan data absensi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground">Siswa yang hadir & terlambat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absen Hari Ini</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentToday}</div>
            <p className="text-xs text-muted-foreground">Siswa yang tidak hadir</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Jumlah kelas yang diajar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Tren Kehadiran Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AttendanceChart data={mockAttendance} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="font-medium">{activity.studentName}</div>
                      <div className="text-sm text-muted-foreground">{activity.class}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>{activity.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...arg0: any[]): string | undefined {
    return arg0.filter(Boolean).join(" ")
}
