"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Info, UserCheck, UserX, BarChartHorizontalBig, School, Loader2 } from "lucide-react"
import { AttendanceChart } from "./components/attendance-chart"
import type { AttendanceStatus, SheetAttendance } from "@/lib/definitions"
import { getAllAttendance, getClasses } from "@/ai/flows/dashboard-flow"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(true)
    const [stats, setStats] = React.useState({
        overallAttendanceRate: 0,
        presentToday: 0,
        absentToday: 0,
        totalClasses: 0,
    })
    const [allAttendance, setAllAttendance] = React.useState<SheetAttendance[]>([])
    const [recentActivities, setRecentActivities] = React.useState<SheetAttendance[]>([])

    React.useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const [attendanceRecords, classes] = await Promise.all([
                    getAllAttendance(),
                    getClasses()
                ])

                const todayStr = format(new Date(), "yyyy-MM-dd")
                const todayAttendance = attendanceRecords.filter(a => a.date === todayStr)

                const presentCount = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length
                const overallRate = attendanceRecords.length > 0 ? (presentCount / attendanceRecords.length * 100) : 0

                setStats({
                    overallAttendanceRate: overallRate,
                    presentToday: todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length,
                    absentToday: todayAttendance.filter(a => a.status === 'absent').length,
                    totalClasses: classes.length,
                })
                
                setAllAttendance(attendanceRecords)
                setRecentActivities(attendanceRecords.slice(0, 5))

            } catch (error) {
                console.error(error)
                toast({
                    title: "Gagal memuat data",
                    description: "Tidak dapat mengambil data dasbor dari Google Sheet.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [toast])


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
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.overallAttendanceRate.toFixed(1)}%</div>}
            <p className="text-xs text-muted-foreground">Keseluruhan data absensi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.presentToday}</div>}
            <p className="text-xs text-muted-foreground">Siswa yang hadir & terlambat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absen Hari Ini</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.absentToday}</div>}
            <p className="text-xs text-muted-foreground">Siswa yang tidak hadir</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.totalClasses}</div>}
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
            {isLoading ? <div className="flex justify-center items-center h-[350px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : <AttendanceChart data={allAttendance} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
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
                        </TableCell>
                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
