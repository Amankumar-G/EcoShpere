'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/data/auth/auth.hooks';

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant="outline"
      disabled={logout.isPending}
      onClick={() =>
        logout.mutate(undefined, { onSuccess: () => router.push('/login') })
      }
    >
      {logout.isPending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
