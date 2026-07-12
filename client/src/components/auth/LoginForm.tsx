'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/data/auth/auth.hooks';
import { getErrorMessage } from '@/lib/axios/get-error-message';
import { LoginSchema, loginSchema } from '@/lib/zod-schemas/login.schema';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.push('/dashboard'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-full bg-primary py-2.5 text-primary-foreground hover:bg-primary/80"
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </FieldGroup>
    </form>
  );
}
