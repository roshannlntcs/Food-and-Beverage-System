
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import { useInventory } from "../../contexts/InventoryContext";
import { useAuth } from "../../contexts/AuthContext";
import { fetchOrders } from "../../api/orders";
import { fetchUsers } from "../../api/users";
import { mapOrderToTx } from "../../utils/mapOrder";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import { Package, ShoppingCart, User, ChevronDown } from "lucide-react";

const DEFAULT_LOW_THRESHOLD = 10;
const DEFAULT_MAX_QUANTITY = 100;
const MAX_ORDER_FETCH = 100;
const ORDER_RANGE_LABELS = {
  this_week: "This week",
  "30": "Last 30 days",
  "60": "Last 60 days",
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

const formatCount = (value) =>
  Number.isFinite(value) ? Number(value).toLocaleString() : "0";

const makeInclusiveDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
};
const Dashboard = () => {
  const { inventory: inventoryFromCtx = [] } = useInventory() || {};
  const { currentUser } = useAuth() || {};
  const currentUserName = currentUser?.fullName || "Admin";

  const categories = useMemo(() => {
    const set = new Set(
      (inventoryFromCtx || [])
        .map((item) => (item?.category || "").trim())
        .filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [inventoryFromCtx]);

  const inventoryIndex = useMemo(() => {
    const byId = new Map();
    const byName = new Map();
    (inventoryFromCtx || []).forEach((item) => {
      if (!item) return;
      if (item.id) byId.set(String(item.id), item);
      if (item.name) byName.set(item.name.toLowerCase(), item);
    });
    return { byId, byName };
  }, [inventoryFromCtx]);

  const [selectedStock, setSelectedStock] = useState("");
  const [stockOpen, setStockOpen] = useState(false);
  const [selectedTop, setSelectedTop] = useState("");
  const [topOpen, setTopOpen] = useState(false);
  const [orderRange, setOrderRange] = useState("this_week");
  const [orderRangeOpen, setOrderRangeOpen] = useState(false);
  const [showDateError, setShowDateError] = useState(false);

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const appliedFromDate = useMemo(
    () => makeInclusiveDate(appliedFrom),
    [appliedFrom]
  );
  const appliedToDate = useMemo(
    () => makeInclusiveDate(appliedTo, true),
    [appliedTo]
  );
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = { take: MAX_ORDER_FETCH };
      const fromDate = makeInclusiveDate(appliedFrom);
      const toDate = makeInclusiveDate(appliedTo, true);
      if (fromDate) params.from = fromDate.toISOString();
      if (toDate) params.to = toDate.toISOString();
      const response = await fetchOrders(params);
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.orders)
        ? response.orders
        : Array.isArray(response)
        ? response
        : [];
      setOrders(list);
      setOrdersError(null);
    } catch (error) {
      console.error("Failed to load orders for dashboard:", error);
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Failed to load orders.";
      setOrders([]);
      setOrdersError(message);
    } finally {
      setOrdersLoading(false);
    }
  }, [appliedFrom, appliedTo]);

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  useEffect(() => {
    let active = true;
    const loadUsersData = async () => {
      setUsersLoading(true);
      try {
        const list = await fetchUsers();
        if (!active) return;
        setUsers(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load users for dashboard:", error);
        setUsers([]);
      } finally {
        if (active) setUsersLoading(false);
      }
    };

    loadUsersData();
    return () => {
      active = false;
    };
  }, []);

  const resolveInventoryItem = useCallback(
    (item = {}) => {
      const productId =
        item.productId ?? item.orderItemId ?? item.backendId ?? item.id ?? null;
      if (productId && inventoryIndex.byId.has(String(productId))) {
        return inventoryIndex.byId.get(String(productId));
      }
      if (item.name) {
        return inventoryIndex.byName.get(item.name.toLowerCase()) || null;
      }
      return null;
    },
    [inventoryIndex]
  );
  const transactionsWithinDates = useMemo(() => {
    const mapped = Array.isArray(orders)
      ? orders
          .map((order) => {
            try {
              return mapOrderToTx(order);
            } catch (error) {
              console.warn("Failed to map order to transaction:", error);
              return null;
            }
          })
          .filter(Boolean)
      : [];

    return mapped.filter((tx) => {
      if (!tx?.date) return true;
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return true;
      if (appliedFromDate && date < appliedFromDate) return false;
      if (appliedToDate && date > appliedToDate) return false;
      return true;
    });
  }, [orders, appliedFromDate, appliedToDate]);

  const hasTransactions = transactionsWithinDates.length > 0;

  const calculateCategoryTotal = useCallback(
    (items, targetCategory) =>
      items.reduce((sum, item) => {
        const invItem = resolveInventoryItem(item);
        if (!invItem) return sum;
        if (targetCategory && invItem.category !== targetCategory) return sum;
        const qty = Number(item.quantity ?? item.qty ?? 0);
        const price = Number(item.price ?? item.unitPrice ?? 0);
        return sum + qty * price;
      }, 0),
    [resolveInventoryItem]
  );

  const revenue = useMemo(() => {
    if (!transactionsWithinDates.length) return 0;
    return transactionsWithinDates.reduce((sum, tx) => {
      if (!appliedCategory) return sum + Number(tx.total || 0);
      const items = Array.isArray(tx.items) ? tx.items : [];
      return sum + calculateCategoryTotal(items, appliedCategory);
    }, 0);
  }, [transactionsWithinDates, appliedCategory, calculateCategoryTotal]);

  const effectiveTopCategory = useMemo(() => {
    if (appliedCategory) return appliedCategory;
    if (selectedTop) return selectedTop;
    return "";
  }, [appliedCategory, selectedTop]);

  const topProducts = useMemo(() => {
    if (!transactionsWithinDates.length) return [];
    const salesMap = new Map();
    transactionsWithinDates.forEach((tx) => {
      const items = Array.isArray(tx.items) ? tx.items : [];
      items.forEach((item) => {
        const invItem = resolveInventoryItem(item);
        if (!invItem) return;
        if (effectiveTopCategory && invItem.category !== effectiveTopCategory)
          return;
        const key = invItem.name || item.name || String(invItem.id || item.id);
        const prev = salesMap.get(key) || { name: invItem.name || key, sales: 0 };
        prev.sales += Number(item.quantity ?? item.qty ?? 0);
        salesMap.set(key, prev);
      });
    });
    return Array.from(salesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [transactionsWithinDates, resolveInventoryItem, effectiveTopCategory]);
  const stockEntries = useMemo(() => {
    const list = (inventoryFromCtx || []).map((item) => {
      const name = item?.name || "Unnamed";
      const category = item?.category || "Uncategorized";
      const current = Number(item?.quantity ?? 0);
      const total = Number(item?.maxQuantity ?? DEFAULT_MAX_QUANTITY) || 0;
      const threshold =
        Number(item?.lowThreshold ?? DEFAULT_LOW_THRESHOLD) ||
        DEFAULT_LOW_THRESHOLD;
      return {
        id: item.id || name,
        name,
        category,
        current,
        total: total > 0 ? total : DEFAULT_MAX_QUANTITY,
        threshold,
      };
    });

    const filtered = appliedCategory
      ? list.filter((entry) => entry.category === appliedCategory)
      : list;

    return filtered
      .sort((a, b) => a.current - b.current)
      .slice(0, 20);
  }, [inventoryFromCtx, appliedCategory]);

  const stockData = useMemo(() => {
    const base = appliedCategory
      ? stockEntries.filter((item) => item.category === appliedCategory)
      : stockEntries;

    const availableStocks = base.reduce(
      (sum, item) => sum + Number(item.current || 0),
      0
    );
    const lowStock = base.filter(
      (item) => item.current > 0 && item.current <= item.threshold
    ).length;
    const outOfStock = base.filter((item) => item.current <= 0).length;

    return {
      availableStocks,
      lowStock,
      outOfStock,
    };
  }, [stockEntries, appliedCategory]);

  const orderSummaryData = useMemo(() => {
    if (!transactionsWithinDates.length) return [];
    const now = new Date();
    let start;
    if (orderRange === "this_week") {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
    } else if (["30", "60", "90"].includes(orderRange)) {
      start = new Date(now);
      start.setDate(now.getDate() - (Number(orderRange) - 1));
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const buckets = new Map();
    transactionsWithinDates.forEach((tx) => {
      if (!tx?.date) return;
      const date = new Date(tx.date);
      if (Number.isNaN(date.getTime())) return;
      if (date < start || date > end) return;
      const label = date.toLocaleDateString(undefined, { weekday: "short" });
      const items = Array.isArray(tx.items) ? tx.items : [];
      const profit = appliedCategory
        ? calculateCategoryTotal(items, appliedCategory)
        : Number(tx.total || 0);
      const prev = buckets.get(label) || 0;
      buckets.set(label, prev + profit);
    });

    return Array.from(buckets.entries()).map(([name, profit]) => ({ name, profit }));
  }, [
    transactionsWithinDates,
    orderRange,
    appliedCategory,
    calculateCategoryTotal,
  ]);
  const recentLoginEntries = useMemo(() => {
    if (!Array.isArray(users) || !users.length) return [];
    const entries = users
      .map((user) => {
        const rawDate = user?.lastLogin ?? user?.lastLoginAt ?? null;
        if (!rawDate) return null;
        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return null;
        const name =
          user?.fullName ||
          user?.name ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.username ||
          "--";
        const username = user?.username || user?.email || "";
        const avatar =
          user?.avatarUrl ||
          user?.avatar ||
          user?.image ||
          user?.img ||
          null;
        const diffMs = Date.now() - date.getTime();
        const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
        let relativeLabel;
        if (diffMinutes < 1) {
          relativeLabel = "Just now";
        } else if (diffMinutes < 60) {
          relativeLabel = `${diffMinutes} min ago`;
        } else if (diffMinutes < 60 * 24) {
          const hours = Math.round(diffMinutes / 60);
          relativeLabel = `${hours} hr${hours > 1 ? "s" : ""} ago`;
        } else if (diffMinutes < 60 * 24 * 7) {
          const days = Math.round(diffMinutes / (60 * 24));
          relativeLabel = `${days} day${days > 1 ? "s" : ""} ago`;
        } else {
          relativeLabel = date.toLocaleDateString();
        }
        return {
          id: user.id || user.userId || username || rawDate,
          name,
          username,
          avatar,
          relativeLabel,
          timeLabel: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
      );

    return entries;
  }, [users]);

  const profileAnalytics = useMemo(() => {
    const totalTransactions = transactionsWithinDates.length;
    const totalRevenue = transactionsWithinDates.reduce(
      (sum, tx) => sum + Number(tx.total || 0),
      0
    );
    const totalSold = transactionsWithinDates.reduce((sum, tx) => {
      const items = Array.isArray(tx.items) ? tx.items : [];
      return (
        sum +
        items.reduce(
          (inner, item) => inner + Number(item.quantity ?? item.qty ?? 0),
          0
        )
      );
    }, 0);
    const totalVoids = transactionsWithinDates.filter((tx) => tx.voided).length;
    const avgPerTransaction = totalTransactions
      ? totalRevenue / totalTransactions
      : 0;

    const bestSellerMap = new Map();
    transactionsWithinDates.forEach((tx) => {
      (tx.items || []).forEach((item) => {
        const invItem = resolveInventoryItem(item);
        const key = invItem?.name || item.name || item.productId || item.id;
        if (!key) return;
        const current = bestSellerMap.get(key) || {
          name: invItem?.name || item.name || key,
          qty: 0,
        };
        current.qty += Number(item.quantity ?? item.qty ?? 0);
        bestSellerMap.set(key, current);
      });
    });
    const bestSeller = Array.from(bestSellerMap.values()).reduce(
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
  }, [transactionsWithinDates, resolveInventoryItem]);

  const notifications = useMemo(() => {
    const list = [];
    stockEntries.forEach((entry) => {
      if (entry.current <= 0) {
        list.push({
          type: "stock",
          text: `Out of stock: ${entry.name}`,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleString(),
        });
      } else if (entry.current <= entry.threshold) {
        list.push({
          type: "stock",
          text: `Low stock: ${entry.name} (${entry.current} left)`,
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleString(),
        });
      }
    });

    transactionsWithinDates.slice(0, 10).forEach((tx) => {
      const label = tx.reference || tx.id || tx.orderNumber || "Order";
      list.push({
        type: "order",
        text: `Transaction ${label} - ${formatCurrency(tx.total || 0)}`,
        timestamp: tx.date || new Date().toISOString(),
        time: tx.date
          ? new Date(tx.date).toLocaleString()
          : new Date().toLocaleString(),
      });
    });

    return list
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0).getTime() -
          new Date(a.timestamp || 0).getTime()
      )
      .slice(0, 10);
  }, [stockEntries, transactionsWithinDates]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__dashboardNotifications = notifications;
      window.dispatchEvent(
        new CustomEvent("dashboard-notifications-update", {
          detail: notifications,
        })
      );
      window.__dashboardProfileAnalytics = profileAnalytics;
      window.dispatchEvent(
        new CustomEvent("dashboard-profile-analytics-update", {
          detail: profileAnalytics,
        })
      );
    }
  }, [notifications, profileAnalytics]);
  const handleApplyFilters = useCallback(() => {
    if (filterFrom && filterTo) {
      const from = new Date(filterFrom);
      const to = new Date(filterTo);
      if (
        Number.isFinite(from.getTime()) &&
        Number.isFinite(to.getTime()) &&
        from > to
      ) {
        setShowDateError(true);
        return;
      }
    }

    setShowDateError(false);
    setAppliedFrom(filterFrom);
    setAppliedTo(filterTo);
    const nextCategory = filterCategory === "All" ? "" : filterCategory;
    setAppliedCategory(nextCategory);
    setSelectedStock(nextCategory);
    setSelectedTop(nextCategory);
  }, [filterFrom, filterTo, filterCategory]);

  const handleResetFilters = useCallback(() => {
    setFilterFrom("");
    setFilterTo("");
    setFilterCategory("All");
    setAppliedFrom("");
    setAppliedTo("");
    setAppliedCategory("");
    setSelectedStock("");
    setSelectedTop("");
    setShowDateError(false);
  }, []);
  return (
    <div className="flex h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 flex-1 flex flex-col overflow-hidden h-screen">
        <header className="px-6 pt-2">
          <div className="bg-[#8B0000] text-white rounded-lg px-6 py-4 flex justify-between items-center mb-3 shadow-lg">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {currentUserName}!</h1>
              <p>Here&apos;s your business overview</p>
            </div>
            <AdminInfoDashboard2
              notifications={notifications}
              profileAnalytics={profileAnalytics}
            />
          </div>
        </header>

        <main className="flex-1 overflow-hidden px-6 pb-3">
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-2 h-full items-start">
            <div className="flex flex-col gap-2 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-4 shadow flex flex-col justify-center">
                  <p className="text-gray-500">Revenue</p>
                  <h2 className="text-2xl font-bold">{formatCurrency(revenue)}</h2>
                  <p className="text-green-500 text-sm">
                    {hasTransactions ? "Live" : ordersLoading ? "Loading..." : "--"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex flex-col justify-center">
                  <p className="text-gray-500">Available stocks</p>
                  <h2 className="text-2xl font-bold">
                    {formatCount(stockData.availableStocks)}
                  </h2>
                  <p className="text-red-500 text-sm">
                    {stockEntries.length ? "Inventory snapshot" : "--"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex flex-col justify-center">
                  <p className="text-gray-500">Low stock</p>
                  <h2 className="text-2xl font-bold">{formatCount(stockData.lowStock)}</h2>
                  <p className="text-green-500 text-sm">
                    {stockData.lowStock ? "Attention needed" : "All clear"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow flex flex-col justify-center">
                  <p className="text-gray-500">Out of stock</p>
                  <h2 className="text-2xl font-bold">{formatCount(stockData.outOfStock)}</h2>
                  <p className="text-red-500 text-sm">
                    {stockData.outOfStock ? "Restock soon" : "All clear"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0 lg:auto-rows-fr">
                <div className="bg-white rounded-lg p-4 pb-6 shadow flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2 relative">
                    <h2 className="font-bold">Stock Level</h2>
                    <div className="relative">
                      <button
                        onClick={() => setStockOpen((prev) => !prev)}
                        className="flex items-center border border-gray-300 rounded-md px-3 py-1 text-gray-500 text-sm hover:bg-gray-50"
                      >
                        {selectedStock || appliedCategory || "All"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </button>
                      {stockOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setSelectedStock("");
                              setStockOpen(false);
                            }}
                          >
                            All
                          </button>
                          {categories.map((cat) => (
                            <button
                              type="button"
                              key={cat}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => {
                                setSelectedStock(cat);
                                setStockOpen(false);
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {stockEntries.length ? (
                    <div className="overflow-y-auto no-scrollbar pr-1" style={{ maxHeight: 180 }}>
                      <div className="space-y-3">
                        {stockEntries
                          .filter((item) =>
                            (selectedStock || appliedCategory)
                              ? item.category === (selectedStock || appliedCategory)
                              : true
                          )
                          .map((item) => {
                            const percentage = item.total
                              ? Math.min(100, Math.max(0, (item.current / item.total) * 100))
                              : 0;
                            return (
                              <div key={item.id}>
                                <div className="flex justify-between text-sm font-medium">
                                  <span>{item.name}</span>
                                  <span>
                                    {item.current}/{item.total}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      percentage < 30
                                        ? "bg-red-500"
                                        : percentage < 70
                                        ? "bg-yellow-400"
                                        : "bg-green-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No stock data.</p>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 pb-6 shadow flex flex-col min-h-0">
                  <div className="flex justify-between items-center mb-2 relative">
                    <h2 className="font-bold">Top Selling Products</h2>
                    <div className="relative">
                      <button
                        onClick={() => setTopOpen((prev) => !prev)}
                        className="flex items-center border border-gray-300 rounded-md px-3 py-1 text-gray-500 text-sm hover:bg-gray-50"
                      >
                        {effectiveTopCategory || "All"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </button>
                      {topOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              setSelectedTop("");
                              setTopOpen(false);
                            }}
                          >
                            All
                          </button>
                          {categories.map((cat) => (
                            <button
                              type="button"
                              key={cat}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTop(cat);
                                setTopOpen(false);
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {topProducts.length ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={topProducts}
                        margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => Number(value || 0).toLocaleString()} />
                        <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={48}>
                          <LabelList
                            dataKey="sales"
                            position="top"
                            formatter={(value) => Number(value || 0).toLocaleString()}
                            style={{ fill: "#78350f", fontSize: 12 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-400">No sales recorded.</p>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg px-4 py-3 shadow" style={{ maxHeight: 240 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500">Order Summary</p>
                    <h2 className="text-2xl font-bold">
                      {formatCurrency(
                        orderSummaryData.reduce(
                          (sum, entry) => sum + Number(entry.profit || 0),
                          0
                        )
                      )}
                    </h2>
                    <p className="text-gray-400 text-sm">Total profit</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOrderRangeOpen((prev) => !prev)}
                      className="text-gray-500 text-sm border px-2 py-1 rounded"
                    >
                      {ORDER_RANGE_LABELS[orderRange] || "This week"}
                    </button>
                    {orderRangeOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setOrderRange("this_week");
                            setOrderRangeOpen(false);
                          }}
                        >
                          This week
                        </button>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setOrderRange("30");
                            setOrderRangeOpen(false);
                          }}
                        >
                          Last 30 days
                        </button>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setOrderRange("60");
                            setOrderRangeOpen(false);
                          }}
                        >
                          Last 60 days
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {orderSummaryData.length ? (
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={orderSummaryData}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis hide />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorProfit)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400 mt-3">
                    {ordersLoading
                      ? "Loading order summary..."
                      : "No orders in the selected range."}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 min-h-0">
              <div className="bg-white rounded-lg p-4 shadow flex flex-col flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold">Filters</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-green-600 text-sm"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="bg-green-50 text-green-600 px-3 py-1 rounded text-sm border border-green-100"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="mt-1 overflow-y-auto no-scrollbar pr-1" style={{ maxHeight: 140 }}>
                  <p className="text-xs text-gray-500 font-semibold">Time range</p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="date"
                      value={filterFrom}
                      onChange={(e) => {
                        setFilterFrom(e.target.value);
                        setShowDateError(false);
                      }}
                      className="border rounded px-3 py-2 text-sm w-full"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="date"
                      value={filterTo}
                      onChange={(e) => {
                        setFilterTo(e.target.value);
                        setShowDateError(false);
                      }}
                      className="border rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  {showDateError && (
                    <p className="text-xs text-red-600 mt-1">Please enter a valid date range.</p>
                  )}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-semibold">Category</p>
                    <div className="mt-2">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
                      >
                        <option value="All">All</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {ordersError && (
                  <p className="mt-4 text-sm text-red-600">
                    Unable to load recent orders: {ordersError}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow flex flex-col min-h-0 flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold flex items-center gap-2">
                    <User size={16} />
                    Recent Logins
                  </h2>
                  {usersLoading && (
                    <span className="text-gray-400 text-xs">Loading...</span>
                  )}
                </div>
                {recentLoginEntries.length ? (
                  <div
                    className="mt-1 overflow-y-auto no-scrollbar pr-1"
                    style={{ maxHeight: 132 }}
                  >
                    <div className="space-y-3">
                      {recentLoginEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {entry.avatar ? (
                              <img
                                src={entry.avatar}
                                alt={entry.name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200">
                                {(entry.name || "U")
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part.charAt(0).toUpperCase())
                                  .join("")}
                              </div>
                            )}
                            <div>
                              <p className="font-medium leading-tight text-gray-900">
                                {entry.name}
                              </p>
                              <p className="text-gray-500 text-sm leading-tight">
                                {entry.username || entry.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-gray-400 text-xs leading-tight">
                            <div>{entry.relativeLabel}</div>
                            <div>{entry.timeLabel}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {usersLoading
                      ? "Loading login activity..."
                      : "No recent logins in the selected range."}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold flex items-center gap-2">
                    <ShoppingCart size={16} />
                    Notifications
                  </h2>
                  <span className="text-gray-400 text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div
                  className="mt-2 space-y-1 overflow-y-auto no-scrollbar pr-1"
                  style={{ maxHeight: 100 }}
                >
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notifications</p>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={`${notif.text}-${idx}`} className="flex items-start gap-2">
                        {notif.type === "order" ? (
                          <ShoppingCart size={16} className="text-green-500 mt-1" />
                        ) : (
                          <Package size={16} className="text-orange-500 mt-1" />
                        )}
                        <div>
                          <p className="text-sm text-gray-700">{notif.text}</p>
                          <p className="text-xs text-gray-400">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
