// src/POSMain.jsx
// ─── React & Router ────
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ─── Layout Components ───
import Header from "../../components/Header";
import Sidebar from "../../components/POSSidebar";
import TabsPanel from "../../components/TabsPanel";
import ProductGrid from "../../components/ProductGrid";
import CartPanel from "../../components/CartPanel";

// ─── Tab Panels ───
import OrdersPanel from "../../components/OrdersTab";
import TransactionsPanel from "../../components/TransactionsTab";
import ItemsTab from "../../components/ItemsTab";

// ─── Modals ───
import ItemDetailModal from "../../components/modals/ItemDetailModal";
import DiscountModal from "../../components/modals/DiscountModal";
import VoidPasswordModal from "../../components/modals/VoidPasswordModal";
import ReceiptModal from "../../components/modals/ReceiptModal";
import OrderSuccessModal from "../../components/modals/OrderSuccessModal";
import HistoryModal from "../../components/modals/HistoryModal";
import ProfileModal from "../../components/modals/ProfileModal";
import TransactionDetailModal from "../../components/modals/TransactionDetailModal";
import OrderDetailModal from "../../components/modals/OrderDetailModal";
import VoidDetailModal from "../../components/modals/VoidDetailModal";

// ─── Utilities ──
import { placeholders, shopDetails } from "../../utils/data";
import {
  generateOrderID,
  generateTransactionID,
  generateVoidID
} from "../../utils/id";

// ─── Assets ────
const importAll = (r) =>
  r.keys().reduce((acc, k) => ({ ...acc, [k.replace("./", "")]: r(k) }), {});
const images = importAll(require.context("../../assets", false, /\.(png|jpe?g|svg)$/));

export default function POSMain() {

  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Menu");
  const [activeTab, setActiveTab] = useState("Menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [products, setProducts] = useState([]);
  const lockTabs = ["Orders", "Transactions", "Discount"];
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [showOrderSuccess, setShowOrderSuccess] = useState(false)

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transactions") || "[]");

    // Normalize: ensure each tx has a transactionID (fallback to id)
    const normalized = saved.map(t => ({
      ...t,
      transactionID: t.transactionID || t.id || "",
    }));

    if (normalized.length) {
      setTransactions(normalized);
      // persist normalized shape back to storage (optional)
      localStorage.setItem("transactions", JSON.stringify(normalized));
    }
  }, []);

  // load orders
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    if (savedOrders.length) {
      // normalize if needed
      const normalized = savedOrders.map(o => ({ ...o, orderID: o.orderID || o.id || "" }));
      setOrders(normalized);
    }
  }, []);

  const [editingCartIndex, setEditingCartIndex] = useState(null);
  const [modalEdited, setModalEdited] = useState(false);

  const [itemAvailability, setItemAvailability] = useState({});
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  const [showVoidPassword, setShowVoidPassword] = useState(false);
  const [voidPasswordInput, setVoidPasswordInput] = useState("");
  const [voidReason, setVoidReason] = useState("");

  const [showVoidDetailModal, setShowVoidDetailModal] = useState(false);
  const [selectedVoidLog, setSelectedVoidLog] = useState(null);

  const [voidContext, setVoidContext] = useState({ type: null, index: null });
  const [paymentMethod, setPaymentMethod] = useState("");

  const [voidLogs, setVoidLogs] = useState([]);  

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("voidLogs") || "[]");

    const normalized = saved.map(v => ({
      ...v,
      // fix typo if existed
      voidId: v.voidId || v.oidId || "",
      // ensure txId field exists (fallback to transactionId or txId)
      txId: v.txId || v.transactionId || v.transactionID || "",
    }));

    if (normalized.length) {
      setVoidLogs(normalized);
      localStorage.setItem("voidLogs", JSON.stringify(normalized));
    }
  }, []);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyContext, setHistoryContext] = useState(null);

  // get user info
  const userName = localStorage.getItem("userName") || "Cashier";
  const schoolId = localStorage.getItem("schoolId") || "";

  const basePassword = "123456";

  // Customer view refs & state
  const customerWinRef = React.useRef(null);
  const bcRef = React.useRef(null);
  const [customerConfirmed, setCustomerConfirmed] = useState(false);

  // ID Generators ensuring uniqueness

  // recompute product list
  const filteredProducts = useMemo(() => {
    const baseList =
        activeCategory === "All Menu"
            ? Object.values(placeholders).flat()
            : placeholders[activeCategory] || [];
    return baseList
        .filter(i => itemAvailability[i.name])
        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeCategory, itemAvailability, searchTerm])

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

  // open item modal
  const openProductModal = (item) => {
    setModalProduct({ ...item, size: item.sizes[0], selectedAddons: [], quantity: 1, notes: "" });
    setShowModal(true);
    setEditingCartIndex(null);
    setModalEdited(false);
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

  // init availability
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


  const addToCart = () => {
    const addonsCost = modalProduct.selectedAddons.reduce((s, a) => s + a.price, 0);
    const sizeCost = modalProduct.size.price;
    const price = (modalProduct.price + addonsCost + sizeCost) * modalProduct.quantity;
    setCart((p) => [
      ...p,
      { ...modalProduct, addons: modalProduct.selectedAddons, totalPrice: price }
    ]);
    setShowModal(false);
  };

  // Broadcast helper: send cart to customer window(s)
  const broadcastCart = (payload) => {
    // BroadcastChannel
    if (bcRef.current) {
      try { bcRef.current.postMessage(payload); } catch(e) { /* ignore */ }
    }
    // postMessage to the opened customer window as extra reliability (same-origin)
    if (customerWinRef.current && !customerWinRef.current.closed) {
      try {
        customerWinRef.current.postMessage(payload, window.location.origin);
      } catch (e) {}
    }
    // localStorage fallback (triggers storage event in other windows)
    try { localStorage.setItem('pos_cart', JSON.stringify({ ...payload, _t: Date.now() })); } catch(e) {}
  };

  // open or focus the customer view window
  const openCustomerView = () => {
    const url = window.location.origin + '/customer-view';
    if (!customerWinRef.current || customerWinRef.current.closed) {
      customerWinRef.current = window.open(
        url,
        'customerView',
        'width=420,height=780,toolbar=no,menubar=no'
      );
      // give the new window a moment then send an initial state
      setTimeout(() => broadcastCart({ cart, subtotal, tax, total, discountPct }), 300);
    } else {
      customerWinRef.current.focus();
      broadcastCart({ cart, subtotal, tax, total, discountPct });
    }
  };

  // Ensure BroadcastChannel and message listener for confirmations
  useEffect(() => {
    if ('BroadcastChannel' in window) {
      bcRef.current = new BroadcastChannel('pos-cart');
    }

    const msgHandler = (ev) => {
      // accept only same-origin for security
      try {
        if (ev.origin && ev.origin !== window.location.origin) return;
      } catch (e) {
        // ev.origin may be undefined in BroadcastChannel events - ignore
      }

      const data = ev.data;
      if (!data) return;

      if (data.type === 'customer_confirm') {
        setCustomerConfirmed(true);
      } else if (data.type === 'customer_unconfirm') {
        setCustomerConfirmed(false);
      }
    };

    window.addEventListener('message', msgHandler);

    return () => {
      if (bcRef.current) bcRef.current.close();
      window.removeEventListener('message', msgHandler);
    };
  }, []);

  // ensure broadcast on every cart change and reset confirmation
  useEffect(() => {
    // any cart edit invalidates previous confirmation
    setCustomerConfirmed(false);
    broadcastCart({ cart, subtotal, tax, total, discountPct });
  }, [cart, subtotal, tax, total, discountPct]);

  // Handle processing a transaction
  const processTransaction = () => {
    // block processing if customer hasn't confirmed
    if (!customerConfirmed) {
      alert("Waiting for customer confirmation. Please ask the customer to confirm the order.");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method before processing the transaction.");
      return;
    }

    const subtotalCalc = cart.reduce((sum, item) => {
      const base = item.price;
      const sizeUp = item.size.price;
      const addons = (item.selectedAddons || []).reduce((a, x) => a + x.price, 0);
      return sum + (base + sizeUp + addons) * item.quantity;
    }, 0);

    const computedDiscountAmt = +(subtotalCalc * (discountPct / 100)).toFixed(2);
    const taxCalc = +(subtotalCalc * 0.12).toFixed(2);
    const totalCalc = +(subtotalCalc + taxCalc - computedDiscountAmt).toFixed(2);

    const orderID       = generateOrderID();        // -> "ORD-1XXXXXXX"
    const transactionID = generateTransactionID();  // -> "TRN-2XXXXXXX"
    const voidID        = generateVoidID();         // -> "VOI-3XXXXXXX"

    const newTransaction = {
      id: transactionID,
      transactionID,
      orderID,
      items: cart.map((item) => ({ ...item, voided: false })),
      subtotal: subtotalCalc,
      discountPct,
      discountAmt: computedDiscountAmt,
      tax: taxCalc,
      total: totalCalc,
      method: paymentMethod || "N/A",
      cashier: userName || "N/A",
      date: new Date().toLocaleString(),
      voided: false,
    };

    // ✅ Add new transaction to localStorage
    const existing = JSON.parse(localStorage.getItem("transactions") || "[]");
    const updatedTransactions = [newTransaction, ...existing];
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

    // Update state for this session
    setTransactions(updatedTransactions);

    const newOrder = {
      id: orderID,
      orderID,
      transactionID,
      items: cart.map(item => ({ ...item, voided: false })),
      status: "pending",
      date: new Date().toLocaleString(),
    };
    
    // persist new order immediately so confirmVoid() can read + update it later
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    setCart([]);
    setPaymentMethod("");
    setShowOrderSuccess(true);

    // Reset discounts for the next transaction
    setDiscountType("");
    setDiscountPct(0);
    setCouponCode("");

    // reset confirmation for next order
    setCustomerConfirmed(false);
  };

  const triggerVoid = (type, idx = null) => {
    setVoidContext({ type, index: idx });
    setShowVoidPassword(true);
  };

  const confirmVoid = (reason = "No reason provided") => {
    const { type, tx, index } = voidContext;
    if (!tx) return;

    // --- Update Transactions (in-memory + localStorage) ---
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

    // write txs to storage and state
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);

    // --- Update Orders (in-memory + localStorage) ---
    const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = currentOrders.map(order => {
      if (order.transactionID !== tx.transactionID) return order;

      if (type === "transaction") {
        // Full transaction void -> mark order items voided and set status to "cancelled"
        return {
          ...order,
          voided: true,
          status: "cancelled",
          items: order.items.map(it => ({ ...it, voided: true }))
        };
      } else {
        // Item-level void
        const txItem = tx.items[index];
        const updatedItems = order.items.map(it => {
          const isMatch = it.name === txItem.name
            && (it.size?.label || "") === (txItem.size?.label || "")
            && it.price === txItem.price
            && !it.voided;
          return isMatch ? { ...it, voided: true } : it;
        });

        // If all order items are now voided, mark order cancelled
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

    // --- Update Void Logs (persisted) ---
    const existingLogs = JSON.parse(localStorage.getItem("voidLogs") || "[]");
    const existing = existingLogs.find(v => v.txId === tx.id);

    const newVoidedItem = tx.items[index] ? { ...tx.items[index] } : null;

    const newVoidedDetailed =
      type === "transaction" ? tx.items.map(it => ({ ...it })) : [...(existing?.voidedItemsDetailed || []), newVoidedItem].filter(Boolean);

    // dedupe
    const uniqueDetailedItems = Array.from(
      new Map(newVoidedDetailed.map(it => {
        const key = `${it.name}-${it.size?.label || "N/A"}-${it.notes || ""}-${(it.selectedAddons || []).map(a => a.label).join(",")}`;
        return [key, it];
      })).values()
    );

    const voidedItemNames = uniqueDetailedItems.map(i => i.name);

    const newLog = {
      voidId: existing?.voidId || generateVoidID(),
      txId: tx.id,
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

    // --- Refresh currently-open modal(s) if they reference this tx/order ---
    // If a Transaction Detail modal is open, refresh its tx object
    if (historyContext?.type === "detail" && historyContext.tx?.id === tx.id) {
      const refreshedTx = updatedTransactions.find(t => t.id === tx.id);
      setHistoryContext({ type: "detail", tx: refreshedTx });
    }

    // If an Order Detail modal is open, refresh its order object
    if (historyContext?.type === "orderDetail" && historyContext.order?.transactionID === tx.transactionID) {
      const refreshedOrder = updatedOrders.find(o => o.transactionID === tx.transactionID);
      setHistoryContext({ type: "orderDetail", order: refreshedOrder });
    }

    // --- Reset UI state ---
    setShowVoidPassword(false);
    setShowHistoryModal(false);
    setVoidContext(null);
    setVoidPasswordInput("");
    setVoidReason("");
  };


  useEffect(() => {
    if (activeTab === "Discount") {
      setShowDiscountModal(true);
      setActiveTab("Menu");
    }
  }, [activeTab]);

  const updateOrderStatus = (orderID, newStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.orderID === orderID
          ? { ...o, status: newStatus }
          : o
      )
    );
  };

  return (
    <div className="flex h-screen bg-[#F6F3EA] font-poppins text-black">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          userName={userName}
          onProfileClick={() => setShowProfileModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* MAIN BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* CATEGORY SIDEBAR */}
          <Sidebar
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            clearSearch={() => setSearchTerm("")}
          />
          {/* CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS */}
            <TabsPanel
              activeTab={activeTab}
              onTabSelect={(key) => {
                 // If they clicked “Discount,” just open the modal
                 if (key === "Discount") {
                  setShowDiscountModal(true);
                  return;}
                  // Otherwise, switch tabs as normal
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
              {/* ORDERS */}
              {activeTab === "KVS" && (
                <OrdersPanel
                  orders={orders}
                  onSelectOrder={(order) => setHistoryContext({ type: "orderDetail", order })}
                />
              )}
              {/* ─── Order Details Modal ─── */}
              {historyContext?.type === "orderDetail" && (
                <OrderDetailModal
                  historyContext={historyContext}
                  setHistoryContext={setHistoryContext}
                  orders={orders}          // <-- add this
                  onStatusChange={(orderID, status) =>
                    setOrders(prev =>
                      prev.map(o => o.orderID === orderID ? { ...o, status } : o)
                    )
                  }
                />
              )}
              {/* TRANSACTIONS TAB */}
              {activeTab === "Logs" && (
                <TransactionsPanel
                  transactions={transactions}
                  voidLogs={voidLogs}
                  onTransactionSelect={(tx) =>
                    setHistoryContext({ type: "detail", txId: tx.id })
                  }
                  // optionally, if you need clicks on void logs:
                  onVoidSelect={(vl) => { setSelectedVoidLog(vl);
                    setShowVoidDetailModal(true); }}
                />
              )}
              {/* ─── Transaction Detail Popup ─── */}
              {historyContext?.type === "detail" && (
                <TransactionDetailModal
                  historyContext={historyContext}
                  setHistoryContext={setHistoryContext}
                  transactions={transactions}   // <-- add this
                />
              )}
              {/* Items Availability */}
              {activeTab === "Items" && (
                <ItemsTab
                  placeholders={placeholders}
                  activeCategory={activeCategory}
                  searchTerm={searchTerm}
                  itemAvailability={itemAvailability}
                  setItemAvailability={setItemAvailability}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ─── Order Details Pane ─── */}
      <CartPanel
        cart={cart}
        subtotal={subtotal}
        discountPct={discountPct}
        discountAmt={discountAmt}
        tax={tax}
        total={total}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        openEditModal={openEditModal}
        removeCartItem={removeCartItem}
        processTransaction={processTransaction}
        setShowHistoryModal={setShowHistoryModal}
        transactions={transactions}
        customerConfirmed={customerConfirmed}
        openCustomerView={openCustomerView}
      />

      {/* ─── History & Void Modal (z-50) ─── */}
      {showHistoryModal && (
        <HistoryModal
          transactions={transactions}
          setShowHistoryModal={setShowHistoryModal}
          setVoidContext={setVoidContext}
          setShowVoidPassword={setShowVoidPassword}
        />
      )}


      {/* ─── Receipt Modal ─── */}
      {showReceiptModal && selectedTransaction && (
        <ReceiptModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedTransaction(null);
          }}
          shopDetails={shopDetails}
        />
      )}

      {/* ─── Void Password Modal (as before) ─── */}
      <VoidPasswordModal
        isOpen={showVoidPassword}
        passwordValue={voidPasswordInput}
        onPasswordChange={setVoidPasswordInput}
        onClose={() => {
          setShowVoidPassword(false);
          setVoidPasswordInput("");
        }}
        onConfirm={(passwordEntered, reasonEntered) => {
          if (passwordEntered !== basePassword) {
            alert("Wrong password");
            return;
         }
          confirmVoid(reasonEntered);
        }}
      />

      {/* ─── Void Detail Modal ─── */}
      {showVoidDetailModal && selectedVoidLog && (
        <VoidDetailModal
          voidLog={selectedVoidLog}
          onClose={() => {
            setShowVoidDetailModal(false);
            setSelectedVoidLog(null);
          }}
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
          setCart(prev => [
            ...prev,
            { ...modalProduct, quantity, size, selectedAddons: addons, notes, totalPrice: price }
          ]);
          setModalEdited(false);
        }}
        onApply={({ quantity, size, addons, notes }, idx) => {
          const addonsCost = addons.reduce((s,a) => s + a.price, 0);
          const sizeCost   = size.price;
          const price      = (modalProduct.price + addonsCost + sizeCost) * quantity;
          setCart(prev =>
            prev.map((item,i) =>
              i === idx
            ? { ...item, quantity, size, selectedAddons: addons, notes, totalPrice: price }
            : item
          )
          );
          setModalEdited(false);
        }}
        onRemove={idx => {
          setCart(prev => prev.filter((_,i) => i !== idx));
        }}
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

      {/* ─── Order Success Modal ─── */}
      <OrderSuccessModal
        show={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        onPrintReceipt={() => {
          setSelectedTransaction(transactions[0]); // ✅ Use existing transaction
          setShowReceiptModal(true);
          setShowOrderSuccess(false);
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        show={showProfileModal}
        userName={userName}
        schoolId={schoolId}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
