"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Printer, Filter } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { classes, mockAttendance, type AttendanceRecord, type AttendanceStatus } from "@/lib/data"
import { CheckCircle2, XCircle, Clock, Info } from "lucide-react"

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
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [selectedClass, setSelectedClass] = React.useState<string>("all")
  const [filteredData, setFilteredData] = React.useState<AttendanceRecord[]>(mockAttendance)

  const handleFilter = () => {
    let data = mockAttendance;
    if (dateRange?.from && dateRange?.to) {
      data = data.filter(d => {
        const recordDate = new Date(d.date);
        return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
      });
    }
    if (selectedClass !== "all") {
      const className = classes.find(c => c.id === selectedClass)?.name;
      data = data.filter(d => d.class === className);
    }
    setFilteredData(data);
  }
  
  React.useEffect(() => {
    handleFilter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportToCSV = () => {
    const headers = ["ID", "Tanggal", "Kelas", "Pelajaran", "ID Siswa", "Nama Siswa", "Status"];
    const rows = filteredData.map(d => [d.id, d.date, d.class, d.subject, d.studentId, d.studentName, d.status].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_absensi_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportToPDF = () => {
    window.print();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Laporan Absensi</h1>
        <p className="text-muted-foreground">Filter dan ekspor laporan kehadiran siswa.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih rentang tanggal dan kelas untuk melihat laporan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col space-y-1.5">
                <Label>Rentang Tanggal</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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
                        <span>Pilih rentang</span>
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

            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="class">Kelas</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                    <Filter className="mr-2 h-4 w-4" /> Terapkan Filter
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline">Hasil Laporan</CardTitle>
                <CardDescription>Menampilkan {filteredData.length} data.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV}> <Download className="mr-2 h-4 w-4"/> Ekspor CSV</Button>
                <Button variant="outline" onClick={exportToPDF}> <Printer className="mr-2 h-4 w-4"/> Cetak PDF</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Pelajaran</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length > 0 ? filteredData.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>
                                <div className="font-medium">{record.studentName}</div>
                                <div className="text-sm text-muted-foreground">{record.class}</div>
                            </TableCell>
                            <TableCell>{record.subject}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                Tidak ada data yang ditemukan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
