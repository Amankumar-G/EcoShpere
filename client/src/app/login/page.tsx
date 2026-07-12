import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-background lg:flex-row">
      <section className="relative hidden w-full flex-col justify-between overflow-hidden bg-sidebar-primary p-10 text-sidebar-primary-foreground lg:flex lg:w-1/2 lg:p-14">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-sidebar-primary-foreground/80 transition-colors hover:text-sidebar-primary-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="max-w-md">
          <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-sidebar-primary-foreground/10">
            <Leaf className="size-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">EcoSphere</h2>
          <p className="mt-4 text-base text-sidebar-primary-foreground/80">
            ESG data, employee action and gamified engagement — in one system of
            record.
          </p>
        </div>

        <p className="text-xs text-sidebar-primary-foreground/60">
          &copy; {new Date().getFullYear()} EcoSphere. All rights reserved.
        </p>
      </section>

      <section className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-14">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign in to EcoSphere
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with the account your administrator created for you.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
