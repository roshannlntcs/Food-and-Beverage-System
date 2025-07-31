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

// ─── Utilities ──
import { placeholders, shopDetails } from "../../utils/data";

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
  if (saved.length) setTransactions(saved);
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

  const [voidContext, setVoidContext] = useState({ type: null, index: null });
  const [paymentMethod, setPaymentMethod] = useState("");

  const [voidLogs, setVoidLogs] = useState([]);  
  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("voidLogs") || "[]");
  if (saved.length) setVoidLogs(saved);
}, []);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyContext, setHistoryContext] = useState(null);

  // get user info
  const userName = localStorage.getItem("userName") || "Cashier";
  const schoolId = localStorage.getItem("schoolId") || "";

  const basePassword = "123456";

 // ID Generators ensuring uniqueness
 const generateOrderID = () => `ORD-${Date.now()}`;
 const generateTransactionID = () => `TR-${Date.now() + Math.floor(Math.random() * 1000)}`;
 const generateVoidID = () => `VOID-${Date.now() + Math.floor(Math.random() * 2000)}`;

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

    // Handle processing a transaction
const processTransaction = () => {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }
  if (!paymentMethod) {
    alert("Please select a payment method before processing the transaction.");
    return;
  }

  const orderID = generateOrderID();
  const transactionID = generateTransactionID();

  const subtotal = cart.reduce((sum, item) => {
    const base = item.price;
    const sizeUp = item.size.price;
    const addons = (item.selectedAddons || []).reduce((a, x) => a + x.price, 0);
    return sum + (base + sizeUp + addons) * item.quantity;
  }, 0);

  const computedDiscountAmt = +(subtotal * (discountPct / 100)).toFixed(2);
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax - computedDiscountAmt).toFixed(2);

  const newTransaction = {
    id: transactionID,
    transactionID,
    orderID,
    items: cart.map((item) => ({ ...item, voided: false })),
    subtotal,
    discountPct,
    discountAmt: computedDiscountAmt,
    tax,
    total,
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
    items: cart,
    status: "pending",
    date: new Date().toLocaleString(),
  };

  setOrders((prev) => [newOrder, ...prev]);
  setCart([]);
  setPaymentMethod("");
  setShowOrderSuccess(true);

  // Reset discounts for the next transaction
  setDiscountType("");
  setDiscountPct(0);
  setCouponCode("");
};

  const triggerVoid = (type, idx = null) => {
    setVoidContext({ type, index: idx });
    setShowVoidPassword(true);
  };

  const confirmVoid = () => {
  if (voidPasswordInput !== basePassword) {
    alert("Wrong password");
    return;
  }

  const { type, tx, index } = voidContext;
    
   // Update Transactions
  setTransactions(prev =>
    prev.map(t => {
      if (t.id !== tx.id) return t;

      const updatedItems = t.items.map((it, idx) =>
        (type === "transaction" || idx === index)
          ? { ...it, voided: true }
          : it
      );

      const subtotal = updatedItems
        .filter(it => !it.voided)
        .reduce((sum, it) => {
          const base = it.price;
          const sizeUp = it.size.price;
          const addons = (it.selectedAddons || []).reduce((a, x) => a + x.price, 0);
          return sum + (base + sizeUp + addons) * it.quantity;
        }, 0);

      const discountAmt = +(subtotal * (t.discountPct / 100)).toFixed(2);
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
    })
  );
  
      // Update Orders
  setOrders(prev =>
    prev.map(order => {
      if (order.transactionID !== tx.transactionID) return order;

      if (type === "transaction") {
        return {
          ...order,
          voided: true,
          items: order.items.map(it => ({ ...it, voided: true })),
        };
      } else {
        const updatedItems = order.items.map((it, idx) => {
          const txItem = tx.items[index];
          const isMatch =
            it.name === txItem.name &&
            it.size.label === txItem.size.label &&
            it.price === txItem.price &&
            !it.voided;
          return isMatch ? { ...it, voided: true } : it;
        });
        return { ...order, items: updatedItems };
      }
    })
  );
  
setVoidLogs(prev => {
  // Always fetch latest saved logs to avoid re-adding cleared ones
  const existingLogs = JSON.parse(localStorage.getItem("voidLogs") || "[]");

  const existing = existingLogs.find(v => v.txId === tx.id);
  const newVoidedItems = type === "transaction"
    ? tx.items.map(i => i.name)
    : [...(existing?.voidedItems || []), tx.items[index].name];

  const newLog = {
    voidId: existing ? existing.voidId : `VOID-${Date.now()}`,
    txId: tx.id,
    transactionId: tx.transactionID,
    cashier: userName,
    manager: "Admin", // change to logged in manager if you have one
    reason: type === "transaction" ? "Full transaction void" : `Item void: ${tx.items[index].name}`,
    dateTime: new Date().toLocaleString(),
    voidedItems: Array.from(new Set(newVoidedItems))
  };

  const updatedLogs = existing
    ? existingLogs.map(v => v.txId === tx.id ? newLog : v)
    : [newLog, ...existingLogs]; // prepend new

  localStorage.setItem("voidLogs", JSON.stringify(updatedLogs));
  return updatedLogs;
});

  setShowVoidPassword(false);
  setShowHistoryModal(false);
  setVoidContext(null);
  setVoidPasswordInput("");
};
  useEffect(() => {
    if (activeTab === "Discount") setShowDiscountModal(true);
  }, [activeTab]);

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
                  {activeTab === "Orders" && (
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
                  />)}
                  {/* TRANSACTIONS TAB */}
                  {activeTab === "Transactions" && (
                  <TransactionsPanel
                  transactions={transactions}
                  voidLogs={voidLogs}
                  onTransactionSelect={(tx) =>
                    setHistoryContext({ type: "detail", tx })
                  }
                  // optionally, if you need clicks on void logs:
                  onVoidSelect={(vl) => { /* handle it if needed */ }}
                  />
                  )}
                  {/* ─── Transaction Detail Popup ─── */}
                  {historyContext?.type === "detail" && (
                  <TransactionDetailModal
                  historyContext={historyContext}
                  setHistoryContext={setHistoryContext}
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


{/* DISCOUNT */}
{activeTab==="Discount" && (
<div className="flex-1 flex items-center justify-center">
  <button
  onClick={()=>setShowDiscountModal(true)}
  className="bg-yellow-300 px-6 py-3 rounded-lg font-semibold"
  >
    Apply Discount
    </button>
    </div>
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
/>

{/* ─── History & Void Modal (z‑50) ─── */}
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
onClose={() => setShowVoidPassword(false)}
onConfirm={() => {
  if (voidPasswordInput !== basePassword) {
    alert("Wrong password");
    return;
  }
  confirmVoid();
  setShowVoidPassword(false);
  setVoidPasswordInput("");
  }}
/>

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

   {/* DISCOUNT MODAL */}
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