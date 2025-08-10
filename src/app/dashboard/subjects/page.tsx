"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { addSubject, deleteSubject, getSubjects, updateSubject } from "@/ai/flows/subject-flow"
import type { SheetSubject } from "@/lib/definitions"

export default function SubjectsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = React.useState<SheetSubject[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentSubject, setCurrentSubject] = React.useState<SheetSubject | null>(null)
  const [subjectName, setSubjectName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSubjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSubjects = await getSubjects();
      setSubjects(fetchedSubjects);
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil data mata pelajaran dari Google Sheet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const openDialog = (sub: SheetSubject | null = null) => {
    setCurrentSubject(sub)
    setSubjectName(sub ? sub.name : "")
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCurrentSubject(null)
    setSubjectName("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName) return

    try {
      if (currentSubject) {
        await updateSubject({ id: currentSubject.id, name: subjectName });
        toast({ title: "Sukses!", description: "Nama mata pelajaran berhasil diperbarui." })
      } else {
        await addSubject({ name: subjectName });
        toast({ title: "Sukses!", description: "Mata pelajaran baru berhasil ditambahkan." })
      }
      fetchSubjects();
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

  const handleDelete = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
      toast({ title: "Sukses!", description: "Mata pelajaran berhasil dihapus." });
      fetchSubjects();
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
          <h1 className="text-3xl font-bold font-headline">Manajemen Mata Pelajaran</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus data mata pelajaran dari Google Sheet.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pelajaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Pelajaran</CardTitle>
          <CardDescription>Berikut adalah daftar semua mata pelajaran yang datanya diambil dari Google Sheet.</CardDescription>
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
                  <TableHead>ID Pelajaran</TableHead>
                  <TableHead>Nama Pelajaran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-sm">{sub.id}</TableCell>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(sub)}>
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
                                  Tindakan ini tidak dapat diurungkan. Ini akan menghapus mata pelajaran secara permanen dari Google Sheet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(sub.id)}>Hapus</AlertDialogAction>
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
              <DialogTitle>{currentSubject ? "Ubah Pelajaran" : "Tambah Pelajaran Baru"}</DialogTitle>
              <DialogDescription>
                {currentSubject ? "Ubah nama mata pelajaran di bawah ini." : "Masukkan nama untuk mata pelajaran baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="Contoh: Matematika"
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
