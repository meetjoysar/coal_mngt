-- CreateEnum
CREATE TYPE "RateInputMethod" AS ENUM ('WITHOUT_GST', 'WITH_GST_INCLUSIVE');

-- AlterTable
ALTER TABLE "dispatches" ADD COLUMN     "goodwillPerMt" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "otherExpensesPercent" DECIMAL(5,2) NOT NULL DEFAULT 0.5,
ADD COLUMN     "purchaseRateInputMethod" "RateInputMethod" NOT NULL DEFAULT 'WITHOUT_GST',
ADD COLUMN     "saleGstPercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
ADD COLUMN     "saleRateInputMethod" "RateInputMethod" NOT NULL DEFAULT 'WITHOUT_GST',
ADD COLUMN     "taxationBasePercent" DECIMAL(5,2) NOT NULL DEFAULT 2,
ADD COLUMN     "taxationRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 30.4;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "saleRateInputMethod" "RateInputMethod" NOT NULL DEFAULT 'WITHOUT_GST';
