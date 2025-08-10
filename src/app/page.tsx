import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LoginPage() {
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
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Masuk untuk mulai mengelola absensi siswa.
              </p>
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <Link href="/dashboard">
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-62.2 62.2C322.7 89.2 289.4 72 248 72 142.1 72 64 150.1 64 256s78.1 184 184 184c88.4 0 137.9-42.3 148.8-69.8H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                  Masuk dengan Google
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Attendly. All rights reserved.
      </footer>
    </main>
  );
}
