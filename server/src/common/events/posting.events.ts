/**
 * Domain events emitted when an operational record is posted (becomes final).
 *
 * Phase 1 only *emits* these — the Phase 2 emission engine subscribes to them
 * to run the accounting (Path A) capture path. Defining the contract now keeps
 * the event bus a stable seam between the two phases.
 */

export const PostingEvents = {
  InvoicePosted: 'invoice.posted',
  ExpensePosted: 'expense.posted',
} as const;

export interface InvoicePostedEvent {
  invoiceId: number;
  partnerId: number;
  postedAt: Date;
}

export interface ExpensePostedEvent {
  expenseId: number;
  employeeId: number;
  postedAt: Date;
}
