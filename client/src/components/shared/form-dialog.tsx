'use client';

import * as React from 'react';
import { FieldValues, UseFormReturn, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/axios/get-error-message';

export type FormDialogProps<TValues extends FieldValues> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  form: UseFormReturn<TValues>;
  onSubmit: (values: TValues) => Promise<void>;
  successMessage: string;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
};

function useFormDialogSubmit<TValues extends FieldValues>({
  form,
  onSubmit,
  onOpenChange,
  successMessage,
}: Pick<
  FormDialogProps<TValues>,
  'form' | 'onSubmit' | 'onOpenChange' | 'successMessage'
>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submit: SubmitHandler<TValues> = async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit: form.handleSubmit(submit) };
}

export function FormDialog<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  successMessage,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  children,
}: FormDialogProps<TValues>) {
  const { isSubmitting, handleSubmit } = useFormDialogSubmit({
    form,
    onSubmit,
    onOpenChange,
    successMessage,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
