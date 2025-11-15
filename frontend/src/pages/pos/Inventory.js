// frontend/src/pages/admin/Inventory.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { FaSearch, FaPen, FaTrash } from 'react-icons/fa';
import AdminInfoDashboard2 from '../../components/AdminInfoDashboard2';
import AddItemModal from '../../components/modals/add-item-modal';
import EditItemModal from '../../components/modals/edit-item-modal';
import LogsModal from '../../components/modals/logs-modal';
import ItemSaveSuccessModal from '../../components/modals/ItemSaveSuccessModal';
import ValidationErrorModal from '../../components/modals/ValidationErrorModal';
import ManageCategoryModal from '../../components/modals/ManageCategoryModal';
import ShowEntries from '../../components/ShowEntries';
import Pagination from '../../components/Pagination';
import { useCategories } from '../../contexts/CategoryContext';
import { useInventory } from '../../contexts/InventoryContext';
import { fetchInventoryLogs } from '../../api/inventory';
const DEFAULT_STOCK = 100;
const PESO = '\u20B1';

const deriveStatusFromQuantity = (qty) => {
  if (!Number.isFinite(qty)) return 'Available';
  if (qty <= 0) return 'Unavailable';
  if (qty <= 10) return 'Low Stock';
  return 'Available';
};

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

const formatCurrency = (value) => pesoFormatter.format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const normalizeOptionArray = (list) =>
  Array.isArray(list)
    ? list
        .map((entry) =>
          typeof entry === 'string'
            ? { label: entry.trim(), price: 0 }
            : {
                label: (entry.label || '').trim(),
                price: Number(entry.price ?? 0),
              }
        )
        .filter((entry) => entry.label)
    : [];

const describeOptions = (list = []) => {
  if (!Array.isArray(list) || list.length === 0) return 'N/A';
  return list
    .map((entry) =>
      typeof entry === 'string'
        ? entry
        : `${entry.label}${
            entry.price ? ` (${PESO}${Number(entry.price).toFixed(2)})` : ''
          }`
    )
    .join(', ');
};


const describeSupplierLink = (link) => {
  if (!link) return '';

  const supplierName = link.supplier?.name || 'Supplier';
  const parts = [supplierName];

  if (link.type === 'DELIVERY') {
    const detailPieces = [];
    if (Number.isFinite(link.quantity)) detailPieces.push(`qty ${link.quantity}`);
    if (Number.isFinite(link.unitCost)) detailPieces.push(`unit ${formatCurrency(link.unitCost)}`);
    parts.push(`Delivery${detailPieces.length ? ` (${detailPieces.join(', ')})` : ''}`);
  } else if (link.type === 'STATUS_CHANGE') {
    const previous = link.metadata?.previousStatus || link.metadata?.prevStatus;
    const next = link.metadata?.nextStatus || link.metadata?.status || link.supplier?.status;
    const statusDetail =
      previous && next ? `${previous} -> ${next}` : next ? `Now ${next}` : 'Status change';
    parts.push(statusDetail);
  } else {
    parts.push(link.type || 'Log');
  }

  if (link.notes) {
    parts.push(link.notes);
  } else if (Array.isArray(link.metadata?.changes) && link.metadata.changes.length) {
    const changeLabels = link.metadata.changes
      .map((change) => change?.field || '')
      .filter(Boolean);
    if (changeLabels.length) parts.push(`Updated: ${changeLabels.join(', ')}`);
  }

  return parts.filter(Boolean).join(' â€” ');
};

const summarizeSupplierLinks = (links) => {
  if (!Array.isArray(links) || !links.length) return '';
  const lines = links
    .map((link) => describeSupplierLink(link))
    .filter((line) => line && line.trim().length);
  return lines.join('\n');
};

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const { inventory = [], addItem, updateItem, removeItem, getEffectiveStatus } = useInventory();

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const createEmptyItem = () => ({
    id: '',
    name: '',
    price: '',
    category: '',
    quantity: String(DEFAULT_STOCK),
    status: deriveStatusFromQuantity(DEFAULT_STOCK),
    allergens: '',
    addons: [],
    description: '',
    sizes: [],
    image: ''
  });

  const [newItem, setNewItem] = useState(createEmptyItem);

  const [filterDate, setFilterDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { categories = [], addCategory } = useCategories() || {};

  const ctxCategoryKeys = (categories || []).map(c => c.name);
  const uniqueCategories = [...new Set((inventory || []).map(i => i.category))].filter(Boolean);

  const mergedCategoryKeys = useMemo(() => {
    const seen = new Map();
    ctxCategoryKeys.forEach(key => {
      const k = String(key).trim();
      if (!k) return;
      const lower = k.toLowerCase();
      if (!seen.has(lower)) seen.set(lower, k);
    });
    uniqueCategories.forEach(key => {
      const k = String(key || '').trim();
      if (!k) return;
      const lower = k.toLowerCase();
      if (!seen.has(lower)) seen.set(lower, k);
    });
    return Array.from(seen.values());
  }, [ctxCategoryKeys, uniqueCategories]);

  const refreshLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const response = await fetchInventoryLogs({ take: 200, withSuppliers: true });
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      const mapped = list.map((log) => ({
        datetime: formatDateTime(log.createdAt),
        action: log.action || '-',
        admin: log.user?.fullName || log.user?.username || '-',
        product: log.productName || '-',
        stock:
          log.stock === null || log.stock === undefined
            ? '-'
            : `${log.stock} pcs`,
        oldPrice:
          log.oldPrice === null || log.oldPrice === undefined
            ? '-'
            : formatCurrency(log.oldPrice),
        newPrice:
          log.newPrice === null || log.newPrice === undefined
            ? '-'
            : formatCurrency(log.newPrice),
        category: log.category || '-',
        detail: log.detail || '-',
        supplier: summarizeSupplierLinks(log.suppliers) || '-',
      }));
      setLogs(mapped);
    } catch (error) {
      console.error('Failed to load inventory logs:', error);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLogs().catch(() => {});
  }, [refreshLogs]);

  const filteredInventory = (inventory || []).filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === '' || item.category === selectedCategory) &&
    (selectedStatus === '' || getEffectiveStatus(item) === selectedStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / entriesPerPage));
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || newItem.price === '' || newItem.quantity === '') {
      setErrorMessage('Fill Name, Category, Price, Quantity.');
      setShowErrorModal(true);
      return;
    }
    const price = Number(newItem.price);
    const qty = parseInt(newItem.quantity, 10);
    if (!Number.isFinite(price) || Number.isNaN(qty)) {
      setErrorMessage('Invalid price or stock.');
      setShowErrorModal(true);
      return;
    }

    if (addCategory) await addCategory(newItem.category);

    const normalizedSizes = normalizeOptionArray(newItem.sizes);
    const normalizedAddons = normalizeOptionArray(newItem.addons);
    const status = deriveStatusFromQuantity(qty);
    const id =
      newItem.id && newItem.id.trim()
        ? newItem.id.trim()
        : (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);

    const payload = {
      id,
      name: newItem.name,
      price,
      category: newItem.category,
      quantity: qty,
      status,
      allergens: newItem.allergens || "N/A",
      sizes: normalizedSizes,
      addons: normalizedAddons,
      description: newItem.description || "N/A",
      image: newItem.image || '',
    };

    try {
      await addItem(payload);
    } catch (e) {
      setErrorMessage(e?.message || 'Failed to add item.');
      setShowErrorModal(true);
      return;
    }

    refreshLogs().catch(() => {});

    setShowAddModal(false);
    setNewItem(createEmptyItem());
    setIsEditSuccess(false);
    setShowSaveModal(true);
  };

  const handleEditItem = async () => {
    if (!selectedItemId) return;
    const current = (inventory || []).find(it => it.id === selectedItemId);
    if (!current) return;

    const price = Number(newItem.price);
    const qty = parseInt(newItem.quantity, 10);
    if (!Number.isFinite(price) || Number.isNaN(qty)) {
      setErrorMessage('Invalid price or stock.');
      setShowErrorModal(true);
      return;
    }

    if (addCategory && newItem.category) await addCategory(newItem.category);

    const normalizedSizes = normalizeOptionArray(newItem.sizes);
    const normalizedAddons = normalizeOptionArray(newItem.addons);
    const status = deriveStatusFromQuantity(qty);

    const patch = {
      name: newItem.name,
      price,
      category: newItem.category,
      quantity: qty,
      status,
      allergens: newItem.allergens || "N/A",
      addons: normalizedAddons,
      description: newItem.description || "N/A",
      sizes: normalizedSizes,
      image: newItem.image !== undefined ? newItem.image : current.image || '',
    };

    let updated;
    try {
      updated = await updateItem(selectedItemId, patch);
    } catch (e) {
      setErrorMessage(e?.message || 'Failed to update item.');
      setShowErrorModal(true);
      return;
    }

    refreshLogs().catch(() => {});

    const result = updated || { id: selectedItemId, ...patch };
    const stringifySizes = (sizes) =>
      (sizes || [])
        .map((s) =>
          typeof s === 'string'
            ? s
            : `${s.label}${s.price ? ` (${PESO}${Number(s.price).toFixed(2)})` : ''}`
        )
        .join(', ');

    const changes = [];
    if (current.name !== result.name) {
      changes.push(`name "${current.name}" -> "${result.name}"`);
    }
    if (current.price !== result.price) {
      changes.push(
        `price ${formatCurrency(current.price)} -> ${formatCurrency(result.price)}`
      );
    }
    if (current.quantity !== result.quantity) {
      changes.push(`quantity ${current.quantity} -> ${result.quantity}`);
    }
    if ((current.category || '') !== (result.category || '')) {
      changes.push(`category "${current.category || ''}" -> "${result.category || ''}"`);
    }
    if ((current.status || '') !== (result.status || '')) {
      changes.push(`status "${current.status || ''}" -> "${result.status || ''}"`);
    }
    if ((current.allergens || '') !== (result.allergens || '')) {
      changes.push('allergens changed');
    }
    if (JSON.stringify(current.addons) !== JSON.stringify(result.addons)) {
      changes.push('addons changed');
    }
    if ((current.description || '') !== (result.description || '')) {
      changes.push('description changed');
    }
    if (JSON.stringify(current.sizes) !== JSON.stringify(result.sizes)) {
      changes.push(
        `sizes "${stringifySizes(current.sizes)}" -> "${stringifySizes(result.sizes)}"`
      );
    }
    if ((current.image || '') !== (result.image || '')) {
      changes.push('image changed');
    }

    setShowEditModal(false);
    setIsEditSuccess(true);
    setShowSaveModal(true);
  };

  const startDeleteItem = (item) => {
    if (!item) return;
    setItemToDelete(item);
    setDeleteLoading(false);
  };

  const cancelDeleteItem = () => {
    setItemToDelete(null);
    setDeleteLoading(false);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await removeItem(itemToDelete.id);
      await refreshLogs();
      setItemToDelete(null);
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to delete item.');
      setShowErrorModal(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 w-full h-screen flex flex-col overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <AdminInfoDashboard2 />
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 px-6 pb-6 overflow-hidden">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center border rounded-md px-4 py-2 w-72 bg-white">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <FaSearch className="text-gray-500 text-sm" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white min-w-[180px]"
              >
                <option value="">All Categories</option>
                {mergedCategoryKeys.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white min-w-[160px]"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Unavailable">Unavailable</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Reset Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManageCategories(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 shadow text-sm font-semibold border border-yellow-500 rounded-full"
              >
                Manage Categories
              </button>
              <button
                onClick={() => {
                  setNewItem(createEmptyItem());
                  setSelectedItemId(null);
                  setShowAddModal(true);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 shadow text-sm font-semibold border border-yellow-500 rounded-full"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="flex-none border rounded-md overflow-hidden">
            <div className="overflow-y-auto no-scrollbar max-h-[73vh]">
              <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Allergens</th>
                  <th className="p-3">Add-ons</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Sizes</th>
                  <th className="py-3 px-1 text-left">Stock</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.map((item, index) => (
                  <tr key={item.id || index} className="bg-[#fdfdfd] border-b hover:bg-[#f1f1f1]">
                    <td className="p-3">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{formatCurrency(item.price)}</td>
                    <td className="p-3">{item.category || "N/A"}</td>
                    <td className="p-3">{item.allergens || "N/A"}</td>
                    <td className="p-3">{describeOptions(item.addons)}</td>
                    <td className="p-3">{item.description || "N/A"}</td>
                    <td className="p-3">{describeOptions(item.sizes)}</td>
                    <td className="py-3 px-1 text-left">{item.quantity ?? 0}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium rounded-full ${
                        getEffectiveStatus(item) === 'Available' ? 'bg-green-500' :
                        getEffectiveStatus(item) === 'Low Stock' ? 'bg-orange-400' : 'bg-red-600'
                      } text-white`}>
                        {getEffectiveStatus(item)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setNewItem({
                              id: item.id,
                              name: item.name,
                              price: item.price ?? '',
                              category: item.category,
                              quantity: String(item.quantity ?? ''),
                              status: deriveStatusFromQuantity(Number(item.quantity ?? 0)),
                              allergens: item.allergens || "N/A",
                              addons: normalizeOptionArray(item.addons),
                              description: item.description || "N/A",
                              sizes: normalizeOptionArray(item.sizes),
                              image: item.image || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Edit item"
                        >
                          <FaPen />
                        </button>
                        <button
                          type="button"
                          onClick={() => startDeleteItem(item)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedInventory.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={(n) => { setEntriesPerPage(n); setCurrentPage(1); }}
            setCurrentPage={setCurrentPage}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          <button
            onClick={() => setShowLogsModal(true)}
            className="px-5 py-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow border border-yellow-500 rounded-full text-sm"
          >
            View Logs
          </button>
        </div>
      </div>

        {showAddModal && (
          <AddItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategoryKeys}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddItem}
            showErrorModal={showErrorModal}
            deriveStatus={deriveStatusFromQuantity}
          />
        )}

        {showEditModal && (
          <EditItemModal
            newItem={newItem}
            setNewItem={setNewItem}
            uniqueCategories={mergedCategoryKeys}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditItem}
            deriveStatus={deriveStatusFromQuantity}
          />
        )}

        {showLogsModal && (
          <LogsModal
            logs={logs}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onClose={() => setShowLogsModal(false)}
            loading={logsLoading}
          />
        )}

        {showSaveModal && (
          <ItemSaveSuccessModal onClose={() => setShowSaveModal(false)} isEdit={isEditSuccess} />
        )}
        {showErrorModal && (
          <ValidationErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
        )}

        {showManageCategories && (
          <ManageCategoryModal
            isOpen
            onClose={() => setShowManageCategories(false)}
            />
        )}

        {itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                Delete "{itemToDelete.name}"?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This will archive the product, hide it from the POS menu, and create an inventory log of the removal.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDeleteItem}
                  className="px-5 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-100"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteItem}
                  disabled={deleteLoading}
                  className="px-5 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
