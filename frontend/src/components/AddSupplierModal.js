import React, { useState } from "react";

// ✅ Success Modal Component
const SaveSuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[350px] text-center p-6">
        {/* Green Check Icon */}
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

        {/* Message */}
        <p className="text-lg font-semibold mb-5">Supplier added successfully!</p>

        {/* OK Button */}
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

// ✅ Add Supplier Modal Component
const AddSupplierModal = ({ onClose, onSave }) => {
  const [supplier, setSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    products: "",
    status: "Active",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (!supplier.name || !supplier.contactPerson) {
      alert("Name and Contact Person are required");
      return;
    }
    onSave(supplier);
    setShowSuccess(true); // show success modal
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose(); // close parent modal after success
  };

  return (
    <>
      {!showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-2xl shadow-lg">
            {/* Header */}
            <div className="bg-[#8B0000] text-white text-center py-5 rounded-t-2xl">
              <h2 className="text-lg font-bold">New Supplier</h2>
            </div>

            {/* Form Body with label on left */}
            <div className="px-10 py-8 space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Name</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.name}
                  onChange={(e) =>
                    setSupplier({ ...supplier, name: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Contact Person</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.contactPerson}
                  onChange={(e) =>
                    setSupplier({ ...supplier, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Phone Number</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.phone}
                  onChange={(e) =>
                    setSupplier({ ...supplier, phone: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Email</label>
                <input
                  type="email"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.email}
                  onChange={(e) =>
                    setSupplier({ ...supplier, email: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Address</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.address}
                  onChange={(e) =>
                    setSupplier({ ...supplier, address: e.target.value })
                  }
                />
              </div>
              <div className="flex items-start gap-4">
                <label className="w-32 text-sm font-semibold mt-2">
                  Assigned Products
                </label>
                <textarea
                  className="flex-1 border rounded px-3 py-2 h-[70px] resize-none"
                  value={supplier.products}
                  onChange={(e) =>
                    setSupplier({ ...supplier, products: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-semibold">Status</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={supplier.status}
                  onChange={(e) =>
                    setSupplier({ ...supplier, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-10 pb-6">
              <button
                onClick={onClose}
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-yellow-500 text-black px-6 py-2 rounded-full hover:bg-yellow-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && <SaveSuccessModal onClose={handleSuccessClose} />}
    </>
  );
};

export default AddSupplierModal;
