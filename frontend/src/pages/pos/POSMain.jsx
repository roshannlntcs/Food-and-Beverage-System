// src/pages/pos/POSMain.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
import VoidPasswordModal from "../../components/modals/VoidPasswordModal";
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
import { placeholders, shopDetails } from "../../utils/data";
import {
  generateOrderID,
  generateTransactionID,
  generateVoidID
} from "../../utils/id";

// Inventory context
import { useInventory } from "../../contexts/InventoryContext";

const importAll = (r) =>
  r.keys().reduce((acc, k) => ({ ...acc, [k.replace("./", "")]: r(k) }), {});
const images = importAll(require.context("../../assets", false, /\.(png|jpe?g|svg)$/));

export default function POSMain() {
  const navigate = useNavigate();
  const { applyTransaction } = useInventory(); // <-- from InventoryContext

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("Menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [products, setProducts] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transactions") || "[]");
    // normalize older transactions so discountType / couponCode appear if present under different keys
    const normalized = saved.map(t => ({
      ...t,
      transactionID: t.transactionID || t.id || "",
      discountType: t.discountType || t.discount || t.discount_label || "",
      couponCode:
        t.couponCode ||
        t.coupon ||
        (t.paymentDetails && (t.paymentDetails.coupon || t.paymentDetails.code)) ||
        t.couponCodeApplied ||
        "",
    }));
    if (normalized.length) {
      setTransactions(normalized);
      localStorage.setItem("transactions", JSON.stringify(normalized));
    }
  }, []);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    if (savedOrders.length) {
      const normalized = savedOrders.map(o => ({ ...o, orderID: o.orderID || o.id || "" }));
      setOrders(normalized);
    }
  }, []);

  const [editingCartIndex, setEditingCartIndex] = useState(null);
  const [modalEdited, setModalEdited] = useState(false);

  const [itemAvailability, setItemAvailability] = useState({}); // kept for compatibility but ItemsTab now reads inventory
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  // VOID workflow states (new flow)
  const [showFirstAuth, setShowFirstAuth] = useState(false); // first manager password prompt
  const [showReasonModal, setShowReasonModal] = useState(false); // shows details + reason input
  const [showFinalAuth, setShowFinalAuth] = useState(false); // final manager password prompt
  const [pendingVoidReason, setPendingVoidReason] = useState("");
  const [voidContext, setVoidContext] = useState({ type: null, index: null, tx: null }); // { type: 'transaction' | 'item', index, tx }

  const [showVoidDetailModal, setShowVoidDetailModal] = useState(false); // existing detail viewer (history)
  const [selectedVoidLog, setSelectedVoidLog] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [voidLogs, setVoidLogs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    const normalized = saved.map(v => ({
      ...v,
      voidId: v.voidId || v.oidId || "",
      txId: v.txId || v.transactionId || v.transactionID || "",
    }));
    if (normalized.length) {
      setVoidLogs(normalized);
      localStorage.setItem("voidLogs", JSON.stringify(normalized));
    }
  }, []);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyContext, setHistoryContext] = useState(null);

  // user info
  const userName = localStorage.getItem("userName") || "Cashier";
  const schoolId = localStorage.getItem("schoolId") || "";
  const profilePic = localStorage.getItem("profilePic") || images["avatar-ph.png"];
  const basePassword = "123456";

  // Customer view refs & state
  const customerWinRef = React.useRef(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState(null);
  const [customerViewOpened, setCustomerViewOpened] = useState(false); // only auto-open first click per transaction

  // Payment modal states
  const [showCashModal, setShowCashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // derive categories from placeholders (exclude "All Menu")
  const categories = useMemo(
    () => Object.keys(placeholders).filter(c => c && c.toLowerCase() !== "all menu"),
    []
  );

  // recompute product list
  const filteredProducts = useMemo(() => {
    const baseList = activeCategory && placeholders[activeCategory]
      ? placeholders[activeCategory]
      : Object.values(placeholders).flat();

    return baseList
      .filter(i => (itemAvailability[i.name] ?? true)) // keep compatibility, but ItemsTab drives this now from inventory
      .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeCategory, itemAvailability, searchTerm]);

  const openEditModal = (item, index) => {
    setModalProduct({
      ...item,
      selectedAddons: item.selectedAddons || [],
      quantity: item.quantity || 1,
      notes: item.notes || "",
    });
    setEditingCartIndex(index);
    setShowModal(true);
    setModalEdited(false);
  };

  const removeCartItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // open product details/modal (when clicking item in ProductGrid)
  const openProductModal = (item) => {
    setModalProduct({ ...item, size: item.sizes[0], selectedAddons: [], quantity: 1, notes: "" });
    setShowModal(true);
    setEditingCartIndex(null);
    setModalEdited(false);

    // Auto-open customer view only the first time for this transaction
    try {
      if (!customerViewOpened) {
        openCustomerView();
        setCustomerViewOpened(true);
      }
    } catch (e) {}
  };

  const applyCartItemChanges = () => {
    const addonsCost = modalProduct.selectedAddons.reduce((s, a) => s + a.price, 0);
    const sizeCost = modalProduct.size.price;
    const price = (modalProduct.price + addonsCost + sizeCost) * modalProduct.quantity;

    setCart(prev => prev.map((item, idx) => {
      if (idx === editingCartIndex) {
        return {
          ...modalProduct,
          addons: modalProduct.selectedAddons,
          totalPrice: price,
        };
      }
      return item;
    }));
    setShowModal(false);
    setEditingCartIndex(null);
    setModalEdited(false);
  };

  // init availability (legacy fallback)
  useEffect(() => {
    if (Object.keys(itemAvailability).length === 0) {
      const avail = {};
      Object.values(placeholders)
        .flat()
        .forEach((i) => (avail[i.name] = true));
      setItemAvailability(avail);
    }
  }, []);

  // totals
  const subtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const discountAmt = +(subtotal * discountPct / 100).toFixed(2);
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax - discountAmt).toFixed(2);

  // add to cart from modal
  const addToCart = () => {
    const addonsCost = modalProduct.selectedAddons.reduce((s, a) => s + a.price, 0);
    const sizeCost = modalProduct.size.price;
    const price = (modalProduct.price + addonsCost + sizeCost) * modalProduct.quantity;
    setCart((p) => [
      ...p,
      { ...modalProduct, quantity: modalProduct.quantity, size: modalProduct.size, selectedAddons: modalProduct.selectedAddons, notes: modalProduct.notes, totalPrice: price }
    ]);
    setShowModal(false);
  };

  // Broadcast helper
  const broadcastCart = (payload) => {
    if (customerWinRef.current && !customerWinRef.current.closed) {
      try {
        customerWinRef.current.postMessage(payload, window.location.origin);
      } catch (e) {}
    }
    try { localStorage.setItem('pos_cart', JSON.stringify({ ...payload, _t: Date.now() })); } catch(e) {}
  };

  // open/focus customer view
  const openCustomerView = () => {
    const url = window.location.origin + '/customer-view';
    if (!customerWinRef.current || customerWinRef.current.closed) {
      customerWinRef.current = window.open(
        url,
        'customerView',
        'width=420,height=780,toolbar=no,menubar=no'
      );
      setTimeout(() => broadcastCart({ cart, subtotal, tax, total, discountPct }), 300);
    } else {
      customerWinRef.current.focus();
      broadcastCart({ cart, subtotal, tax, total, discountPct });
    }
  };

  // clear logs helper
  const clearAllLogs = (opts = { confirm: true }) => {
    if (opts.confirm && !window.confirm('Clear ALL orders, transactions, and void logs? This is irreversible. A backup will be downloaded. Continue?')) return;

    try {
      const backup = {
        orders: JSON.parse(localStorage.getItem('orders') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        voidLogs: JSON.parse(localStorage.getItem('voidLogs') || '[]'),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pos_backup_' + new Date().toISOString().replace(/[:.]/g,'-') + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Backup failed', e);
    }

    try {
      localStorage.setItem('orders', '[]');
      localStorage.setItem('transactions', '[]');
      localStorage.setItem('voidLogs', '[]');

      setOrders([]);
      setTransactions([]);
      setVoidLogs([]);

      setShowHistoryModal(false);
      setShowVoidDetailModal(false);
      setShowReceiptModal(false);

      alert('Orders, transactions, and void logs cleared. Backup (if created) was downloaded.');
    } catch (e) {
      console.error('Failed to clear logs', e);
      alert('Failed to clear logs. See console for details.');
    }
  };

  // ensure broadcast on every cart change
  useEffect(() => {
    broadcastCart({ cart, subtotal, tax, total, discountPct });
  }, [cart, subtotal, tax, total, discountPct]);

  // Reset active category when moving away from Menu/Items
  useEffect(() => {
    if (!(activeTab === "Menu" || activeTab === "Items")) {
      setActiveCategory(null);
    }
  }, [activeTab]);

  // Reset customerViewOpened when cart becomes empty
  useEffect(() => {
    if (cart.length === 0) {
      setCustomerViewOpened(false);
    }
  }, [cart.length]);

  // PAYMENT FLOW (unchanged)
  const initiatePayment = () => {
    if (!paymentMethod) {
      alert("Please choose a payment method first.");
      return;
    }
    if (paymentMethod === "Cash") setShowCashModal(true);
    else if (paymentMethod === "Card") setShowCardModal(true);
    else if (paymentMethod === "QRS") setShowQRModal(true);
    else alert("Unknown payment method.");
  };

  // finalize transaction — now includes discountType & couponCode in transaction and paymentDetails
  const finalizeTransaction = (paymentInfo = {}) => {
    if (cart.length === 0) { alert("Cart is empty."); return; }

    const subtotalCalc = cart.reduce((sum, item) => {
      const base = item.price ?? 0;
      const sizeUp = item.size?.price ?? 0;
      const addons = (item.selectedAddons || []).reduce((a, x) => a + (x.price || 0), 0);
      return sum + (base + sizeUp + addons) * (item.quantity || 1);
    }, 0);

    const computedDiscountAmt = +(subtotalCalc * (discountPct / 100)).toFixed(2);
    const taxCalc = +(subtotalCalc * 0.12).toFixed(2);
    const totalCalc = +(subtotalCalc + taxCalc - computedDiscountAmt).toFixed(2);

    const orderID = generateOrderID();
    const transactionID = generateTransactionID();

    // Normalize payment info
    let tendered, change;
    if (paymentInfo.method === "Cash") {
      tendered = paymentInfo.tendered;
      change = paymentInfo.change;
    } else {
      tendered = totalCalc;
      change = 0;
    }

    // include discountType and couponCode that are current in POSMain state
    const newTransaction = {
      id: transactionID,
      transactionID,
      orderID,
      items: cart.map((item) => ({ ...item, voided: false })),
      subtotal: subtotalCalc,
      discountPct,
      discountAmt: computedDiscountAmt,
      discountType: discountType || "",    // persisted
      couponCode: couponCode || "",        // persisted
      tax: taxCalc,
      total: totalCalc,
      method: paymentInfo.method || paymentMethod || "N/A",
      paymentDetails: { ...paymentInfo, tendered, change, coupon: couponCode || paymentInfo?.coupon || null },
      tendered,
      change,
      cashier: userName || "N/A",
      date: new Date().toLocaleString(),
      voided: false,
    };

    // persist transactions
    const existing = JSON.parse(localStorage.getItem("transactions") || "[]");
    const updatedTransactions = [newTransaction, ...existing];
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);

    const newOrder = {
      id: orderID,
      orderID,
      transactionID,
      items: cart.map(item => ({ ...item, voided: false })),
      status: "pending",
      date: new Date().toLocaleString(),
      discountType: discountType || "",
      couponCode: couponCode || ""
    };

    // persist orders
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    // Apply stock changes to InventoryContext
    try {
      // create an array of { name, qty } — InventoryContext supports name matching
      const orderedItems = cart.map(it => ({ name: it.name, qty: Number(it.quantity || 1) }));
      applyTransaction(orderedItems);
    } catch (e) {
      console.error("Failed to apply transaction to inventory:", e);
    }

    // Build a normalized payment summary to show in Order Success
    const paymentSummary = {
      method: paymentInfo.method || paymentMethod || "N/A",
      tendered,
      change,
      total: totalCalc,
      // preserve other useful fields if present
      ...(paymentInfo.cardNumberMasked ? { cardNumberMasked: paymentInfo.cardNumberMasked } : {}),
      ...(paymentInfo.authCode ? { authCode: paymentInfo.authCode } : {}),
      ...(paymentInfo.reference ? { reference: paymentInfo.reference } : {}),
      ...(paymentInfo.payload ? { payload: paymentInfo.payload } : {})
    };

    setCart([]);
    setPaymentMethod("");
    setShowOrderSuccess(true);
    setLastPaymentInfo(paymentSummary); // normalized and always contains tendered/change
    setSelectedTransaction(newTransaction);

    setShowCashModal(false);
    setShowCardModal(false);
    setShowQRModal(false);

    try { if (customerWinRef.current && !customerWinRef.current.closed) customerWinRef.current.close(); } catch(e){}
    customerWinRef.current = null;

    // Reset the auto-open flag so next transaction can auto-popup again
    setCustomerViewOpened(false);
  };

  // --- VOID FLOW IMPLEMENTATION (unchanged) ---
  const triggerVoid = (type, indexOrTx = null) => {
    if (indexOrTx && typeof indexOrTx === 'object' && indexOrTx.id) {
      setVoidContext({ type, tx: indexOrTx, index: null });
    } else {
      const txFromHistory = historyContext?.tx || selectedTransaction || null;
      setVoidContext({ type, tx: txFromHistory, index: typeof indexOrTx === 'number' ? indexOrTx : null });
    }
    setShowFirstAuth(true);
    setShowReasonModal(false);
    setShowFinalAuth(false);
    setPendingVoidReason("");
  };

  const onFirstAuthConfirm = (passwordEntered) => {
    if (passwordEntered !== basePassword) {
      alert("Wrong manager password.");
      return;
    }
    setShowFirstAuth(false);
    setShowReasonModal(true);
  };

  const onReasonSubmit = (reason) => {
    setPendingVoidReason(reason);
    setShowReasonModal(false);
    setShowFinalAuth(true);
  };

  const onFinalAuthConfirm = (passwordEntered) => {
    if (passwordEntered !== basePassword) {
      alert("Wrong manager password.");
      return;
    }
    confirmVoid(pendingVoidReason);
    setShowFinalAuth(false);
    setPendingVoidReason("");
  };

  const confirmVoid = (reason = "No reason provided") => {
    const { type, tx, index } = voidContext || {};
    if (!tx) {
      alert("No transaction selected for void.");
      setShowFirstAuth(false);
      setShowReasonModal(false);
      setShowFinalAuth(false);
      setVoidContext({ type: null, index: null, tx: null });
      setPendingVoidReason("");
      return;
    }

    // (void logic unchanged) ...
    const currentTxs = JSON.parse(localStorage.getItem("transactions") || "[]");
    const updatedTransactions = currentTxs.map(t => {
      if (t.id !== tx.id) return t;
      const updatedItems = t.items.map((it, idx) =>
        (type === "transaction" || idx === index) ? { ...it, voided: true } : it
      );
      const subtotal = updatedItems
        .filter(it => !it.voided)
        .reduce((sum, it) => {
          const base = typeof it.price === "number" ? it.price : 0;
          const sizeUp = it.size?.price || 0;
          const addons = (it.selectedAddons || []).reduce((a, x) => a + (x.price || 0), 0);
          return sum + (base + sizeUp + addons) * it.quantity;
        }, 0);
      const discountAmt = +(subtotal * (t.discountPct || 0) / 100).toFixed(2);
      const tax = +(subtotal * 0.12).toFixed(2);
      const total = +(subtotal + tax - discountAmt).toFixed(2);
      return {
        ...t,
        items: updatedItems,
        voided: type === "transaction" ? true : t.voided,
        subtotal,
        discountAmt,
        tax,
        total,
      };
    });

    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);

    const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = currentOrders.map(order => {
      if (order.transactionID !== tx.transactionID) return order;
      if (type === "transaction") {
        return {
          ...order,
          voided: true,
          status: "cancelled",
          items: order.items.map(it => ({ ...it, voided: true }))
        };
      } else {
        const txItem = tx.items[index];
        const updatedItems = order.items.map(it => {
          const isMatch = it.name === txItem.name
            && (it.size?.label || "") === (txItem.size?.label || "")
            && it.price === txItem.price
            && !it.voided;
          return isMatch ? { ...it, voided: true } : it;
        });
        const allVoided = updatedItems.length > 0 && updatedItems.every(i => i.voided);
        return {
          ...order,
          items: updatedItems,
          ...(allVoided ? { status: "cancelled", voided: true } : {})
        };
      }
    });

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);

    const existingLogs = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    const existing = existingLogs.find(v => v.txId === tx.id);
    const newVoidedItem = tx.items[index] ? { ...tx.items[index] } : null;
    const newVoidedDetailed =
      type === "transaction" ? tx.items.map(it => ({ ...it })) : [...(existing?.voidedItemsDetailed || []), newVoidedItem].filter(Boolean);
    const uniqueDetailedItems = Array.from(
      new Map(newVoidedDetailed.map(it => {
        const key = `${it.name}-${it.size?.label || "N/A"}-${it.notes || ""}-${(it.selectedAddons || []).map(a => a.label).join(",")}`;
        return [key, it];
      })).values()
    );
    const voidedItemNames = uniqueDetailedItems.map(i => i.name);
    const newLog = {
      voidId: existing?.voidId || generateVoidID(),
      txId: existing?.txId || tx.id,
      transactionId: tx.transactionID,
      cashier: userName,
      manager: "Admin",
      reason: reason || "No reason provided",
      dateTime: new Date().toLocaleString(),
      type: type === "transaction" ? "Full Transaction Void" : "Item Void",
      fullyVoided: type === "transaction",
      voidedItems: Array.from(new Set(voidedItemNames)),
      voidedItemsDetailed: uniqueDetailedItems,
    };
    const updatedLogs = existing ? existingLogs.map(v => (v.txId === tx.id ? newLog : v)) : [newLog, ...existingLogs];
    localStorage.setItem("voidLogs", JSON.stringify(updatedLogs));
    setVoidLogs(updatedLogs);

    if (historyContext?.type === "detail" && historyContext.tx?.id === tx.id) {
      const refreshedTx = updatedTransactions.find(t => t.id === tx.id);
      setHistoryContext({ type: "detail", tx: refreshedTx });
    }
    if (historyContext?.type === "orderDetail" && historyContext.order?.transactionID === tx.transactionID) {
      const refreshedOrder = updatedOrders.find(o => o.transactionID === tx.transactionID);
      setHistoryContext({ type: "orderDetail", order: refreshedOrder });
    }

    setShowFirstAuth(false);
    setShowReasonModal(false);
    setShowFinalAuth(false);
    setVoidContext({ type: null, index: null, tx: null });
    setPendingVoidReason("");
    setShowHistoryModal(false);
  };

  useEffect(() => {
    if (activeTab === "Discount") {
      setShowDiscountModal(true);
      setActiveTab("Menu");
    }
  }, [activeTab]);

  const updateOrderStatus = (orderID, newStatus) => {
    setOrders(prev => prev.map(o => o.orderID === orderID ? { ...o, status: newStatus } : o));
  };

  const categoriesEnabled = activeTab === "Menu" || activeTab === "Status";

  return (
    <div className="flex h-screen bg-[#F6F3EA] font-poppins text-black">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          userName={userName}
           profilePic={profilePic}
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
                <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 scrollbar">
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
                />
              )}

              {/* Items Availability */}
              {activeTab === "Status" && (
                <ItemsTab
                  placeholders={placeholders}
                  activeCategory={activeCategory}
                  searchTerm={searchTerm}
                  itemAvailability={itemAvailability}         // left for compatibility but not authoritative now
                  setItemAvailability={setItemAvailability}
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
        discountType={discountType}   // PASSING discountType now
        couponCode={couponCode}       // PASSING couponCode now
        tax={tax}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        openEditModal={openEditModal}
        removeCartItem={removeCartItem}
        initiatePayment={initiatePayment}
        setShowHistoryModal={setShowHistoryModal}
        transactions={transactions}
        openCustomerView={openCustomerView}
        // expose triggerVoid so other components can start void flow (if they want)
        triggerVoid={(type, idxOrTx) => triggerVoid(type, idxOrTx)}
      />

      {/* History & Void Modal */}
      {showHistoryModal && (
        <HistoryModal
          transactions={transactions}
          setShowHistoryModal={setShowHistoryModal}
          setVoidContext={setVoidContext}
          setShowFirstAuth={() => setShowFirstAuth(true)}
          setShowVoidPassword={() => setShowFirstAuth(true)}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          onClose={() => { setShowReceiptModal(false); setSelectedTransaction(null); }}
          shopDetails={shopDetails}
        />
      )}

      {/* First-level Manager Password Modal */}
      <VoidPasswordModal
        isOpen={showFirstAuth}
        onClose={() => { setShowFirstAuth(false); }}
        onConfirm={(passwordEntered) => onFirstAuthConfirm(passwordEntered)}
      />

      {/* Reason + Detail Modal */}
      <VoidReasonModal
        isOpen={showReasonModal}
        onClose={() => { setShowReasonModal(false); }}
        voidContext={voidContext}
        onSubmit={(reason) => onReasonSubmit(reason)}
      />

      {/* Final-level Manager Password Modal */}
      <VoidPasswordModal
        isOpen={showFinalAuth}
        onClose={() => { setShowFinalAuth(false); }}
        onConfirm={(passwordEntered) => onFinalAuthConfirm(passwordEntered)}
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
          const addonsCost = addons.reduce((s,a) => s + a.price, 0);
          const sizeCost   = size.price;
          const price      = (modalProduct.price + addonsCost + sizeCost) * quantity;
          setCart(prev => [...prev, { ...modalProduct, quantity, size, selectedAddons: addons, notes, totalPrice: price }]);
          setModalEdited(false);
        }}
        onApply={({ quantity, size, addons, notes }, idx) => {
          const addonsCost = addons.reduce((s,a) => s + a.price, 0);
          const sizeCost   = size.price;
          const price      = (modalProduct.price + addonsCost + sizeCost) * quantity;
          setCart(prev => prev.map((item,i) => i === idx ? { ...item, quantity, size, selectedAddons: addons, notes, totalPrice: price } : item));
          setModalEdited(false);
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
      <QRSPaymentModal isOpen={showQRModal} total={total} onClose={() => setShowQRModal(false)} onSuccess={(paymentInfo) => finalizeTransaction(paymentInfo)} />

      {/* Order Success Modal */}
      <OrderSuccessModal
        show={showOrderSuccess}
        paymentSummary={lastPaymentInfo}
        onClose={() => setShowOrderSuccess(false)}
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
        onClose={() => setShowProfileModal(false)}
        onClearLogs={clearAllLogs}
      />
    </div>
  );
}
