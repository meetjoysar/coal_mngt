-- CreateTable
CREATE TABLE "transporters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "vehicleOwnerType" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transporters_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "dispatches" ADD COLUMN "transporterId" TEXT;

-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "transportType";

-- CreateIndex
CREATE INDEX "dispatches_transporterId_idx" ON "dispatches"("transporterId");

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "transporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "TransportType";
