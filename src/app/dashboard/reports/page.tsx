"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { SheetAttendance, AttendanceStatus } from "@/lib/definitions"
import { getAllAttendance } from "@/ai/flows/dashboard-flow"
import { Download, Printer, Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Info } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, subDays, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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


export default function ReportsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [allAttendance, setAllAttendance] = React.useState<SheetAttendance[]>([])
  const [statusFilter, setStatusFilter] = React.useState<AttendanceStatus | "all">("all")
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const attendanceRecords = await getAllAttendance()
        setAllAttendance(attendanceRecords)
      } catch (error) {
        console.error(error)
        toast({
          title: "Gagal memuat data",
          description: "Tidak dapat mengambil data laporan dari Google Sheet.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const filteredData = React.useMemo(() => {
    return allAttendance
      .filter(record => {
        // Status filter
        if (statusFilter !== "all" && record.status !== statusFilter) {
          return false
        }
        // Date range filter
        if (dateRange?.from && dateRange?.to) {
          const recordDate = parseISO(record.date)
          return recordDate >= dateRange.from && recordDate <= dateRange.to
        }
        return true
      })
  }, [allAttendance, statusFilter, dateRange])


  const exportToCSV = () => {
    const headers = ["ID Siswa", "Nama Siswa", "Tanggal", "Waktu", "Status", "Lokasi", "Alasan"];
    const rows = filteredData.map(d => 
        [
            d.studentId, 
            d.studentName, 
            d.date,
            d.time || '-',
            d.status, 
            `"${d.location || '-'}"`,
            `"${d.reason || '-'}"`
        ].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_absensi_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const printReport = () => {
    window.print();
  }


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Laporan Absensi</h1>
        <p className="text-muted-foreground">Filter dan lihat riwayat absensi siswa secara mendetail.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Filter Laporan</CardTitle>
            <CardDescription>Gunakan filter di bawah untuk menyeleksi data yang ingin Anda lihat.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
             <div className="space-y-1.5">
                <Label htmlFor="status-filter">Filter Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="present">Hadir</SelectItem>
                    <SelectItem value="late">Terlambat</SelectItem>
                    <SelectItem value="excused">Izin/Sakit</SelectItem>
                    <SelectItem value="absent">Absen</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="space-y-1.5">
              <Label>Rentang Tanggal</Label>
               <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline">Hasil Laporan</CardTitle>
                <CardDescription>Menampilkan {filteredData.length} data sesuai filter yang dipilih.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV} disabled={isLoading || filteredData.length === 0}> <Download className="mr-2 h-4 w-4"/> Ekspor CSV</Button>
                <Button variant="outline" onClick={printReport} disabled={isLoading || filteredData.length === 0}> <Printer className="mr-2 h-4 w-4"/> Cetak PDF</Button>
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Siswa</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Lokasi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">{record.studentName}</TableCell>
                                <TableCell>{format(parseISO(record.date), "dd MMM yyyy")}</TableCell>
                                <TableCell>{record.time || '-'}</TableCell>
                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                <TableCell className="font-mono text-xs">{record.location || '-'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Tidak ada data yang cocok dengan filter yang dipilih.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
