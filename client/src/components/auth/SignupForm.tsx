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
import { useRegister } from '@/data/auth/auth.hooks';
import { getErrorMessage } from '@/lib/axios/get-error-message';
import {
  RegisterSchema,
  registerSchema,
} from '@/lib/zod-schemas/register.schema';

export function SignupForm() {
  const router = useRouter();
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit((values) => {
    signup.mutate(values, {
      onSuccess: () => router.push('/dashboard'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" autoComplete="name" {...register('name')} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Button
          type="submit"
          disabled={signup.isPending}
          className="w-full rounded-full bg-[#111827] py-2.5 text-white hover:bg-[#374151]"
        >
          {signup.isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </FieldGroup>
    </form>
  );
}
