'use client';

import * as React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/axios/get-error-message';
import { CsvImportResult } from '@/types/records.interface';

export type CsvImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Human hint listing the expected CSV header columns. */
  columnsHint: string;
  onImport: (csv: string) => Promise<CsvImportResult>;
};

export function CsvImportDialog({
  open,
  onOpenChange,
  title,
  columnsHint,
  onImport,
}: CsvImportDialogProps) {
  const [csv, setCsv] = React.useState('');
  const [result, setResult] = React.useState<CsvImportResult | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setCsv('');
      setResult(null);
    }
  }, [open]);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const importResult = await onImport(csv);
      setResult(importResult);
      toast.success(
        `Imported ${importResult.imported} row(s), ${importResult.failed.length} failed`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Paste CSV with a header row. Columns: {columnsHint}.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={8}
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          placeholder={columnsHint}
          className="font-mono text-xs"
        />
        {result && (
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
            <span className="font-medium">
              Imported {result.imported} · Failed {result.failed.length}
            </span>
            {result.failed.length > 0 && (
              <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto text-muted-foreground">
                {result.failed.map((failure) => (
                  <li key={failure.row}>
                    Row {failure.row}: {failure.errors.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || csv.trim().length === 0}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
