-- Add notes column to order items for special instructions
ALTER TABLE "OrderItem"
ADD COLUMN "notes" TEXT;
