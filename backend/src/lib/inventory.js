// backend/src/lib/inventory.js
// Helper utilities for recording inventory changes in a transaction-safe way.
async function recordInventoryLog(tx, {
  productId,
  productName,
  action,
  detail,
  stock,
  oldPrice,
  newPrice,
  category,
  userId,
}) {
  try {
    return await tx.inventoryLog.create({
      data: {
        productId: productId || null,
        productName,
        action,
        detail: detail || null,
        stock: stock ?? null,
        oldPrice: oldPrice ?? null,
        newPrice: newPrice ?? null,
        category: category || null,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to record inventory log:', error);
    return null;
  }
}

module.exports = {
  recordInventoryLog,
};

