'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/data/auth/auth.hooks';
import { useAuthToken } from '@/hooks/useAuthToken';

export default function Home() {
  const router = useRouter();
  const { getToken } = useAuthToken();
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (isLoading) return;
    if (getToken() && user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [getToken, user, isLoading, router]);

  return null;
}
