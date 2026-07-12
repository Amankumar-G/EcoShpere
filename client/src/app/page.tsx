'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { useMe } from '@/data/auth/auth.hooks';
import { useAuthToken } from '@/hooks/useAuthToken';

export default function Home() {
  const router = useRouter();
  const { getToken } = useAuthToken();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (getToken() && user) {
      router.replace('/dashboard');
    }
  }, [getToken, user, router]);

  if (isLoading) return null;

  return (
    <BackgroundPaths
      title="Welcome To The Site"
      subtitle="Enjoy your visit."
      buttonText="Let's Get Started"
      href="/login"
    />
  );
}
