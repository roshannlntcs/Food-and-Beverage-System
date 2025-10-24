import React, { useEffect, useState } from "react";

const SaveSuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[350px] text-center p-6">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <p className="text-lg font-semibold mb-5">Supplier updated successfully!</p>

        <button
          onClick={onClose}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-2 rounded-full font-semibold"
        >
          OK
        </button>
      </div>
    </div>
  );
};

const defaultSupplier = {
  id: null,
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  products: "",
  status: "ACTIVE",
};

const EditSupplierModal = ({ supplierData, onClose, onSave }) => {
  const [supplier, setSupplier] = useState(defaultSupplier);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (supplierData) {
      setSupplier({
        ...defaultSupplier,
        ...supplierData,
        status: String(supplierData.status || "ACTIVE").toUpperCase(),
      });
    }
  }, [supplierData]);

  const handleSave = async () => {
    const name = supplier.name.trim();
    const contactPerson = supplier.contactPerson.trim();
    if (!name || !contactPerson) {
      setError("Name and Contact Person are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...supplier,
        name,
        contactPerson,
        status: supplier.status || "ACTIVE",
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const updateField = (field, value) => {
    setSupplier((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {!showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-2xl shadow-lg">
            <div className="bg-[#8B0000] text-white text-center py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold">Edit Supplier</h2>
            </div>

            <div className="px-10 py-8 space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Name</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.name}
                  disabled={saving}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Contact Person</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.contactPerson}
                  disabled={saving}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Phone Number</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.phone}
                  disabled={saving}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Email</label>
                <input
                  type="email"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.email}
                  disabled={saving}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Address</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.address}
                  disabled={saving}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-semibold mt-2">Assigned Products</label>
                <textarea
                  className="flex-1 border rounded px-3 py-2 h-[70px] resize-none"
                  value={supplier.products}
                  disabled={saving}
                  onChange={(e) => updateField("products", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Status</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.status}
                  disabled={saving}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {error && (
                <p className="text-sm text-red-600 text-center pt-2">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-10 pb-6">
              <button
                onClick={onClose}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 disabled:opacity-60"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && <SaveSuccessModal onClose={handleSuccessClose} />}
    </>
  );
};

export default EditSupplierModal;
