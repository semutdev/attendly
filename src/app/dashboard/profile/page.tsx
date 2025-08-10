"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const [name, setName] = React.useState("Wali Kelas")
  const [email, setEmail] = React.useState("teacher@school.com")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan password baru dan konfirmasi password sama.",
        variant: "destructive",
      })
      return
    }
    
    // TODO: Implement actual update logic
    console.log({ name, email, password })

    toast({
      title: "Profil Diperbarui",
      description: "Informasi profil Anda telah berhasil disimpan.",
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profil Guru</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Personal</CardTitle>
                    <CardDescription>Perbarui nama dan email Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ubah Password</CardTitle>
                    <CardDescription>Masukkan password baru untuk mengubahnya. Kosongkan jika tidak ingin diubah.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password Baru</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="mt-6 flex justify-end">
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
            </Button>
        </div>
      </form>
    </div>
  )
}
