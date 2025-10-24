-- AlterTable
ALTER TABLE "Order" ADD COLUMN "transactionId" TEXT;

-- CreateTable
CREATE TABLE "SupplierLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "quantity" INTEGER,
    "unitCost" REAL,
    "status" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "inventoryLogId" INTEGER,
    "recordedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierLog_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupplierLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupplierLog_inventoryLogId_fkey" FOREIGN KEY ("inventoryLogId") REFERENCES "InventoryLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupplierLog_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_transactionId_key" ON "Order"("transactionId");