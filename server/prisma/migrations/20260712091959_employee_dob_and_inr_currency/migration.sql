-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "dob" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "currency" SET DEFAULT 'INR';
