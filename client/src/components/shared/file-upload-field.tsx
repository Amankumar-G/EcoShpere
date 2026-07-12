'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Paperclip, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUploadFile } from '@/data/uploads/uploads.hooks';
import { toAbsoluteUploadUrl } from '@/data/uploads/uploads.api';
import { getErrorMessage } from '@/lib/axios/get-error-message';

/**
 * Controlled upload field: holds a stored file URL (`/uploads/…`). Uploads the
 * chosen file, then reports the resulting URL via `onChange`. Reused for CSR /
 * challenge proofs and policy PDFs.
 */
export function FileUploadField({
  value,
  onChange,
  accept = '.pdf,image/*',
  label = 'Upload file',
}: {
  value?: string | null;
  onChange: (url: string | undefined) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useUploadFile();

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
      toast.success('File uploaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" />
          <a
            href={toAbsoluteUploadUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="truncate hover:underline"
          >
            View uploaded file
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label="Remove file"
            onClick={() => onChange(undefined)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {upload.isPending ? 'Uploading…' : label}
        </Button>
      )}
    </div>
  );
}
