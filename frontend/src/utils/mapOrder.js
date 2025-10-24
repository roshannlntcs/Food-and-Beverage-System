// src/utils/mapOrder.js
const STATUS_MAP = {
  IN_PROGRESS: "pending",
  READY: "ongoing",
  SERVED: "ongoing",
  PAID: "complete",
  VOIDED: "cancelled",
  REFUNDED: "cancelled",
};

const UI_TO_ORDER_STATUS = {
  pending: "IN_PROGRESS",
  ongoing: "READY",
  complete: "PAID",
  cancelled: "VOIDED",
};

const ensureTransactionId = (order = {}) => {
  const direct = order.transactionId || order.transactionID;
  if (direct) return direct;

  const base =
    (order.orderCode || order.orderID || order.id || "")
      .toString()
      .trim()
      .toUpperCase();
  if (!base) {
    const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `TRN-${rand}`;
  }

  if (base.startsWith("TRN-")) return base;
  const stripped = base.replace(/^ORD[-_]?/i, "");
  return `TRN-${stripped || base}`;
};

function mapPaymentDetails(order) {
  const payments = Array.isArray(order.payments) ? order.payments : [];
  const primaryPayment = payments[0] || {};
  const tendered =
    primaryPayment.tendered ?? order.tendered ?? order.paidAmount ?? 0;
  const change = primaryPayment.change ?? order.changeDue ?? 0;
  const method = (primaryPayment.method || order.paymentMethod || "CASH").toUpperCase();

  return {
    payments,
    primary: primaryPayment,
    method,
    tendered,
    change,
  };
}

function mapOrderItems(order) {
  const rawItems = Array.isArray(order.items) ? order.items : [];

  return rawItems.map((item, index) => {
    const addons = Array.isArray(item.addons) ? item.addons : [];
    const addonSelections = Array.isArray(item.selectedAddons) ? item.selectedAddons : addons;
    const quantity = Number(item.qty ?? item.quantity ?? 0);
    const basePrice = Number(item.price ?? item.basePrice ?? 0);
    const sizePrice =
      typeof item.size?.price === "number" && !Number.isNaN(item.size.price)
        ? Number(item.size.price)
        : 0;
    const addonsTotal = addons.reduce(
      (sum, addon) => sum + Number(addon?.price || 0),
      0
    );
    const effectiveBase = sizePrice > 0 ? sizePrice : basePrice;
    const unitPrice = effectiveBase + addonsTotal;
    const totalPrice = Number(
      item.lineTotal ?? (unitPrice * (quantity || 1))
    );
    const notes =
      [
        item.notes,
        item.specialInstructions,
        item.instructions,
        item.customerNote,
        item.remark,
        item.remarks,
      ]
        .map((candidate) =>
          typeof candidate === "string" ? candidate.trim() : candidate ?? ""
        )
        .find((candidate) => Boolean(candidate)) || "";

    return {
      id:
        String(item.id ?? item.orderItemId ?? item.productId ?? `${order.orderCode || "ORD"}-${index}`),
      orderItemId: item.id ?? item.orderItemId ?? null,
      productId: item.productId ?? null,
      name: item.name,
      quantity,
      price: basePrice,
      unitPrice,
      totalPrice,
      size: item.size || null,
      selectedAddons: addonSelections,
      notes,
      voided: Boolean(item.voided),
      voidReason: item.voidReason || null,
    };
  });
}

export function mapOrderToTx(order = {}) {
  const payment = mapPaymentDetails(order);
  const items = mapOrderItems(order);
  const subtotal = Number(order.subtotal || 0);
  const discountPct = Number(order.discountPct || 0);
  const discountAmt = Number(order.discount || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || 0);
  const orderCode = order.orderCode || order.orderID || `ORD-${order.id || ""}`;
  const transactionId = ensureTransactionId(order);
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const cashierName =
    order.cashier?.fullName ||
    order.cashier?.username ||
    order.createdBy?.fullName ||
    order.createdBy?.username ||
    "N/A";
  const statusNormalized = String(order.status || "").toUpperCase();
  const hasVoidedItems = items.some((it) => it.voided);

  return {
    id: transactionId || orderCode,
    orderDbId: order.id ?? null,
    orderCode,
    transactionID: transactionId || orderCode,
    orderID: orderCode,
    cashierId: order.cashierId ?? order.cashier?.id ?? null,
    cashier: cashierName,
    items,
    subtotal,
    discountPct,
    discountAmt,
    discountType: order.discountType || "",
    couponCode: order.couponCode || "",
    couponValue: Number(order.couponValue || 0),
    tax,
    total,
    method: payment.method,
    paymentDetails: {
      ref: payment.primary?.ref || null,
      tendered: payment.tendered,
      change: payment.change,
      details: payment.primary?.details || null,
    },
    tendered: payment.tendered,
    change: payment.change,
    date: createdAt.toLocaleString(),
    createdAt: createdAt.toISOString(),
    voided: statusNormalized === "VOIDED",
    hasVoidedItems,
    status: order.status || "PAID",
  };
}

export function mapOrderStatusToUi(status) {
  const normalized = String(status || "").toUpperCase();
  return STATUS_MAP[normalized] || "pending";
}

export function mapUiStatusToOrder(status) {
  const normalized = String(status || "").toLowerCase();
  return UI_TO_ORDER_STATUS[normalized] || null;
}

export function mapOrderToUiOrder(order = {}) {
  const tx = mapOrderToTx(order);
  return {
    id: tx.orderDbId ?? tx.transactionID,
    orderDbId: tx.orderDbId ?? null,
    orderID: tx.orderCode,
    transactionID: tx.transactionID,
    cashierId: tx.cashierId ?? null,
    items: tx.items,
    subtotal: tx.subtotal,
    total: tx.total,
    status: mapOrderStatusToUi(order.status),
    voided: tx.voided,
    discountType: tx.discountType,
    couponCode: tx.couponCode,
    date: tx.date,
    createdAt: tx.createdAt,
    cashier: tx.cashier,
  };
}
