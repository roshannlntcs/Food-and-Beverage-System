// src/pages/pos/SalesReport.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Percent,
  DollarSign,
  Users,
  Download,
  Printer,
} from "lucide-react";
import { fetchOrders } from "../../api/orders";
import { mapOrderToTx } from "../../utils/mapOrder";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

const formatDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

const formatMonthKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const DAY_LABEL_OPTIONS = { month: "short", day: "numeric" };
const MONTH_LABEL_OPTIONS = { month: "short", year: "numeric" };

const PAYMENT_COLORS = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28"];
const BAR_COLOR = "#f59e0b";
const LINE_COLOR = "#0ea5e9";
const AREA_COLOR = "#8b5cf6";

function SummaryTile({ icon, label, value, helper }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {helper && <div className="text-xs text-gray-500">{helper}</div>}
    </div>
  );
}

function NoData({ message }) {
  return (
    <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
      {message || "No data available for the selected filters"}
    </div>
  );
}

export default function SalesReport() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cashierFilter, setCashierFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const MAX_PAGE_SIZE = 100;
        const baseParams = {};
        if (dateFrom) baseParams.from = dateFrom;
        if (dateTo) baseParams.to = dateTo;
        if (cashierFilter) baseParams.cashierId = Number(cashierFilter);

        const aggregated = [];
        let cursor = undefined;
        let safetyCounter = 0;

        while (true) {
          const pageParams = {
            ...baseParams,
            take: MAX_PAGE_SIZE,
          };
          if (cursor) pageParams.cursor = cursor;

          const response = await fetchOrders(pageParams);
          const list = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.orders)
              ? response.orders
              : Array.isArray(response)
                ? response
                : [];

          aggregated.push(...list);

          const nextCursor =
            response?.nextCursor ??
            (response?.pagination?.nextCursor || null);

          if (!nextCursor) break;
          cursor = nextCursor;

          safetyCounter += 1;
          if (safetyCounter > 50) {
            console.warn("Sales report fetch aborted: too many pages.");
            break;
          }
        }

        if (!active) return;
        const unique = new Map();
        aggregated.forEach((order) => {
          const key = order.id ?? order.orderCode ?? order.transactionId;
          unique.set(key, order);
        });
        const mapped = Array.from(unique.values()).map(mapOrderToTx);
        setOrders(mapped);
      } catch (err) {
        console.error("Failed to load sales report data:", err);
        if (active) setError(err?.message || "Failed to load sales data.");
        if (active) setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, cashierFilter]);

  const cashierOptions = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      if (order.cashierId != null) {
        if (!map.has(order.cashierId)) {
          map.set(order.cashierId, order.cashier || `Cashier ${order.cashierId}`);
        }
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!methodFilter) return orders;
    const normalized = methodFilter.toUpperCase();
    return orders.filter(
      (order) => String(order.method || "").toUpperCase() === normalized
    );
  }, [orders, methodFilter]);

  const summary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
    const totalOrders = filteredOrders.length;
    const totalDiscount = filteredOrders.reduce(
      (sum, order) => sum + Number(order.discountAmt ?? order.discount ?? 0),
      0
    );
    const totalTax = filteredOrders.reduce(
      (sum, order) => sum + Number(order.tax ?? 0),
      0
    );
    const avgOrderValue = totalOrders
      ? totalRevenue / totalOrders
      : 0;
    const uniqueCustomers = new Set(
      filteredOrders.map((order) => order.transactionID)
    ).size;
    const voidedCount = filteredOrders.filter((order) => order.voided).length;

    return {
      totalRevenue,
      totalOrders,
      totalDiscount,
      totalTax,
      avgOrderValue,
      uniqueCustomers,
      voidedCount,
    };
  }, [filteredOrders]);

  const revenueByDay = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      const key = formatDateKey(order.createdAt || order.date);
      if (!key) return;
      const entry = map.get(key) || { day: key, sales: 0, orders: 0 };
      entry.sales += Number(order.total || 0);
      entry.orders += 1;
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .map((entry) => ({
        ...entry,
        label: new Date(entry.day).toLocaleDateString(undefined, DAY_LABEL_OPTIONS),
      }));
  }, [filteredOrders]);

  const revenueByMonth = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      const key = formatMonthKey(order.createdAt || order.date);
      if (!key) return;
      const entry = map.get(key) || { monthKey: key, revenue: 0 };
      entry.revenue += Number(order.total || 0);
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(`${a.monthKey}-01`) - new Date(`${b.monthKey}-01`))
      .map((entry) => ({
        ...entry,
        label: new Date(`${entry.monthKey}-01`).toLocaleDateString(
          undefined,
          MONTH_LABEL_OPTIONS
        ),
      }));
  }, [filteredOrders]);

  const paymentBreakdown = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      const method = String(order.method || "UNKNOWN").toUpperCase();
      map.set(method, (map.get(method) || 0) + Number(order.total || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        if (!item) return;
        const key = item.name || "Unnamed Item";
        const lineTotal =
          Number(item.totalPrice ?? item.lineTotal ?? 0) ||
          Number(item.unitPrice || 0) * Number(item.quantity || 1);
        const entry = map.get(key) || 0;
        map.set(key, entry + lineTotal);
      });
    });
    return Array.from(map.entries())
      .map(([name, sales]) => ({ name, sales: Number(sales.toFixed(2)) }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);
  }, [filteredOrders]);

  const cashierPerformance = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach((order) => {
      const key = order.cashierId ?? order.cashier ?? "Unknown";
      const entry =
        map.get(key) || {
          cashier: order.cashier || "Unknown",
          orders: 0,
          revenue: 0,
        };
      entry.orders += 1;
      entry.revenue += Number(order.total || 0);
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const productTrendData = useMemo(() => {
    if (!selectedProduct) return [];
    const map = new Map();
    filteredOrders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      const targetItems = order.items.filter(
        (item) => item?.name === selectedProduct
      );
      if (!targetItems.length) return;
      const key = formatDateKey(order.createdAt || order.date);
      if (!key) return;
      const entry = map.get(key) || { day: key, sales: 0 };
      targetItems.forEach((item) => {
        const lineTotal =
          Number(item.totalPrice ?? item.lineTotal ?? 0) ||
          Number(item.unitPrice || 0) * Number(item.quantity || 1);
        entry.sales += lineTotal;
      });
      map.set(key, entry);
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .map((entry) => ({
        ...entry,
        label: new Date(entry.day).toLocaleDateString(undefined, DAY_LABEL_OPTIONS),
        sales: Number(entry.sales.toFixed(2)),
      }));
  }, [filteredOrders, selectedProduct]);

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCashierFilter("");
    setMethodFilter("");
  };

  const summaryTiles = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      helper:
        summary.totalOrders > 0
          ? `${summary.totalOrders} orders recorded`
          : "No orders yet",
      icon: <TrendingUp size={16} className="text-emerald-600" />,
    },
    {
      label: "Average Order Value",
      value: formatCurrency(summary.avgOrderValue),
      helper: `Unique transactions: ${summary.uniqueCustomers}`,
      icon: <DollarSign size={16} className="text-blue-600" />,
    },
    {
      label: "Total Discount",
      value: formatCurrency(summary.totalDiscount),
      helper: `Tax collected: ${formatCurrency(summary.totalTax)}`,
      icon: <Percent size={16} className="text-purple-600" />,
    },
    {
      label: "Voided Orders",
      value: summary.voidedCount,
      helper: "Voids are excluded from totals above",
      icon: <ShoppingBag size={16} className="text-rose-600" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f9f6ee]">
      <Sidebar />
      <div className="ml-20 p-6 w-[calc(100%-5rem)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-500">
              Granular insights into revenue, product performance, and cashier efficiency.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#800000] text-white hover:bg-[#a40000] transition-colors flex items-center gap-2"
              onClick={() => {
                // simple CSV export
                const header = [
                  "Transaction ID",
                  "Date",
                  "Cashier",
                  "Method",
                  "Subtotal",
                  "Discount",
                  "Tax",
                  "Total",
                ];
                const rows = filteredOrders.map((order) => [
                  order.transactionID,
                  new Date(order.createdAt || order.date || Date.now()).toLocaleString(),
                  order.cashier || "",
                  order.method || "",
                  Number(order.subtotal || 0).toFixed(2),
                  Number(order.discountAmt ?? order.discount ?? 0).toFixed(2),
                  Number(order.tax ?? 0).toFixed(2),
                  Number(order.total || 0).toFixed(2),
                ]);
                const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `sales-report-${Date.now()}.csv`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
            <AdminInfo />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
            <div className="flex flex-col min-w-[180px]">
              <label className="text-xs font-medium text-gray-500 mb-1">Cashier</label>
              <select
                value={cashierFilter}
                onChange={(e) => setCashierFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">All cashiers</option>
                {cashierOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col min-w-[160px]">
              <label className="text-xs font-medium text-gray-500 mb-1">Payment Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">All methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="QR">QR</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          {loading && (
            <div className="mt-3 text-sm text-gray-500">Loading sales data…</div>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-600">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {summaryTiles.map((tile) => (
            <SummaryTile key={tile.label} {...tile} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Revenue Trend</h2>
              <span className="text-xs text-gray-400">
                {revenueByDay.length} day(s)
              </span>
            </div>
            {revenueByDay.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => label}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={LINE_COLOR}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Revenue by Payment Method</h2>
            {paymentBreakdown.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) =>
                      `${entry.name}: ${formatCurrency(entry.value)}`
                    }
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Top Selling Products</h2>
              <span className="text-xs text-gray-400">
                Click a bar to view trend
              </span>
            </div>
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topProducts}
                  onClick={(data, index) => {
                    if (!data || !data.activeLabel) return;
                    setSelectedProduct(data.activeLabel);
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar
                    dataKey="sales"
                    fill={BAR_COLOR}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Revenue by Month</h2>
            {revenueByMonth.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={AREA_COLOR}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <NoData />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Cashier Performance</h2>
            {cashierPerformance.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="py-2 px-3">Cashier</th>
                      <th className="py-2 px-3">Orders</th>
                      <th className="py-2 px-3">Revenue</th>
                      <th className="py-2 px-3">Avg Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashierPerformance.map((entry, idx) => (
                      <tr
                        key={`${entry.cashier}-${idx}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 px-3 font-medium">{entry.cashier}</td>
                        <td className="py-2 px-3">{entry.orders}</td>
                        <td className="py-2 px-3">{formatCurrency(entry.revenue)}</td>
                        <td className="py-2 px-3">
                          {formatCurrency(entry.revenue / entry.orders || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <NoData />
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users size={24} className="text-blue-600" />
                <div>
                  <p className="text-xs uppercase text-gray-500">Unique Transactions</p>
                  <p className="text-lg font-semibold">{summary.uniqueCustomers}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <ShoppingBag size={24} className="text-emerald-600" />
                <div>
                  <p className="text-xs uppercase text-gray-500">Orders Recorded</p>
                  <p className="text-lg font-semibold">{summary.totalOrders}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg col-span-2">
                <TrendingUp size={24} className="text-purple-600" />
                <div>
                  <p className="text-xs uppercase text-gray-500">Average Daily Revenue</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      revenueByDay.length
                        ? summary.totalRevenue / revenueByDay.length
                        : 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product trend"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {selectedProduct} &mdash; Daily Revenue Trend
              </h2>
              {productTrendData.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={productTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoData message="No sales recorded for this product in the selected period." />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
