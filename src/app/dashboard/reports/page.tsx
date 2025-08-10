"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { SheetStudent, SheetAttendance, SheetClass } from "@/lib/definitions"
import { getAllAttendance } from "@/ai/flows/dashboard-flow"
import { getAllStudents, getClasses } from "@/services/sheets"
import { Download, Printer, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface UnattendedStudent extends SheetStudent {
  className: string;
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [unattendedStudents, setUnattendedStudents] = React.useState<UnattendedStudent[]>([])
  const [allClasses, setAllClasses] = React.useState<SheetClass[]>([])
  const [selectedClassId, setSelectedClassId] = React.useState<string>("all")
  
  const todayStr = format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [attendanceRecords, students, classes] = await Promise.all([
          getAllAttendance(),
          getAllStudents(),
          getClasses(),
        ])
        setAllClasses(classes);

        const attendedStudentIds = new Set(
          attendanceRecords
            .filter(record => record.date === todayStr)
            .map(record => record.studentId)
        )

        const classMap = new Map(classes.map(c => [c.id, c.name]));

        const unattended = students
          .filter(student => !attendedStudentIds.has(student.id))
          .map(student => ({
            ...student,
            className: classMap.get(student.classId) || 'N/A'
          }));

        setUnattendedStudents(unattended)
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
  }, [toast, todayStr])
  
  const filteredStudents = React.useMemo(() => {
    if (selectedClassId === "all") {
      return unattendedStudents;
    }
    return unattendedStudents.filter(student => student.classId === selectedClassId);
  }, [unattendedStudents, selectedClassId]);


  const exportToCSV = () => {
    const headers = ["ID Siswa", "Nama Siswa", "Kelas"];
    const rows = filteredStudents.map(d => [d.id, d.name, d.className].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_belum_absen_${todayStr}.csv`);
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
        <h1 className="text-3xl font-bold font-headline">Laporan Siswa Belum Absen</h1>
        <p className="text-muted-foreground">Daftar siswa yang belum melakukan absensi untuk hari ini ({format(new Date(), "dd MMMM yyyy")}).</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline">Hasil Laporan</CardTitle>
                <CardDescription>Menampilkan {filteredStudents.length} siswa yang belum absen.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV} disabled={isLoading || filteredStudents.length === 0}> <Download className="mr-2 h-4 w-4"/> Ekspor CSV</Button>
                <Button variant="outline" onClick={exportToPDF} disabled={isLoading || filteredStudents.length === 0}> <Printer className="mr-2 h-4 w-4"/> Cetak PDF</Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="max-w-xs mb-4">
                <Label htmlFor="class-filter">Filter Berdasarkan Kelas</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class-filter">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {allClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Username</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.className}</TableCell>
                                <TableCell>{student.username}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    Semua siswa sudah melakukan absensi hari ini.
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
