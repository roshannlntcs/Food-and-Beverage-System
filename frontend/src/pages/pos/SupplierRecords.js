// src/pages/admin/SupplierRecords.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AdminInfoDashboard2 from "../../components/AdminInfoDashboard2";
import { FaSearch, FaPen } from "react-icons/fa";
import AddSupplierModal from "../../components/AddSupplierModal";
import EditSupplierModal from "../../components/EditSupplierModal";
import Pagination from "../../components/Pagination";
import ShowEntries from "../../components/ShowEntries";
import { useInventory } from "../../contexts/InventoryContext";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  listSupplierLogs,
  listSupplierLogsBySupplier,
  createSupplierLog,
} from "../../api/suppliers";
import { api } from "../../api/client";

const STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const formatStatus = (value) => STATUS_LABELS[value] || value || "Unknown";

const safeTrim = (value) => (typeof value === "string" ? value.trim() : value);

const normalizeSupplierPayload = (form) => {
  const status = String(form.status || "ACTIVE").toUpperCase();
  return {
    name: safeTrim(form.name) || "",
    contactPerson: safeTrim(form.contactPerson) || null,
    phone: safeTrim(form.phone) || null,
    email: safeTrim(form.email) || null,
    address: safeTrim(form.address) || null,
    products: safeTrim(form.products) || null,
    notes: safeTrim(form.notes) || null,
    status,
  };
};

const formatDateTime = (input) => {
  if (!input) return "â€”";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString();
};

const formatLogType = (type) => {
  switch (type) {
    case "DELIVERY":
      return "Delivery";
    case "STATUS_CHANGE":
      return "Status Change";
    case "NOTE":
      return "Note";
    default:
      return type ? type.replace(/_/g, " ") : "â€”";
  }
};

const describeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object") return "";
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
    .join("\n");
};

const describeLogDetails = (log) => {
  const lines = [];
  if (log.notes) lines.push(log.notes);
  if (typeof log.quantity === "number") lines.push(`Quantity: ${log.quantity}`);
  if (typeof log.unitCost === "number") {
    lines.push(`Unit Cost: PHP ${Number(log.unitCost).toFixed(2)}`);
  }
  if (log.inventoryLog?.stock !== undefined && log.inventoryLog?.stock !== null) {
    lines.push(`Stock After: ${log.inventoryLog.stock}`);
  }
  const metadataText = describeMetadata(log.metadata);
  if (metadataText) lines.push(metadataText);
  return lines.join("\n");
};

const createInitialLogForm = (supplierId = "") => ({
  type: "DELIVERY",
  supplierId,
  productId: "",
  quantity: "",
  unitCost: "",
  notes: "",
});

const SupplierRecords = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [supplierError, setSupplierError] = useState(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logFilterSupplierId, setLogFilterSupplierId] = useState("all");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logsNextCursor, setLogsNextCursor] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const [logForm, setLogForm] = useState(createInitialLogForm());
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSubmitError, setLogSubmitError] = useState(null);

  const { refresh: refreshInventory } = useInventory() || {};

  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await listSuppliers();
      const list = Array.isArray(response?.suppliers) ? [...response.suppliers] : [];
      list.sort((a, b) => a.name.localeCompare(b.name));
      setSuppliers(list);
      setSupplierError(null);
      setCurrentPage(1);
    } catch (error) {
      setSupplierError(error.message || "Failed to load suppliers.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (!showLogsModal) return;
    if (products.length || productsLoading) return;
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const list = await api("/products?includeInactive=true", "GET");
        setProducts(Array.isArray(list) ? list : []);
        setProductsError(null);
      } catch (error) {
        setProductsError(error.message || "Failed to load products.");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [showLogsModal, products.length, productsLoading]);

  useEffect(() => {
    if (showLogsModal) {
      const supplierId = logFilterSupplierId !== "all" ? String(logFilterSupplierId) : "";
      setLogForm(createInitialLogForm(supplierId));
    } else {
      setLogForm(createInitialLogForm());
      setLogs([]);
      setLogsNextCursor(null);
      setLogsError(null);
      setLogSubmitError(null);
    }
  }, [showLogsModal, logFilterSupplierId]);

  useEffect(() => {
    if (!showLogsModal) return;
    if (logFilterSupplierId === "all") return;
    setLogForm((prev) => ({ ...prev, supplierId: String(logFilterSupplierId) }));
  }, [logFilterSupplierId, showLogsModal]);

  const fetchLogs = useCallback(
    async ({ reset = false, cursor } = {}) => {
      if (!showLogsModal) return;
      setLogsLoading(true);
      if (reset) {
        setLogs([]);
        setLogsNextCursor(null);
      }
      try {
        const params = { take: 50 };
        if (cursor) params.cursor = cursor;
        let response;
        if (logFilterSupplierId === "all") {
          response = await listSupplierLogs(params);
        } else {
          response = await listSupplierLogsBySupplier(Number(logFilterSupplierId), params);
        }
        const data = Array.isArray(response?.data) ? response.data : [];
        setLogs((prev) => (reset ? data : [...prev, ...data]));
        setLogsNextCursor(response?.nextCursor ?? null);
        setLogsError(null);
      } catch (error) {
        setLogsError(error.message || "Failed to load supplier logs.");
      } finally {
        setLogsLoading(false);
      }
    },
    [logFilterSupplierId, showLogsModal]
  );

  useEffect(() => {
    if (!showLogsModal) return;
    fetchLogs({ reset: true });
  }, [showLogsModal, logFilterSupplierId, fetchLogs]);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return suppliers;
    return suppliers.filter((supplier) => {
      const fields = [
        supplier.name,
        supplier.contactPerson,
        supplier.phone,
        supplier.email,
        supplier.address,
        supplier.products,
        supplier.status,
      ];
      return fields.some((field) => (field || "").toLowerCase().includes(keyword));
    });
  }, [suppliers, search]);

  const openLogsModal = useCallback((supplierId = "all") => {
    setLogFilterSupplierId(supplierId === "all" ? "all" : String(supplierId));
    setShowLogsModal(true);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / entriesPerPage) || 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  useEffect(() => {
    if (location.state?.openSupplierLogs) {
      openLogsModal("all");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, openLogsModal, navigate]);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstEntry, indexOfLastEntry);

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setLogFilterSupplierId("all");
  };

  const handleAddSupplier = async (formValues) => {
    const payload = normalizeSupplierPayload(formValues);
    if (!payload.name) {
      throw new Error("Supplier name is required.");
    }
    const { supplier } = await createSupplier(payload);
    setSuppliers((prev) => {
      const next = [...prev, supplier];
      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
  };

  const handleEditSupplier = async (updatedValues) => {
    const supplierId = updatedValues.id || editingSupplier?.id;
    if (!supplierId) {
      throw new Error("Missing supplier id.");
    }
    const payload = normalizeSupplierPayload(updatedValues);
    const { supplier } = await updateSupplier(supplierId, payload);
    setSuppliers((prev) => {
      const next = prev.map((item) => (item.id === supplier.id ? supplier : item));
      next.sort((a, b) => a.name.localeCompare(b.name));
      return next;
    });
    setEditingSupplier(supplier);
    if (
      showLogsModal &&
      (logFilterSupplierId === "all" || logFilterSupplierId === String(supplier.id))
    ) {
      fetchLogs({ reset: true });
    }
  };

  const handleLogFilterChange = (event) => {
    setLogFilterSupplierId(event.target.value);
  };

  const handleLogFormChange = (field, value) => {
    setLogForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogTypeChange = (value) => {
    setLogForm((prev) =>
      value === "DELIVERY"
        ? { ...prev, type: value }
        : { ...prev, type: value, productId: "", quantity: "", unitCost: "" }
    );
  };

  const handleLogFormSubmit = async (event) => {
    event.preventDefault();
    if (logSubmitting) return;

    setLogSubmitError(null);

    const supplierIdValue =
      logFilterSupplierId === "all" ? logForm.supplierId : String(logFilterSupplierId);
    if (!supplierIdValue) {
      setLogSubmitError("Supplier is required.");
      return;
    }
    const supplierId = Number(supplierIdValue);
    if (!Number.isInteger(supplierId)) {
      setLogSubmitError("Invalid supplier.");
      return;
    }

    const payload = {
      type: logForm.type,
    };
    const trimmedNotes = safeTrim(logForm.notes);
    if (trimmedNotes) payload.notes = trimmedNotes;

    if (logForm.type === "DELIVERY") {
      if (!logForm.productId) {
        setLogSubmitError("Product is required for deliveries.");
        return;
      }
      const quantity = Number(logForm.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setLogSubmitError("Quantity must be a positive number.");
        return;
      }
      payload.productId = logForm.productId;
      payload.quantity = Math.trunc(quantity);
      if (logForm.unitCost) {
        const unitCost = Number(logForm.unitCost);
        if (Number.isFinite(unitCost)) {
          payload.unitCost = unitCost;
        }
      }
    }

    setLogSubmitting(true);
    try {
      await createSupplierLog(supplierId, payload);
      await fetchLogs({ reset: true });
      if (typeof refreshInventory === "function") {
        try {
          await refreshInventory();
        } catch (error) {
          console.error("Failed to refresh inventory after supplier log:", error);
        }
      }
      const defaultSupplierId = logFilterSupplierId !== "all" ? String(logFilterSupplierId) : "";
      setLogForm(createInitialLogForm(defaultSupplierId));
    } catch (error) {
      setLogSubmitError(error.message || "Failed to record supplier log.");
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleLoadMoreLogs = () => {
    if (!logsNextCursor) return;
    fetchLogs({ cursor: logsNextCursor });
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 w-full h-screen flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Supplier Records</h1>
          <AdminInfoDashboard2 enableStockAlerts />
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center border rounded-md px-4 py-2 w-full sm:w-96 bg-white">
              <input
                type="text"
                placeholder="Search Supplier"
                className="outline-none w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="text-gray-500 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadSuppliers}
                className="px-4 py-1 rounded-full border border-gray-300 text-sm bg-white hover:bg-gray-100 disabled:opacity-60"
                disabled={loadingSuppliers}
              >
                {loadingSuppliers ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow border border-yellow-500 rounded-full text-sm"
              >
                + Add Supplier
              </button>
            </div>
          </div>
          {supplierError && (
            <p className="text-sm text-red-600">{supplierError}</p>
          )}

          <div className="flex-none bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-y-auto no-scrollbar max-h-[65vh]">
              <table className="table-auto w-full text-sm">
                <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Supplier Name</th>
                  <th className="p-3 text-left">Contact Person</th>
                  <th className="p-3 text-left">Phone Number</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Products</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingSuppliers && currentSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-4 text-gray-500">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : currentSuppliers.length > 0 ? (
                  currentSuppliers.map((supplier, i) => (
                    <tr
                      key={supplier.id || supplier.name}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3">{indexOfFirstEntry + i + 1}</td>
                      <td className="p-3 font-semibold">{supplier.name}</td>
                      <td className="p-3">{supplier.contactPerson || "N/A"}</td>
                      <td className="p-3">{supplier.phone || "N/A"}</td>
                      <td className="p-3">{supplier.email || "N/A"}</td>
                      <td className="p-3">{supplier.address || "N/A"}</td>
                      <td className="p-3">{supplier.products || "N/A"}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            supplier.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                          } text-white`}
                        >
                          {formatStatus(supplier.status)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FaPen
                            className="text-red-600 cursor-pointer"
                            onClick={() => {
                              setEditingSupplier(supplier);
                              setShowEditModal(true);
                            }}
                          />
                          <button
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => openLogsModal(supplier.id)}
                          >
                            Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center p-4 text-gray-500">
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ShowEntries
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={setEntriesPerPage}
              setCurrentPage={setCurrentPage}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
            <button
              onClick={() => openLogsModal("all")}
              className="px-5 py-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500 rounded-full text-sm"
            >
              View Logs
            </button>
          </div>

      </div>

        {showAddModal && (
          <AddSupplierModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddSupplier}
          />
        )}

        {showEditModal && editingSupplier && (
          <EditSupplierModal
            supplierData={editingSupplier}
            onClose={() => {
              setShowEditModal(false);
              setEditingSupplier(null);
            }}
            onSave={handleEditSupplier}
          />
        )}

        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow w-[90%] max-h-[90vh] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">Supplier Logs</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={logFilterSupplierId}
                    onChange={handleLogFilterChange}
                  >
                    <option value="all">All suppliers</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={String(supplier.id)}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => fetchLogs({ reset: true })}
                    className="px-4 py-2 text-sm border rounded-full bg-white hover:bg-gray-100"
                    disabled={logsLoading}
                  >
                    {logsLoading ? "Loading..." : "Reload"}
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleLogFormSubmit}
                className="bg-gray-50 border rounded-lg p-4 mb-4"
              >
                <div className="grid gap-3 md:grid-cols-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold mb-1">Supplier</label>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={
                        logFilterSupplierId === "all"
                          ? logForm.supplierId
                          : String(logFilterSupplierId)
                      }
                      onChange={(e) => handleLogFormChange("supplierId", e.target.value)}
                      disabled={logFilterSupplierId !== "all" || logSubmitting}
                    >
                      {logFilterSupplierId === "all" && (
                        <option value="">Select supplier</option>
                      )}
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={String(supplier.id)}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold mb-1">Log Type</label>
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={logForm.type}
                      disabled={logSubmitting}
                      onChange={(e) => handleLogTypeChange(e.target.value)}
                    >
                      <option value="DELIVERY">Delivery</option>
                      <option value="NOTE">Note</option>
                    </select>
                  </div>
                  {logForm.type === "DELIVERY" && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Product</label>
                        <select
                          className="border rounded px-3 py-2 text-sm"
                          value={logForm.productId}
                          disabled={logSubmitting || productsLoading}
                          onChange={(e) => handleLogFormChange("productId", e.target.value)}
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          className="border rounded px-3 py-2 text-sm"
                          value={logForm.quantity}
                          disabled={logSubmitting}
                          onChange={(e) => handleLogFormChange("quantity", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Unit Cost (optional)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="border rounded px-3 py-2 text-sm"
                          value={logForm.unitCost}
                          disabled={logSubmitting}
                          onChange={(e) => handleLogFormChange("unitCost", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div
                    className={
                      logForm.type === "DELIVERY"
                        ? "flex flex-col md:col-span-2"
                        : "flex flex-col md:col-span-4"
                    }
                  >
                    <label className="text-xs font-semibold mb-1">Notes</label>
                    <textarea
                      className="border rounded px-3 py-2 text-sm h-[70px] resize-none"
                      value={logForm.notes}
                      disabled={logSubmitting}
                      onChange={(e) => handleLogFormChange("notes", e.target.value)}
                    />
                  </div>
                </div>
                {productsError && logForm.type === "DELIVERY" && (
                  <p className="text-xs text-red-600 mt-2">{productsError}</p>
                )}
                {logSubmitError && (
                  <p className="text-sm text-red-600 mt-3">{logSubmitError}</p>
                )}
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-60"
                    disabled={logSubmitting}
                  >
                    {logSubmitting ? "Saving..." : "Record Log"}
                  </button>
                </div>
              </form>

              <div className="overflow-auto max-h-[50vh] border rounded mb-4 no-scrollbar">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Date/Time</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Supplier</th>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Recorded By</th>
                      <th className="p-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log.id} className="odd:bg-gray-50">
                          <td className="p-2 align-top">{formatDateTime(log.createdAt)}</td>
                          <td className="p-2 align-top font-semibold">{formatLogType(log.type)}</td>
                          <td className="p-2 align-top">{log.supplier?.name || "â€”"}</td>
                          <td className="p-2 align-top">{log.productName || log.product?.name || "â€”"}</td>
                          <td className="p-2 align-top">
                            {log.recordedBy?.fullName || log.recordedBy?.username || "â€”"}
                          </td>
                          <td className="p-2 align-top whitespace-pre-line">
                            {describeLogDetails(log) || "â€”"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-4 text-gray-500">
                          {logsLoading ? "Loading logs..." : "No logs found."}
                        </td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>

                {logsError && (
                  <p className="text-sm text-red-600 mb-2">{logsError}</p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    {logsLoading && logs.length > 0 ? "Loading more logs..." : ""}
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    {logsNextCursor && (
                      <button
                        onClick={handleLoadMoreLogs}
                        className="bg-white border rounded-full px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-60"
                        disabled={logsLoading}
                      >
                        {logsLoading ? "Loading..." : "Load More"}
                      </button>
                    )}
                    <button
                      onClick={closeLogsModal}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full"
                    >
                      Close
                    </button>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierRecords;


