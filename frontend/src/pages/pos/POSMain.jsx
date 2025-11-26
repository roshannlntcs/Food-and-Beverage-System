// src/pages/pos/POSMain.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, fetchVoidLogs, createOrder, voidOrderWithToken } from "../../api/orders";
import { BASE_URL } from "../../api/client";

// Layout Components
import Header from "../../components/Header";
import Sidebar from "../../components/POSSidebar";
import TabsPanel from "../../components/TabsPanel";
import ProductGrid from "../../components/ProductGrid";
import CartPanel from "../../components/CartPanel";

// Tab Panels
import OrdersPanel from "../../components/OrdersTab";
import TransactionsPanel from "../../components/TransactionsTab";
import ItemsTab from "../../components/ItemsTab";

// Modals
import ItemDetailModal from "../../components/modals/ItemDetailModal";
import DiscountModal from "../../components/modals/DiscountModal";
import ManagerAuthModal from "../../components/modals/ManagerAuthModal";
import VoidReasonModal from "../../components/modals/VoidReasonModal";
import ReceiptModal from "../../components/modals/ReceiptModal";
import OrderSuccessModal from "../../components/modals/OrderSuccessModal";
import HistoryModal from "../../components/modals/HistoryModal";
import ProfileModal from "../../components/modals/ProfileModal";
import TransactionDetailModal from "../../components/modals/TransactionDetailModal";
import OrderDetailModal from "../../components/modals/OrderDetailModal";
import VoidDetailModal from "../../components/modals/VoidDetailModal";

// Payment Modals
import CashPaymentModal from "../../components/modals/CashPaymentModal";
import CardPaymentModal from "../../components/modals/CardPaymentModal";
import QRSPaymentModal from "../../components/modals/QRSPaymentModal";

// Utilities
import { mapOrderToTx, mapOrderToUiOrder } from "../../utils/mapOrder";
import { placeholders, shopDetails } from "../../utils/data";
import { canonicalCategoryName } from "../../utils/categories";
import { useInventory } from "../../contexts/InventoryContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ToastProvider";
import resolveUserAvatar from "../../utils/avatarHelper";
import { normalizeNotifications } from "../../utils/notificationHelpers";

const DEFAULT_LOW_THRESHOLD = 10;

const toDateTimeString = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const getUserDisplayName = (user) => {
  if (!user) return "N/A";
  return (
    user.fullName ||
    user.schoolId ||
    user.username ||
    (typeof user.id !== "undefined" ? `User ${user.id}` : "N/A")
  );
};

const buildVoidedItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const quantity = Number(item?.qty ?? item?.quantity ?? 0) || 0;
    const lineTotal = Number(item?.lineTotal || 0);
    const basePrice = Number(item?.price ?? item?.basePrice ?? 0);
    const unitPrice =
      quantity > 0 && lineTotal > 0
        ? lineTotal / quantity
        : basePrice || Number(item?.unitPrice ?? 0);
    const selectedAddons = Array.isArray(item?.selectedAddons)
      ? item.selectedAddons
      : Array.isArray(item?.addons)
      ? item.addons
      : [];
    const notes =
      [
        item?.notes,
        item?.specialInstructions,
        item?.instructions,
        item?.customerNote,
        item?.remark,
        item?.remarks,
      ]
        .map((candidate) =>
          typeof candidate === "string" ? candidate.trim() : candidate ?? ""
        )
        .find((candidate) => Boolean(candidate)) || "";
    return {
      name: item?.name || "Item",
      quantity,
      price: unitPrice,
      selectedAddons,
      size: item?.size || null,
      notes,
    };
  });
};

const normalizeVoidLog = (log) => {
  if (!log) return null;
  const typeLabel =
    log.voidType === "TRANSACTION" ? "Full Transaction Void" : "Item Void";

  return {
    ...log,
    txId: log.transactionId,
    type: typeLabel,
    amount: Number(log.amount || 0),
    dateTime: toDateTimeString(log.approvedAt || log.requestedAt),
    cashier: getUserDisplayName(log.cashier),
    manager: getUserDisplayName(log.manager),
    cashierId: log.cashier?.id ?? log.cashierId ?? null,
    managerId: log.manager?.id ?? log.managerId ?? null,
    cashierUser: log.cashier || null,
    managerUser: log.manager || null,
    fullyVoided: log.voidType === "TRANSACTION",
    voidedItemsDetailed: buildVoidedItems(log.items),
  };
};

const filterVoidLogsForUser = (logs, userId) => {
  if (!userId) return logs;
  return logs.filter((log) => {
    return log.cashierId === userId || log.managerId === userId;
  });
};

export default function POSMain() {
  const navigate = useNavigate();
  const { inventory = [], applyTransaction } = useInventory();
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { showToast } = useToast();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("Menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [pendingOrderSuccess, setPendingOrderSuccess] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [editingCartIndex, setEditingCartIndex] = useState(null);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  // VOID workflow states
  const [showManagerAuth, setShowManagerAuth] = useState(false);
  const [managerAuth, setManagerAuth] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [voidContext, setVoidContext] = useState({ type: null, index: null, tx: null }); // { type: 'transaction' | 'item', index, tx }

  const [showVoidDetailModal, setShowVoidDetailModal] = useState(false);
  const [selectedVoidLog, setSelectedVoidLog] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [voidLogs, setVoidLogs] = useState([]);

  const currentUserId = currentUser?.id ?? null;

  const refreshOrdersAndVoids = useCallback(async () => {
    const userFilter = currentUserId ? { cashierId: currentUserId } : {};
    try {
      const ordersResponse = await fetchOrders(userFilter);
      const orderList = Array.isArray(ordersResponse?.data)
        ? ordersResponse.data
        : Array.isArray(ordersResponse)
          ? ordersResponse
          : [];
      const filteredList = currentUserId
        ? orderList.filter(
            (order) =>
              (order.cashierId ?? order.cashier?.id ?? null) === currentUserId
          )
        : orderList;
      const uiOrders = filteredList.map(mapOrderToUiOrder);
      setOrders(uiOrders);
      const mappedTransactions = filteredList
        .map(mapOrderToTx)
        .sort((a, b) => {
          const aDate = new Date(a.createdAt || a.date || 0).getTime();
          const bDate = new Date(b.createdAt || b.date || 0).getTime();
          return bDate - aDate;
        });
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }

    try {
      const voidResponse = await fetchVoidLogs();
      const logs = Array.isArray(voidResponse?.data)
        ? voidResponse.data
        : Array.isArray(voidResponse)
          ? voidResponse
          : [];
      const normalized = logs.map((entry) => normalizeVoidLog(entry)).filter(Boolean);
      const filtered = filterVoidLogsForUser(normalized, currentUserId);
      setVoidLogs(filtered);
    } catch (error) {
      console.error("Failed to fetch void logs:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshOrdersAndVoids();
  }, [refreshOrdersAndVoids]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyContext, setHistoryContext] = useState(null);

  // user info
  const userName = currentUser?.fullName || "Cashier";
  const schoolId = currentUser?.schoolId || "";
  const avatarUrl = resolveUserAvatar(currentUser);
  const profilePic = avatarUrl;
  const profileAnalytics = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, tx) => sum + Number(tx.total || 0),
      0
    );
    const totalSold = transactions.reduce((sum, tx) => {
      const items = Array.isArray(tx.items) ? tx.items : [];
      const qty = items.reduce(
        (acc, item) => acc + Number(item?.quantity || 0),
        0
      );
      return sum + qty;
    }, 0);
    const totalVoids = voidLogs.length;
    const avgPerTransaction = totalTransactions
      ? totalRevenue / totalTransactions
      : 0;

    const itemTotals = new Map();
    transactions.forEach((tx) => {
      const items = Array.isArray(tx.items) ? tx.items : [];
      items.forEach((item) => {
        if (!item) return;
        const key =
          item.productId ||
          item.name ||
          String(item.id || item.orderItemId || "");
        if (!key) return;
        const current = itemTotals.get(key) || {
          name: item.name || "Item",
          qty: 0,
        };
        current.qty += Number(item.quantity || 0);
        itemTotals.set(key, current);
      });
    });
    const bestSeller = Array.from(itemTotals.values()).reduce(
      (best, entry) => (entry.qty > (best?.qty || 0) ? entry : best),
      null
    );

    return {
      totalSold,
      totalRevenue,
      totalTransactions,
      totalVoids,
      avgPerTransaction,
      bestSeller,
    };
  }, [transactions, voidLogs]);

  const pesoFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }),
    []
  );

  const stockNotifications = useMemo(() => {
    const parseStamp = (value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };
    return (inventory || []).reduce((acc, item) => {
      if (!item) return acc;
      const currentQty = Number(item.quantity ?? 0);
      const threshold =
        Number(item.lowThreshold ?? DEFAULT_LOW_THRESHOLD) || DEFAULT_LOW_THRESHOLD;
      if (currentQty > threshold && currentQty > 0) return acc;
      const severity = currentQty <= 0 ? "out" : "low";
      const baseStamp =
        parseStamp(item.updatedAt) ||
        parseStamp(item.updated_at) ||
        parseStamp(item.lastUpdated) ||
        parseStamp(item.createdAt);
      const timestamp = baseStamp ? baseStamp.toISOString() : new Date().toISOString();
      const stockKey =
        item.id ||
        item._id ||
        item.uuid ||
        item.productId ||
        item.sku ||
        item.code ||
        item.name ||
        "stock";
      const notifId = ["stock", severity, stockKey].filter(Boolean).join("|");
      acc.push({
        type: "stock",
        severity,
        text:
          severity === "out"
            ? `Out of stock: ${item.name}`
            : `Low stock: ${item.name} (${currentQty} left)`,
        timestamp,
        time: (baseStamp ? baseStamp.toLocaleString() : null) || new Date().toLocaleString(),
        stockId: stockKey,
        stockName: item.name || "Item",
        currentQty,
        threshold,
        id: notifId,
      });
      return acc;
    }, []);
  }, [inventory]);

  const orderNotifications = useMemo(() => {
    return transactions.map((tx) => {
      const iso = tx.createdAt || tx.date || new Date().toISOString();
      return {
        type: "order",
        text: `Transaction ${tx.transactionID || tx.id || "Order"} - ${pesoFormatter.format(
          tx.total || 0
        )}`,
        timestamp: iso,
        time: new Date(iso).toLocaleString(),
      };
    });
  }, [transactions, pesoFormatter]);

  const dashboardNotifications = useMemo(() => {
    return normalizeNotifications([...stockNotifications, ...orderNotifications]);
  }, [stockNotifications, orderNotifications]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__dashboardNotifications = dashboardNotifications;
    window.dispatchEvent(
      new CustomEvent("dashboard-notifications-update", { detail: dashboardNotifications })
    );
  }, [dashboardNotifications]);

  // Customer view refs & state
  const customerWinRef = React.useRef(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState(null);
  const [customerViewOpened, setCustomerViewOpened] = useState(false);

  // Payment modal states
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPayment, setQrPayment] = useState({
    status: "idle",
    reference: null,
    payload: null,
    amount: 0,
  });

  const placeholderProducts = useMemo(() => {
    return Object.entries(placeholders).flatMap(([categoryName, items]) =>
      (items || []).map((item) => ({
        ...item,
        id: item.id ?? null,
        backendId: null,
        source: "placeholder",
        hasBackend: false,
        category: canonicalCategoryName(categoryName),
        price: Number(item.price || 0),
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        addons: Array.isArray(item.addons) ? item.addons : [],
      }))
    );
  }, []);

  const backendProducts = useMemo(() => {
    return (inventory || []).map((item) => ({
      ...item,
      id: item.id,
      backendId: item.id,
      source: "backend",
      hasBackend: true,
      category: canonicalCategoryName(item.category || ""),
      price: Number(item.price || 0),
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      addons: Array.isArray(item.addons) ? item.addons : [],
      image: item.image || item.imageUrl || "",
    }));
  }, [inventory]);

  const combinedProducts = useMemo(() => {
    const mapByKey = new Map();
    placeholderProducts.forEach((item) => {
      const key = `${canonicalCategoryName(item.category || "")}|${String(item.name || "").toLowerCase()}`;
      if (!mapByKey.has(key)) {
        mapByKey.set(key, item);
      }
    });
    backendProducts.forEach((item) => {
      const key = `${canonicalCategoryName(item.category || "")}|${String(item.name || "").toLowerCase()}`;
      const existing = mapByKey.get(key);
      if (existing) {
        mapByKey.set(key, {
          ...existing,
          ...item,
          hasBackend: true,
          backendId: item.id || existing.backendId || null,
        });
      } else {
        mapByKey.set(key, item);
      }
    });
    return Array.from(mapByKey.values());
  }, [placeholderProducts, backendProducts]);

  const displayProducts = useMemo(() => {
    const withBackend = combinedProducts.filter((item) => item.hasBackend !== false);
    return withBackend.length ? withBackend : combinedProducts;
  }, [combinedProducts]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const active = canonicalCategoryName(activeCategory);
    return displayProducts.filter((item) => {
      const categoryLabel = canonicalCategoryName(item.category || "");
      if (active && categoryLabel !== active) return false;
      if (term && !String(item.name || "").toLowerCase().includes(term)) return false;
      if (item.active === false) return false;
      return true;
    });
  }, [displayProducts, activeCategory, searchTerm]);

  const handleSwitchRole = useCallback(() => {
    setShowProfileModal(false);
    navigate("/roles", { replace: true });
    window.location.reload();
  }, [navigate]);

  const handleSignOut = useCallback(async () => {
    setShowProfileModal(false);
    if (logout) {
      try {
        await logout();
      } catch (err) {
        console.warn("Logout failed:", err);
      }
    }
    navigate("/user-login", { replace: true });
    window.location.reload();
  }, [logout, navigate]);

  const handleAvatarUpload = useCallback(
    async (file) => {
      if (!file) return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      try {
        await updateProfile({ avatarUrl: dataUrl });
        showToast({
          message: "Profile photo updated",
          type: "success",
          ttl: 2500,
        });
      } catch (error) {
        const message =
          error?.message || "Failed to update profile photo";
        showToast({ message, type: "error", ttl: 3000 });
        throw error;
      }
    },
    [updateProfile, showToast]
  );

  const handleChangePassword = useCallback(
    async (oldPassword, newPassword) => {
      try {
        await changePassword(oldPassword, newPassword);
        showToast({
          message: "Password updated successfully",
          type: "success",
          ttl: 2500,
        });
      } catch (error) {
        const message = error?.message || "Failed to change password";
        showToast({ message, type: "error", ttl: 3000 });
        throw error;
      }
    },
    [changePassword, showToast]
  );

  const openEditModal = (item, index) => {
    setModalProduct({
      ...item,
      selectedAddons: item.selectedAddons || [],
      quantity: item.quantity || 1,
      notes: item.notes || "",
    });
    setEditingCartIndex(index);
    setShowModal(true);
  };

  const removeCartItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // open product details/modal (when clicking item in ProductGrid)
  const openProductModal = (item) => {
    if (!item?.id) {
      showToast({
        message: "This item is not available in inventory yet.",
        type: "warning",
        ttl: 2600,
      });
      return;
    }
    const defaultSize =
      Array.isArray(item.sizes) && item.sizes.length ? item.sizes[0] : null;
    setModalProduct({
      ...item,
      size: defaultSize,
      selectedAddons: [],
      quantity: 1,
      notes: "",
    });
    setShowModal(true);
    setEditingCartIndex(null);

    // Auto-open customer view only the first time for this transaction
    try {
      if (!customerViewOpened) {
        openCustomerView();
        setCustomerViewOpened(true);
      }
    } catch (e) {}
  };


  // ---- totals (compute BEFORE using in useCallback deps) ----
  const subtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const discountAmt = +(subtotal * discountPct / 100).toFixed(2);
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax - discountAmt).toFixed(2);

  const buildPendingOrder = useCallback(
    (id) => {
      const now = new Date();
      return {
        id,
        orderDbId: null,
        orderID: id,
        transactionID: id,
        cashierId: currentUserId,
        items: cart.map((item, index) => ({
          id: `${item.id || "item"}-${index}`,
          name: item.name,
          quantity: Number(item.quantity || 1),
          price: Number(item.price ?? item.totalPrice ?? 0),
          selectedAddons: Array.isArray(item.selectedAddons)
            ? item.selectedAddons
            : [],
          addons: Array.isArray(item.selectedAddons)
            ? item.selectedAddons
            : [],
          size: item.size || null,
          notes: item.notes || "",
          voided: false,
        })),
        subtotal,
        total,
        status: "pending",
        voided: false,
        discountType,
        couponCode,
        date: now.toLocaleString(),
        createdAt: now.toISOString(),
        cashier: getUserDisplayName(currentUser),
      };
    },
    [cart, subtotal, total, discountType, couponCode, currentUser, currentUserId]
  );

  useEffect(() => {
    if (cart.length === 0) {
      if (pendingOrderId) {
        setOrders((prev) => prev.filter((order) => order.orderID !== pendingOrderId));
        setPendingOrderId(null);
      }
      return;
    }

    const seed = Math.random().toString(36).substring(2, 10).toUpperCase();
    const id = pendingOrderId || `PEND-${seed}`;
    const placeholder = buildPendingOrder(id);

    setOrders((prev) => {
      const exists = prev.some((order) => order.orderID === id);
      if (exists) {
        return prev.map((order) =>
          order.orderID === id ? { ...order, ...placeholder } : order
        );
      }
      return [placeholder, ...prev];
    });

    if (!pendingOrderId) setPendingOrderId(id);
  }, [cart, buildPendingOrder, pendingOrderId]);

  useEffect(() => {
    const amount = Number(total || 0);
    setQrPayment((prev) => {
      if (Number(prev.amount || 0) === amount) return prev;
      return { ...prev, amount };
    });
  }, [total]);

  useEffect(() => {
    if (cart.length === 0) {
      setQrPayment((prev) => {
        if (
          prev.status === "idle" &&
          !prev.reference &&
          !prev.payload &&
          Number(prev.amount || 0) === Number(total || 0)
        ) {
          return prev;
        }
        return {
          status: "idle",
          reference: null,
          payload: null,
          amount: Number(total || 0),
        };
      });
    }
  }, [cart.length, total]);

  const handleQrReady = useCallback(
    (info) => {
      if (!info) {
        setQrPayment({
          status: "idle",
          reference: null,
          payload: null,
          amount: Number(total || 0),
        });
        return;
      }
      setQrPayment({
        status: info.status || "waiting",
        reference: info.reference || null,
        payload: info.payload || null,
        amount: Number(total || 0),
      });
    },
    [total]
  );

  const handleQrStatusChange = useCallback(
    (next) => {
      if (!next) {
        setQrPayment({
          status: "idle",
          reference: null,
          payload: null,
          amount: Number(total || 0),
        });
        return;
      }
      setQrPayment((prev) => ({
        status: next.status || prev.status || "idle",
        reference: next.reference ?? prev.reference ?? null,
        payload: next.payload ?? prev.payload ?? null,
        amount: Number(total || 0),
      }));
    },
    [total]
  );

  // ---- server-backed finalizeTransaction ----
  const finalizeTransaction = useCallback(async (paymentInfo = {}) => {
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const methodLabel = paymentInfo.method || paymentMethod || 'Cash';
    const normalizedMethod =
      methodLabel === 'Card'
        ? 'CARD'
        : methodLabel === 'QRS'
          ? 'QR'
          : 'CASH';

    const tendered = Number(
      paymentInfo.tendered ?? paymentInfo.amount ?? total
    );

    const orderPayload = {
      type: 'WALKIN',
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        size: item.size
          ? { label: item.size.label || item.size.name || '', price: Number(item.size.price || 0) }
          : null,
        addons: Array.isArray(item.selectedAddons)
          ? item.selectedAddons.map((addon) => ({
              label: addon.label || addon.name || '',
              price: Number(addon.price || 0),
            }))
          : [],
        notes: item.notes || '',
      })),
      discountPct: Number(discountPct || 0),
      discountValue: 0,
      discountType: discountType || null,
      couponCode: couponCode || null,
      couponValue: 0,
      taxRate: 0.12,
      payment: {
        method: normalizedMethod,
        tendered,
        amount: Number(total),
        ref:
          paymentInfo.authCode ||
          paymentInfo.reference ||
          paymentInfo.ref ||
          null,
        details: paymentInfo || null,
      },
    };

    try {
      if (pendingOrderId) {
        setOrders((prev) =>
          prev.filter((order) => order.orderID !== pendingOrderId)
        );
        setPendingOrderId(null);
      }

      const created = await createOrder(orderPayload);
      const mappedTx = mapOrderToTx(created);
      const uiOrder = mapOrderToUiOrder(created);

      const ownsOrder = !currentUserId || uiOrder.cashierId === currentUserId;
      setOrders((prev) => {
        const next = prev.filter(
          (o) =>
            (o.orderDbId ?? o.id) !== (uiOrder.orderDbId ?? uiOrder.id) &&
            o.orderID !== uiOrder.orderID
        );
        return ownsOrder ? [uiOrder, ...next] : next;
      });
      setTransactions((prev) => {
        const remaining = prev.filter((t) => t.id !== mappedTx.id);
        return !currentUserId || mappedTx.cashierId === currentUserId
          ? [mappedTx, ...remaining]
          : remaining;
      });

      // update inventory UI
      try {
        applyTransaction(
          cart.map((item) => ({
            id: item.id,
            name: item.name,
            qty: Number(item.quantity || 1),
          }))
        );
      } catch (_e) {}

      const paymentSummary = {
        method: methodLabel,
        tendered,
        change: Number((tendered - total).toFixed(2)),
        total,
        ref:
          paymentInfo.authCode ||
          paymentInfo.reference ||
          paymentInfo.ref ||
          null,
      };
      setLastPaymentInfo(paymentSummary);
      setSelectedTransaction(mappedTx);
      setPendingOrderSuccess(true);
      setShowReceiptModal(true);
      setShowOrderSuccess(false);

      setCart([]);
      setPaymentMethod('');
      setDiscountType('');
      setDiscountPct(0);
      setCouponCode('');
      setQrPayment({
        status: "idle",
        reference: null,
        payload: null,
        amount: 0,
      });
      if (customerWinRef.current && !customerWinRef.current.closed) {
        try {
          customerWinRef.current.close();
        } catch (_e) {}
      }
      setCustomerViewOpened(false);

      await refreshOrdersAndVoids();
    } catch (error) {
      console.error('Failed to finalize transaction:', error);
      alert(error?.message || 'Failed to complete transaction.');
    }
  }, [
    cart,
    discountPct,
    discountType,
    couponCode,
    total,
    paymentMethod,
    applyTransaction,
    refreshOrdersAndVoids,
    currentUserId,
    pendingOrderId,
  ]);

  const buildCustomerPayload = useCallback(() => {
    const amount = Number(qrPayment.amount ?? total ?? 0);
    return {
      cart,
      subtotal,
      tax,
      total,
      discountPct,
      discountAmt,
      discountType,
      couponCode,
      paymentMethod,
      qrPayment: {
        status: qrPayment.status || "idle",
        reference: qrPayment.reference || null,
        payload: qrPayment.payload || null,
        amount,
      },
    };
  }, [
    cart,
    subtotal,
    tax,
    total,
    discountPct,
    discountAmt,
    discountType,
    couponCode,
    paymentMethod,
    qrPayment,
  ]);

  const broadcastCart = useCallback(
    (override) => {
      const payload = override || buildCustomerPayload();
      if (customerWinRef.current && !customerWinRef.current.closed) {
        try {
          customerWinRef.current.postMessage(payload, window.location.origin);
        } catch (_e) {}
      }
    },
    [buildCustomerPayload]
  );

  // open/focus customer view
  const openCustomerView = useCallback(() => {
    const payload = buildCustomerPayload();
    const url = window.location.origin + "/customer-view";
    if (!customerWinRef.current || customerWinRef.current.closed) {
      customerWinRef.current = window.open(
        url,
        "customerView",
        "width=420,height=780,toolbar=no,menubar=no"
      );
      setTimeout(() => broadcastCart(payload), 300);
    } else {
      customerWinRef.current.focus();
      broadcastCart(payload);
    }
  }, [buildCustomerPayload, broadcastCart]);

  // ensure broadcast on every cart/payment change
  useEffect(() => {
    broadcastCart();
  }, [broadcastCart]);

  // Reset active category when moving away from Menu/Items
  useEffect(() => {
    if (!(activeTab === "Menu" || activeTab === "Status")) {
      setActiveCategory(null);
    }
  }, [activeTab]);

  // Reset customerViewOpened when cart becomes empty
  useEffect(() => {
    if (cart.length === 0) {
      setCustomerViewOpened(false);
    }
  }, [cart.length]);

  const handleReceiptClose = useCallback(() => {
    setShowReceiptModal(false);
    setSelectedTransaction(null);
    if (pendingOrderSuccess) {
      setPendingOrderSuccess(false);
      setShowOrderSuccess(true);
    }
  }, [pendingOrderSuccess]);

  // --- VOID FLOW (server-backed) ---
  const triggerVoid = useCallback(
    (type, txOrIndex = null, maybeIndex = null) => {
      let tx = null;
      let index = null;

      if (txOrIndex && typeof txOrIndex === "object") {
        tx = txOrIndex;
      } else if (typeof txOrIndex === "number") {
        index = txOrIndex;
      }

      if (typeof maybeIndex === "number") {
        index = maybeIndex;
      } else if (maybeIndex && typeof maybeIndex === "object") {
        tx = maybeIndex;
      }

      if (!tx) {
        tx = historyContext?.tx || selectedTransaction || null;
      }

      if (!tx) {
        showToast({
          message: "No transaction selected for void.",
          type: "warning",
          ttl: 2600,
        });
        return;
      }

      const cashierLabel = currentUser?.fullName || userName;

      const txForModal = tx ? { ...tx, cashier: cashierLabel } : tx;

      setVoidContext({ type, tx: txForModal, index });
      setManagerAuth(null);
      setShowReasonModal(false);
      setShowManagerAuth(true);
    },
    [historyContext, selectedTransaction, showToast, currentUser, userName]
  );

  const handleHistoryVoidRequest = useCallback(
    (tx, itemIndex) => {
      if (!tx) return;
      setShowHistoryModal(false);
      if (typeof itemIndex === "number") {
        triggerVoid("item", tx, itemIndex);
      } else {
        triggerVoid("transaction", tx);
      }
    },
    [triggerVoid]
  );

  const confirmVoid = useCallback(
    async (reason = "No reason provided", itemIds = []) => {
      const { type, tx, index } = voidContext || {};

      if (!tx) {
        showToast({
          message: "No transaction selected for void.",
          type: "warning",
          ttl: 2600,
        });
        setShowReasonModal(false);
        setShowManagerAuth(false);
        setManagerAuth(null);
        setVoidContext({ type: null, index: null, tx: null });
        return;
      }

      if (!managerAuth?.token) {
        showToast({
          message: "Manager approval is required before voiding.",
          type: "warning",
          ttl: 3000,
        });
        setShowReasonModal(false);
        setShowManagerAuth(true);
        return;
      }

      const cleanedReason = (reason || "No reason provided").trim() || "No reason provided";
      const payload = {
        type: type === "transaction" ? "TRANSACTION" : "ITEM",
        reason: cleanedReason,
        notes: null,
      };

      let orderItemIds = Array.isArray(itemIds) ? itemIds.filter(Boolean) : [];

      if (type === "item" && !orderItemIds.length && typeof index === "number") {
        const fallbackId = tx.items?.[index]?.orderItemId ?? tx.items?.[index]?.id ?? null;
        if (fallbackId != null) {
          orderItemIds = [fallbackId];
        }
      }

      if (type === "item") {
        if (!orderItemIds.length) {
          showToast({
            message: "Select at least one item to void.",
            type: "warning",
            ttl: 2800,
          });
          setShowReasonModal(true);
          return;
        }
        payload.items = orderItemIds.map((id) => ({ orderItemId: Number(id) }));
      }

      try {
        const orderIdentifier =
          tx.orderDbId ??
          tx.orderId ??
          tx.orderID ??
          tx.id;

        if (orderIdentifier == null) {
          throw new Error("Unable to determine the order to void.");
        }

        const updatedOrder = await voidOrderWithToken(orderIdentifier, payload, managerAuth.token);
        const mappedTx = mapOrderToTx(updatedOrder);
        const uiOrder = mapOrderToUiOrder(updatedOrder);

        setOrders((prev) => {
          let found = false;
          const next = prev.map((order) => {
            const matches =
              order.orderID === uiOrder.orderID ||
              (order.orderDbId ?? order.id) === (uiOrder.orderDbId ?? uiOrder.id);
            if (matches) {
              found = true;
              return { ...order, ...uiOrder };
            }
            return order;
          });
          return found ? next : [uiOrder, ...next];
        });
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === mappedTx.id ? mappedTx : transaction
          )
        );

        const normalizedLogs = Array.isArray(updatedOrder.voidLogs)
          ? updatedOrder.voidLogs.map((log) => normalizeVoidLog(log)).filter(Boolean)
          : [];
        if (normalizedLogs.length) {
          setVoidLogs((prev) => {
            const existingIds = new Set(normalizedLogs.map((log) => log.voidId));
            const remaining = prev.filter((log) => !existingIds.has(log.voidId));
            const merged = [...normalizedLogs, ...remaining];
            return filterVoidLogsForUser(merged, currentUserId);
          });
        }

        await refreshOrdersAndVoids();

        if (historyContext?.type === "detail" && historyContext.tx?.id === mappedTx.id) {
          setHistoryContext({ type: "detail", tx: mappedTx });
        }
        if (
          historyContext?.type === "orderDetail" &&
          (
            historyContext.order?.orderID === uiOrder.orderID ||
            (historyContext.order?.orderDbId ?? historyContext.order?.id) ===
              (uiOrder.orderDbId ?? uiOrder.id)
          )
        ) {
          setHistoryContext({ type: "orderDetail", order: uiOrder });
        }

        showToast({
          message: "Void processed successfully.",
          type: "success",
          ttl: 2800,
        });
      } catch (error) {
        console.error("Failed to void transaction:", error);
        showToast({
          message: error?.message || "Failed to void transaction.",
          type: "error",
          ttl: 3200,
        });
      } finally {
        setShowReasonModal(false);
        setShowManagerAuth(false);
        setManagerAuth(null);
        setVoidContext({ type: null, index: null, tx: null });
        setShowHistoryModal(false);
      }
    },
    [
      voidContext,
      managerAuth,
      refreshOrdersAndVoids,
      historyContext,
      showToast,
      currentUserId,
    ]
  );

  const handleManagerAuthConfirm = useCallback(
    async ({ identifier, password }) => {
      const trimmedId = String(identifier || "").trim();
      const trimmedPassword = String(password || "");

      if (!trimmedId || !trimmedPassword) {
        showToast({
          message: "Enter a manager's credentials to continue.",
          type: "warning",
          ttl: 2600,
        });
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: trimmedId,
            schoolId: trimmedId,
            password: trimmedPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Manager authentication failed.");
        }

        const managerUser = data?.user;
        if (!managerUser) {
          throw new Error("Manager account not found.");
        }

        const managerRole = String(managerUser.role || "").toUpperCase();
        const isSameUser = currentUser?.id && managerUser.id === currentUser.id;
        const isSuperAdmin = managerRole === "SUPER_ADMIN";

        if (managerRole === "CASHIER" && !isSuperAdmin) {
          throw new Error("Only a manager or super admin can approve voids.");
        }

        if (isSameUser && !isSuperAdmin) {
          throw new Error("Another manager must approve this void.");
        }

        setManagerAuth({ token: data.token, user: managerUser });
        setShowManagerAuth(false);
        setShowReasonModal(true);

        showToast({
          message: `Manager approval granted by ${managerUser.fullName || managerUser.username || "manager"}.`,
          type: "success",
          ttl: 2600,
        });
      } catch (error) {
        console.error("Manager authentication failed:", error);
        showToast({
          message: error?.message || "Manager authentication failed.",
          type: "error",
          ttl: 3200,
        });
      }
    },
    [currentUser, showToast]
  );

  const onReasonSubmit = useCallback(
    (reason, itemIds = []) => {
      const trimmed = (reason || "").trim();
      if (!trimmed) {
        showToast({
          message: "Please enter a reason for voiding.",
          type: "warning",
          ttl: 2600,
        });
        return;
      }
      setShowReasonModal(false);
      confirmVoid(trimmed, itemIds);
    },
    [confirmVoid, showToast]
  );

  useEffect(() => {
    if (activeTab === "Discount") {
      setShowDiscountModal(true);
      setActiveTab("Menu");
    }
  }, [activeTab]);

  const categoriesEnabled = activeTab === "Menu" || activeTab === "Status";


  return (
    <div className="flex h-screen bg-[#F6F3EA] font-poppins text-black">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          userName={userName}
          profilePic={profilePic}
          readScopeKey={currentUserId ? String(currentUserId) : null}
          onProfileClick={() => setShowProfileModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* MAIN BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* CATEGORY SIDEBAR */}
          <Sidebar
            activeCategory={activeCategory}
            onCategorySelect={(cat) => {
              if (!categoriesEnabled) return;
              setActiveCategory(prev => (prev === cat ? null : cat));
            }}
            clearSearch={() => setSearchTerm("")}
            enabled={categoriesEnabled}
          />

          {/* CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS */}
            <TabsPanel
              activeTab={activeTab}
              onTabSelect={(key) => {
                if (key === "Discount") {
                  setShowDiscountModal(true);
                  return;
                }
                setActiveTab(key);
                setSearchTerm("");
              }}
            />

            {/* TAB CONTENT */}
            <div className="flex-1 flex overflow-hidden">
              {/* MENU */}
              {activeTab === "Menu" && (
                <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 no-scrollbar">
                  <ProductGrid products={filteredProducts} onSelect={openProductModal} />
                </div>
              )}

              {/* KVS / Orders */}
              {activeTab === "KVS" && (
                <OrdersPanel
                  orders={orders}
                  onSelectOrder={(order) => setHistoryContext({ type: "orderDetail", order })}
                />
              )}

              {/* Order Detail Modal */}
              {historyContext?.type === "orderDetail" && (
                <OrderDetailModal
                  historyContext={historyContext}
                  setHistoryContext={setHistoryContext}
                  orders={orders}
                  onStatusChange={(orderID, status) =>
                    setOrders(prev => prev.map(o => o.orderID === orderID ? { ...o, status } : o))
                  }
                />
              )}

              {/* TRANSACTIONS */}
              {activeTab === "Logs" && (
                <TransactionsPanel
                  transactions={transactions}
                  voidLogs={voidLogs}
                  onTransactionSelect={(tx) => setHistoryContext({ type: "detail", txId: tx.id })}
                  onVoidSelect={(vl) => { setSelectedVoidLog(vl); setShowVoidDetailModal(true); }}
                />
              )}

              {/* Transaction Detail Popup */}
              {historyContext?.type === "detail" && (
                <TransactionDetailModal
                  historyContext={historyContext}
                  setHistoryContext={setHistoryContext}
                  transactions={transactions}
                  shopDetails={shopDetails}
                />
              )}

              {/* Items Availability */}
              {activeTab === "Status" && (
                <ItemsTab
                  products={combinedProducts}
                  activeCategory={activeCategory}
                  searchTerm={searchTerm}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ORDER DETAILS PANE */}
      <CartPanel
        cart={cart}
        subtotal={subtotal}
        discountPct={discountPct}
        discountAmt={discountAmt}
        discountType={discountType}
        couponCode={couponCode}
        tax={tax}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        openEditModal={openEditModal}
        removeCartItem={removeCartItem}
        initiatePayment={() => {
          if (!paymentMethod) {
            alert("Please choose a payment method first.");
            return;
          }
          if (paymentMethod === "Cash") setShowCashModal(true);
          else if (paymentMethod === "Card") setShowCardModal(true);
          else if (paymentMethod === "QRS") setShowQRModal(true);
          else alert("Unknown payment method.");
        }}
        setShowHistoryModal={setShowHistoryModal}
        transactions={transactions}
        openCustomerView={openCustomerView}
        triggerVoid={triggerVoid}
      />

      {/* History & Void Modal */}
      <HistoryModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        transactions={transactions}
        onRequestVoid={handleHistoryVoidRequest}
      />

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          onClose={handleReceiptClose}
          shopDetails={shopDetails}
        />
      )}

      {/* Manager Authentication Modal */}
      <ManagerAuthModal
        isOpen={showManagerAuth}
        onClose={() => {
          setShowManagerAuth(false);
          setManagerAuth(null);
          setVoidContext({ type: null, index: null, tx: null });
        }}
        onConfirm={handleManagerAuthConfirm}
      />

      {/* Reason + Detail Modal */}
      <VoidReasonModal
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setManagerAuth(null);
          setVoidContext({ type: null, index: null, tx: null });
        }}
        voidContext={voidContext}
        onSubmit={onReasonSubmit}
      />

      {/* Void Detail Modal (existing viewer) */}
      {showVoidDetailModal && selectedVoidLog && (
        <VoidDetailModal
          voidLog={selectedVoidLog}
          onClose={() => { setShowVoidDetailModal(false); setSelectedVoidLog(null); }}
        />
      )}

      {/* ITEM MODAL */}
      <ItemDetailModal
        isOpen={showModal}
        product={modalProduct}
        editingIndex={editingCartIndex}
        onClose={() => setShowModal(false)}
        onAdd={({ quantity, size, addons, notes }) => {
          const addonList = Array.isArray(addons) ? addons : [];
          const addonsCost = addonList.reduce(
            (sum, addon) => sum + Number(addon?.price || 0),
            0
          );
          const sizeCost = size ? Number(size.price || 0) : 0;
          const qty = Number(quantity || 1);
          const basePrice = Number(modalProduct.price || 0);
          const price = (basePrice + addonsCost + sizeCost) * qty;
          setCart((prev) => {
            const matchIndex = prev.findIndex((item) => {
              const sameId = String(item.id ?? "") === String(modalProduct.id ?? "");
              const sameSize =
                (item.size?.label || "") === (size?.label || "") &&
                (item.size?.price || 0) === (size?.price || 0);
              const normalizeAddons = (list = []) =>
                list
                  .map((a) => a?.label || a?.name || "")
                  .filter(Boolean)
                  .sort()
                  .join("|");
              const sameAddons =
                normalizeAddons(item.selectedAddons) === normalizeAddons(addonList);
              const sameNotes = (item.notes || "") === (notes || "");
              return sameId && sameSize && sameAddons && sameNotes;
            });

            if (matchIndex >= 0) {
              return prev.map((item, idx) => {
                if (idx !== matchIndex) return item;
                const nextQty = Number(item.quantity || 0) + qty;
                return {
                  ...item,
                  quantity: nextQty,
                  totalPrice: Number(item.totalPrice || 0) + price,
                  size,
                  selectedAddons: addonList,
                };
              });
            }

            return [
              ...prev,
              {
                ...modalProduct,
                quantity: qty,
                size,
                selectedAddons: addonList,
                notes,
                totalPrice: price,
              },
            ];
          });
        }}
        onApply={({ quantity, size, addons, notes }, idx) => {
          const addonList = Array.isArray(addons) ? addons : [];
          const addonsCost = addonList.reduce(
            (sum, addon) => sum + Number(addon?.price || 0),
            0
          );
          const sizeCost = size ? Number(size.price || 0) : 0;
          const qty = Number(quantity || 1);
          const basePrice = Number(modalProduct.price || 0);
          const price = (basePrice + addonsCost + sizeCost) * qty;
          setCart((prev) =>
            prev.map((item, i) =>
              i === idx
                ? {
                    ...item,
                    quantity: qty,
                    size,
                    selectedAddons: addonList,
                    notes,
                    totalPrice: price,
                  }
                : item
            )
          );
        }}
        onRemove={idx => setCart(prev => prev.filter((_,i) => i !== idx))}
      />

      {/* Discount Modal */}
      <DiscountModal
        isOpen={showDiscountModal}
        currentType={discountType}
        currentCoupon={couponCode}
        onClose={() => setShowDiscountModal(false)}
        onApply={(pct, type, coupon) => {
          setDiscountPct(pct);
          setDiscountType(type);
          setCouponCode(coupon);
        }}
      />

      {/* Payment Modals */}
      <CashPaymentModal isOpen={showCashModal} total={total} onClose={() => setShowCashModal(false)} onSuccess={(paymentInfo) => finalizeTransaction(paymentInfo)} />
      <CardPaymentModal isOpen={showCardModal} total={total} onClose={() => setShowCardModal(false)} onSuccess={(paymentInfo) => finalizeTransaction(paymentInfo)} onFailure={(info) => alert("Card payment failed: " + (info?.reason || "Unknown"))} />
      <QRSPaymentModal
        isOpen={showQRModal}
        total={total}
        onClose={() => setShowQRModal(false)}
        onSuccess={(paymentInfo) => finalizeTransaction(paymentInfo)}
        onReady={handleQrReady}
        onStatusChange={handleQrStatusChange}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        show={showOrderSuccess}
        paymentSummary={lastPaymentInfo}
        onClose={() => {
          setShowOrderSuccess(false);
          setPendingOrderSuccess(false);
        }}
        onPrintReceipt={() => {
          const tx = selectedTransaction || transactions[0];
          if (tx) { setSelectedTransaction(tx); setShowReceiptModal(true); } else { alert("No transaction available to print."); }
          setShowOrderSuccess(false);
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        show={showProfileModal}
        userName={userName}
        schoolId={schoolId}
        avatarUrl={avatarUrl}
        analytics={profileAnalytics}
        onAvatarUpload={handleAvatarUpload}
        onChangePassword={handleChangePassword}
        onSwitchRole={handleSwitchRole}
        onSignOut={handleSignOut}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}



