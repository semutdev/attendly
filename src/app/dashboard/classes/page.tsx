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
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { classes as initialClasses, type Class } from "@/lib/data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ClassesPage() {
  const { toast } = useToast()
  const [classes, setClasses] = React.useState<Class[]>(initialClasses)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentClass, setCurrentClass] = React.useState<Class | null>(null)
  const [className, setClassName] = React.useState("")

  const openDialog = (cls: Class | null = null) => {
    setCurrentClass(cls)
    setClassName(cls ? cls.name : "")
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCurrentClass(null)
    setClassName("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!className) return

    if (currentClass) {
      // Edit
      setClasses(classes.map(c => c.id === currentClass.id ? { ...c, name: className } : c))
      toast({ title: "Sukses!", description: "Nama kelas berhasil diperbarui." })
    } else {
      // Add
      const newClass: Class = {
        id: `C${Date.now()}`,
        name: className,
        students: []
      }
      setClasses([...classes, newClass])
      toast({ title: "Sukses!", description: "Kelas baru berhasil ditambahkan." })
    }
    closeDialog()
  }

  const handleDelete = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId))
    toast({ title: "Sukses!", description: "Kelas berhasil dihapus.", variant: "destructive" })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manajemen Kelas</h1>
          <p className="text-muted-foreground">Tambah, ubah, atau hapus data kelas Anda.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
          <CardDescription>Berikut adalah daftar semua kelas yang Anda ajar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Kelas</TableHead>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Jumlah Siswa</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-mono text-sm">{cls.id}</TableCell>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.students.length} siswa</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(cls)}>
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
                                Tindakan ini tidak dapat diurungkan. Ini akan menghapus kelas secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(cls.id)}>Hapus</AlertDialogAction>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={closeDialog}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentClass ? "Ubah Kelas" : "Tambah Kelas Baru"}</DialogTitle>
              <DialogDescription>
                {currentClass ? "Ubah nama kelas di bawah ini." : "Masukkan nama untuk kelas baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="col-span-3"
                  placeholder="Contoh: Kelas 10-C"
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
