"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Check, CircleUser } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { classes, subjects, type Student } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

export default function AttendancePage() {
  const { toast } = useToast()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedClass, setSelectedClass] = React.useState<string | undefined>()
  const [selectedSubject, setSelectedSubject] = React.useState<string | undefined>()
  const [students, setStudents] = React.useState<Student[]>([])
  const [attendance, setAttendance] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (selectedClass) {
      const classData = classes.find(c => c.id === selectedClass)
      const studentList = classData ? classData.students : []
      setStudents(studentList)
      
      const initialAttendance = studentList.reduce((acc, student) => {
        acc[student.id] = 'present'
        return acc
      }, {} as Record<string, string>)
      setAttendance(initialAttendance)
    } else {
      setStudents([])
      setAttendance({})
    }
  }, [selectedClass])

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }
  
  const handleSubmit = () => {
    console.log({
      date,
      class: selectedClass,
      subject: selectedSubject,
      attendance,
    })
    toast({
      title: "Absensi Tersimpan!",
      description: `Absensi untuk kelas ${classes.find(c=>c.id === selectedClass)?.name} pada ${format(date!, 'PPP')} telah berhasil disimpan.`,
      className: "bg-green-100 border-green-300 text-green-800",
    })
  }

  const isFormComplete = date && selectedClass && selectedSubject;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Input Absensi</h1>
        <p className="text-muted-foreground">Pilih kelas, mata pelajaran, dan tanggal untuk memulai.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>Tentukan detail sesi pembelajaran.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="class">Kelas</Label>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger id="class"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="subject">Mata Pelajaran</Label>
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject"><SelectValue placeholder="Pilih Mata Pelajaran" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      
      {isFormComplete && (
         <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>Tandai status kehadiran untuk setiap siswa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead className="text-center">Hadir</TableHead>
                    <TableHead className="text-center">Absen</TableHead>
                    <TableHead className="text-center">Terlambat</TableHead>
                    <TableHead className="text-center">Izin</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <CircleUser className="w-5 h-5 text-muted-foreground" />
                                {student.name}
                            </div>
                        </TableCell>
                        <TableCell colSpan={4}>
                            <RadioGroup 
                            value={attendance[student.id]}
                            onValueChange={(status) => handleStatusChange(student.id, status)}
                            className="grid grid-cols-4 gap-4"
                            >
                                <Label htmlFor={`present-${student.id}`} className="flex items-center justify-center p-2 rounded-md cursor-pointer [&:has([data-state=checked])]:bg-primary/10 [&:has([data-state=checked])]:text-primary font-semibold transition-colors">
                                    <RadioGroupItem value="present" id={`present-${student.id}`} className="sr-only" />
                                    Hadir
                                </Label>
                                <Label htmlFor={`absent-${student.id}`} className="flex items-center justify-center p-2 rounded-md cursor-pointer [&:has([data-state=checked])]:bg-destructive/10 [&:has([data-state=checked])]:text-destructive font-semibold transition-colors">
                                    <RadioGroupItem value="absent" id={`absent-${student.id}`} className="sr-only" />
                                    Absen
                                </Label>
                                <Label htmlFor={`late-${student.id}`} className="flex items-center justify-center p-2 rounded-md cursor-pointer [&:has([data-state=checked])]:bg-accent/20 [&:has([data-state=checked])]:text-accent-foreground font-semibold transition-colors">
                                    <RadioGroupItem value="late" id={`late-${student.id}`} className="sr-only" />
                                    Terlambat
                                </Label>
                                <Label htmlFor={`excused-${student.id}`} className="flex items-center justify-center p-2 rounded-md cursor-pointer [&:has([data-state=checked])]:bg-blue-500/10 [&:has([data-state=checked])]:text-blue-600 font-semibold transition-colors">
                                    <RadioGroupItem value="excused" id={`excused-${student.id}`} className="sr-only" />
                                    Izin
                                </Label>
                            </RadioGroup>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} size="lg">
                    <Check className="mr-2 h-4 w-4" /> Simpan Absensi
                </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
