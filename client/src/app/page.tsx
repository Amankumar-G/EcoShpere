"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { useMe } from "@/data/auth/auth.hooks";

export default function Home() {
  const { data: user, isLoading } = useMe();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome to Odoo
      </h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : user ? (
        <>
          <p className="text-muted-foreground">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <LogoutButton />
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            Sign in to get started.
          </p>
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </>
      )}
    </main>
  );
}
