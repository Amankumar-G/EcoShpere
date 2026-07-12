'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { AppTopbar } from '@/components/shell/AppTopbar';
import { useMe } from '@/data/auth/auth.hooks';
import { useAuthToken } from '@/hooks/useAuthToken';

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { getToken } = useAuthToken();
  const { data: user, isLoading, isError } = useMe();
  // Auth state depends on localStorage, which isn't available during SSR.
  // Defer the redirect decision until after mount so the first client render
  // matches the server-rendered markup (avoids a hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasToken = mounted && Boolean(getToken());
  const isUnauthenticated = mounted && (!hasToken || isError);

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace('/login');
    }
  }, [isUnauthenticated, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isUnauthenticated) {
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppTopbar />
        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
