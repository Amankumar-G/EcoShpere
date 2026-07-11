import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden p-6"
      style={{ backgroundColor: "#F8F7F4" }}
    >
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "#707070" }}
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#1B1B1B" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#707070" }}>
            Sign in to your account or create a new one to get started.
          </p>
          <div
            className="mx-auto mt-4 h-0.5 w-12 rounded-full"
            style={{ backgroundColor: "#2563EB" }}
          />
        </div>

        <div
          className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-black/5 sm:p-8"
        >
          <Tabs defaultValue="login">
            <TabsList className="w-full rounded-full bg-[#F1F0ED] p-1">
              <TabsTrigger
                value="login"
                className="rounded-full data-active:bg-[#111827] data-active:text-white"
              >
                Log in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-full data-active:bg-[#111827] data-active:text-white"
              >
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
