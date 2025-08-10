"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { loginStudent } from '@/ai/flows/student-flow';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = React.useState('siswa');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (loginType === 'guru') {
      if (username === 'silvi' && password === 'jauzatii') {
        router.push('/dashboard');
      } else {
        setError('Username atau password Guru salah.');
        setIsLoading(false);
      }
    } else {
      try {
        const student = await loginStudent({ username, password });
        if (student) {
          // Store student data in session storage and redirect
          sessionStorage.setItem('student', JSON.stringify(student));
          router.push('/student/dashboard');
        } else {
          setError('Username atau password Siswa salah.');
        }
      } catch (err) {
        console.error(err);
        setError('Gagal terhubung ke server. Coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    setUsername('');
    setPassword('');
  }, [loginType]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="text-3xl font-headline">Selamat Datang di Attendly</CardTitle>
            <CardDescription>Aplikasi absensi modern untuk mempermudah pekerjaan Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <Label>Masuk sebagai</Label>
                <RadioGroup defaultValue="siswa" onValueChange={setLoginType} className="grid grid-cols-2 gap-4">
                  <div>
                    <RadioGroupItem value="guru" id="guru" className="peer sr-only" />
                    <Label htmlFor="guru" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Guru
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="siswa" id="siswa" className="peer sr-only" />
                    <Label htmlFor="siswa" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                      Siswa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
         <div className="flex items-center justify-center gap-1.5">
           Built with <Heart className="h-4 w-4 text-red-500 fill-current" /> for Bu Silvi.
         </div>
      </footer>
    </main>
  );
}
