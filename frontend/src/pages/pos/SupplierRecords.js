import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AdminInfo from "../../components/AdminInfo";
import { FaSearch, FaPen } from "react-icons/fa";

const initialSuppliers = [
  {
    name: 'Davao Fresh Supplies',
    contactPerson: 'Maria Santos',
    phone: '09171234567',
    email: 'davaofresh@example.com',
    address: 'Davao City',
    products: 'Eggs, Chicken',
    status: 'Active',
  },
  {
    name: 'Panabo Meats',
    contactPerson: 'Jose Dela Cruz',
    phone: '09281234567',
    email: 'panabomeats@example.com',
    address: 'Panabo City',
    products: 'Beef, Pork',
    status: 'Inactive',
  },
  {
    name: 'Tagum Agro Supplies',
    contactPerson: 'Liza Moreno',
    phone: '09391234567',
    email: 'tagumagro@example.com',
    address: 'Tagum City',
    products: 'Vegetables, Spices',
    status: 'Active',
  },
  {
    name: 'Mintal Livestock',
    contactPerson: 'Carlos Mendoza',
    phone: '09551234567',
    email: 'mintallive@example.com',
    address: 'Mintal, Davao City',
    products: 'Chicken, Duck',
    status: 'Active',
  },
  {
    name: 'Toril Groceries',
    contactPerson: 'Jenny Abad',
    phone: '09661234567',
    email: 'torilgrocery@example.com',
    address: 'Toril, Davao City',
    products: 'Fruits, Canned Goods',
    status: 'Inactive',
  },
  {
    name: 'Calinan Egg Supply',
    contactPerson: 'Ronnie Cruz',
    phone: '09184561234',
    email: 'calinanegg@example.com',
    address: 'Calinan, Davao City',
    products: 'Eggs',
    status: 'Active',
  },
  {
    name: 'Agdao Market Bulk',
    contactPerson: 'Elaine Yu',
    phone: '09999992345',
    email: 'agdao_bulk@example.com',
    address: 'Agdao, Davao City',
    products: 'Meat, Vegetables',
    status: 'Inactive',
  },
  {
    name: 'Ecoland Dairy',
    contactPerson: 'Francis Dy',
    phone: '09213456789',
    email: 'ecolanddairy@example.com',
    address: 'Ecoland, Davao City',
    products: 'Milk, Yogurt',
    status: 'Active',
  },
  {
    name: 'Bajada Farms',
    contactPerson: 'Althea Tan',
    phone: '09112223344',
    email: 'bajadafarms@example.com',
    address: 'Bajada, Davao City',
    products: 'Organic Chicken',
    status: 'Active',
  },
  {
    name: 'SM Wholesale',
    contactPerson: 'Janice Ong',
    phone: '09199887766',
    email: 'smwholesale@example.com',
    address: 'Lanang, Davao City',
    products: 'Various Goods',
    status: 'Inactive',
  },
  {
    name: 'Matina Traders',
    contactPerson: 'Arthur G.',
    phone: '09988776655',
    email: 'matinatraders@example.com',
    address: 'Matina, Davao City',
    products: 'Spices, Oil',
    status: 'Active',
  },
  {
    name: 'Tagum Veggies Depot',
    contactPerson: 'Rowena L.',
    phone: '09173334455',
    email: 'tagumveggies@example.com',
    address: 'Tagum City',
    products: 'Lettuce, Tomatoes',
    status: 'Active',
  },
  {
    name: 'Panabo Cold Storage',
    contactPerson: 'Dexter Lim',
    phone: '09334455667',
    email: 'panabocold@example.com',
    address: 'Panabo City',
    products: 'Frozen Goods',
    status: 'Inactive',
  },
  {
    name: 'Gaisano Bulk Center',
    contactPerson: 'Clarence Uy',
    phone: '09215557788',
    email: 'gaisanobulk@example.com',
    address: 'Davao City',
    products: 'Dry Goods, Beverages',
    status: 'Active',
  },
  {
    name: 'Sasa Fisheries',
    contactPerson: 'Irene Mendoza',
    phone: '09097773344',
    email: 'sasafish@example.com',
    address: 'Sasa, Davao City',
    products: 'Fish, Shrimp',
    status: 'Active',
  },
];

const SupplierRecords = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '', products: '', status: 'Active' });
  const adminName = localStorage.getItem('adminFullName') || 'Admin';

  
  const handleAddSupplier = () => {
    setSuppliers([...suppliers, newSupplier]);
    setLogs([...
      logs,
      {
        datetime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        action: 'Add',
        admin: adminName,
        supplier: newSupplier.name,
        detail: `Added new supplier: ${newSupplier.name}`,
      },
    ]);
    setShowAddModal(false);
    setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '', products: '', status: 'Active' });
  };

  const handleEditSupplier = () => {
    const updated = [...suppliers];
    const old = updated[selectedSupplierIndex];
    updated[selectedSupplierIndex] = newSupplier;
    setSuppliers(updated);

    let changes = [];
    for (let key in old) {
      if (old[key] !== newSupplier[key]) {
        changes.push(`${key} from "${old[key]}" to "${newSupplier[key]}"`);
      }
    }

    const detail = changes.length > 0 ? `Updated ${changes.join(', ')}` : 'No changes made';

    setLogs([...
      logs,
      {
        datetime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        action: 'Update',
        admin: adminName,
        supplier: newSupplier.name,
        detail,
      },
    ]);

    setShowEditModal(false);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f9f6ee] overflow-hidden">
      <Sidebar />
      <div className="ml-20 p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Supplier Records</h1>
     <AdminInfo />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center border rounded-md px-4 py-2 w-96 bg-white">
            <input
              type="text"
              placeholder="Search Supplier"
              className="outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="text-gray-500" />
          </div>
          <button
            onClick={() => {
              setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '', products: '', status: 'Active' });
              setShowAddModal(true);
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-1 rounded shadow text-lg font-semibold border border-yellow-500"
          >
            + Add Supplier
          </button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-[#8B0000] text-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3">No.</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Contact Person</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Products</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-[#f1f1f1]">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{supplier.name}</td>
                    <td className="p-3">{supplier.contactPerson}</td>
                    <td className="p-3">{supplier.phone}</td>
                    <td className="p-3">{supplier.email}</td>
                    <td className="p-3">{supplier.address}</td>
                    <td className="p-3">{supplier.products}</td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${supplier.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <FaPen
                        className="text-red-600 cursor-pointer mx-auto"
                        onClick={() => {
                          setSelectedSupplierIndex(i);
                          setNewSupplier(supplier);
                          setShowEditModal(true);
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center p-4 text-gray-500">No suppliers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowLogsModal(true)}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded shadow border border-yellow-500"
          >
            View Logs
          </button>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-center">{showAddModal ? 'Add New Supplier' : 'Edit Supplier'}</h2>
              <div className="space-y-3">
                {['name', 'contactPerson', 'phone', 'email', 'address', 'products'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="text"
                      className="w-full border rounded px-4 py-2"
                      value={newSupplier[field]}
                      onChange={(e) => setNewSupplier({ ...newSupplier, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select
                    className="w-full border rounded px-4 py-2"
                    value={newSupplier.status}
                    onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? handleAddSupplier : handleEditSupplier}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold"
                >
                  {showAddModal ? 'Save' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Modal */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white p-6 rounded shadow w-[90%] max-h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Supplier Logs</h2>
              </div>
              <div className="overflow-auto max-h-[60vh] border rounded">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-[#8B0000] text-white sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Date/Time</th>
                      <th className="p-2 text-left">Action</th>
                      <th className="p-2 text-left">Admin</th>
                      <th className="p-2 text-left">Supplier</th>
                      <th className="p-2 text-left">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2">{log.datetime}</td>
                        <td className="p-2">{log.action}</td>
                        <td className="p-2">{log.admin}</td>
                        <td className="p-2">{log.supplier}</td>
                        <td className="p-2">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierRecords;