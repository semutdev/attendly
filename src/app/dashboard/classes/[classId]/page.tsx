"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { addStudent, deleteStudent, getStudentsByClass, updateStudent, getClassDetails } from "@/ai/flows/student-flow"
import type { SheetStudent, SheetClass } from "@/lib/definitions"

type StudentFormState = Omit<SheetStudent, 'id' | 'classId'>

export default function StudentsPage({ params }: { params: { classId: string } }) {
  const { classId } = params;
  const { toast } = useToast()
  
  const [students, setStudents] = React.useState<SheetStudent[]>([])
  const [classDetails, setClassDetails] = React.useState<SheetClass | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentStudent, setCurrentStudent] = React.useState<SheetStudent | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [formState, setFormState] = React.useState<StudentFormState>({
    name: "",
    username: "",
    password: "",
  });

  const fetchStudentsAndClass = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedStudents, fetchedClass] = await Promise.all([
        getStudentsByClass(classId),
        getClassDetails(classId)
      ]);
      setStudents(fetchedStudents);
      setClassDetails(fetchedClass);
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil data siswa dari Google Sheet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [classId, toast]);

  React.useEffect(() => {
    fetchStudentsAndClass();
  }, [fetchStudentsAndClass]);

  const openDialog = (student: SheetStudent | null = null) => {
    setCurrentStudent(student)
    if (student) {
      setFormState({
        name: student.name,
        username: student.username || "",
        password: student.password || "",
      });
    } else {
      setFormState({ name: "", username: "", password: "" });
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCurrentStudent(null)
    setFormState({ name: "", username: "", password: "" });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.username || !formState.password) return

    try {
      if (currentStudent) {
        await updateStudent({ ...formState, id: currentStudent.id, classId: currentStudent.classId });
        toast({ title: "Sukses!", description: "Data siswa berhasil diperbarui." })
      } else {
        await addStudent({ ...formState, classId: classId });
        toast({ title: "Sukses!", description: "Siswa baru berhasil ditambahkan." })
      }
      fetchStudentsAndClass();
      closeDialog();
    } catch (error) {
       console.error(error);
       toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      toast({ title: "Sukses!", description: "Siswa berhasil dihapus." });
      fetchStudentsAndClass();
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan saat menghapus data.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <Button asChild variant="ghost" size="sm" className="mb-2">
                <Link href="/dashboard/classes">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Kembali ke Daftar Kelas
                </Link>
            </Button>
          <h1 className="text-3xl font-bold font-headline">
            Manajemen Siswa: {isLoading ? '...' : classDetails?.name}
          </h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus data siswa untuk kelas ini.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Siswa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Berikut adalah daftar siswa di kelas {classDetails?.name || '...'}.
          </CardDescription>
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
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.username}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(student)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Ubah</span>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat diurungkan. Ini akan menghapus siswa secara permanen dari kelas ini.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={closeDialog}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentStudent ? "Ubah Siswa" : "Tambah Siswa Baru"}</DialogTitle>
              <DialogDescription>
                {currentStudent ? "Ubah data siswa di bawah ini." : "Masukkan data untuk siswa baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={formState.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Contoh: budi.s"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
