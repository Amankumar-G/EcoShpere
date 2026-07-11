'use client';

import { BackgroundPaths } from '@/components/ui/background-paths';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useMe } from '@/data/auth/auth.hooks';

export default function Home() {
  const { data: user, isLoading } = useMe();

  if (isLoading) return null;

  if (user) {
    return (
      <BackgroundPaths title="Welcome Back" subtitle={user.email}>
        <LogoutButton />
      </BackgroundPaths>
    );
  }

  return (
    <BackgroundPaths
      title="Welcome To The Site"
      subtitle="Enjoy your visit."
      buttonText="Let's Get Started"
      href="/login"
    />
  );
}
