import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


export default function AdminPanel() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [activeSection, setActiveSection] = useState("homepage");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
const [selectedTransaction, setSelectedTransaction] = useState(null);
const [showReceiptModal, setShowReceiptModal] = useState(false);


const [transactionData, setTransactionData] = useState([
  {
    date: "May 23, 2025 11:15 am",
    userId: "Cashier 1",
    transactionNo: "111-000191",
    items: "Biplop with fries",
    method: "Cash",
    status: "Completed",
    amount: "$54.60",
    quantity: 2,
    itemsList: [
      { name: "Biplop", qty: 1, price: 25.00 },
      { name: "Fries", qty: 1, price: 29.60 },
    ],
    total: 54.60,
  },
  {
    date: "May 23, 2025 11:52 am",
    userId: "Cashier 1",
    transactionNo: "111-000192",
    items: "Birgir with drinks",
    method: "Cash",
    status: "Completed",
    amount: "$99.50",
    quantity: 3,
    itemsList: [
      { name: "Birgir", qty: 2, price: 30.00 },
      { name: "Drinks", qty: 1, price: 39.50 },
    ],
    total: 99.50,
  },
  {
    date: "May 24, 2025 10:52 am",
    userId: "Cashier 2",
    transactionNo: "111-000193",
    items: "Pastil Rice",
    method: "Cash",
    status: "Completed",
    amount: "$12.50",
    quantity: 1,
    itemsList: [
      { name: "Pastil Rice", qty: 1, price: 12.50 },
    ],
    total: 12.50,
  },
  ...Array(20).fill(0).map((_, i) => {
    const even = i % 2 === 0;
    return {
      date: `May 25, 2025 10:${i.toString().padStart(2, '0')} am`,
      userId: `Cashier ${i % 3 + 1}`,
      transactionNo: `111-0002${i + 10}`,
      items: even ? "Fried Chicken" : "Burger",
      method: "Cash",
      status: "Completed",
      amount: `$${(10 + i * 2.5).toFixed(2)}`,
      quantity: even ? 2 : 1,
      itemsList: even
        ? [
            { name: "Fried Chicken", qty: 2, price: (10 + i * 2.5) / 2 },
          ]
        : [
            { name: "Burger", qty: 1, price: 10 + i * 2.5 },
          ],
      total: parseFloat((10 + i * 2.5).toFixed(2)),
    };
  }),
]);


  const filteredData = transactionData.filter((entry) => {
    const searchMatch = entry.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.transactionNo.includes(searchTerm) ||
      entry.items.toLowerCase().includes(searchTerm.toLowerCase());

    const entryDate = new Date(entry.date.replace(/(\d{1,2})(am|pm)/, ' $1$2'));
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const dateMatch = (!start || entryDate >= start) && (!end || entryDate <= end);
    return searchMatch && dateMatch;
  });

 //inventory state 
  const [inventoryData, setInventoryData] = useState([
  { name: "Avocados", price: 92.0, category: "Soup", qty: 50, status: "Available" },
  { name: "Shorak", price: 120.0, category: "Main Dish", qty: 30, status: "Available" },
  { name: "Majito", price: 250.0, category: "Liquor", qty: 10, status: "Unavailable" },
  { name: "French Fries", price: 75.0, category: "Appetizer", qty: 15, status: "Available" },
  { name: "Cheesecake", price: 120.0, category: "Dessert", qty: 40, status: "Available" },
  { name: "Salad Trio", price: 110.0, category: "Main Dish", qty: 60, status: "Available" },
  { name: "Beef Stew", price: 260.0, category: "Main Dish", qty: 0, status: "Unavailable" },
  
  
]);

const [showPopup, setShowPopup] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [currentItem, setCurrentItem] = useState({
  name: "",
  price: "",
  category: "",
  qty: "",
  status: "Available",
});

// SUPPLIER STATE
const [supplierData, setSupplierData] = useState([
  {
    name: "Ethan’s Poultry",
    contact: "Berting",
    phone: "123456",
    email: "poulty@gmail.com",
    address: "Davao City",
    products: "Eggs, Chicken",
    status: "Active",
  },
  {
    name: "JD’s Meat",
    contact: "Jonas",
    phone: "987654",
    email: "jdmeat@outlook.com",
    address: "Panabo City",
    products: "Pork, Beef",
    status: "Inactive",
  },
  {
    name: "F Water Station",
    contact: "Lukas",
    phone: "122144",
    email: "fws@yahoo.com",
    address: "Davao City",
    products: "Water",
    status: "Active",
  },
  {
    name: "BM Rice & Supplies",
    contact: "Annie",
    phone: "12313",
    email: "bmrs@gmail.com",
    address: "Davao City",
    products: "Rice",
    status: "Active",
  },
  {
    name: "San Miguel",
    contact: "Adi",
    phone: "75.00",
    email: "sandaratinq@gmail.com",
    address: "Davao City",
    products: "Liquor",
    status: "Active",
  },
  {
    name: "Beefery",
    contact: "Babelita",
    phone: "299.00",
    email: "beefwithyou@gmail.com",
    address: "Panabo City",
    products: "Beef",
    status: "Active",
  },
  {
    name: "Flour Hour",
    contact: "Ian",
    phone: "50.00",
    email: "flouryou@gmail.com",
    address: "Panabo City",
    products: "Flour",
    status: "Active",
  },
  {
    name: "Fish Pen",
    contact: "Bogart",
    phone: "350.00",
    email: "bogart@gmail.com",
    address: "Davao City",
    products: "Fish",
    status: "Active",
  },
]);

const [showSupplierPopup, setShowSupplierPopup] = useState(false);
const [isEditSupplierMode, setIsEditSupplierMode] = useState(false);
const [currentSupplier, setCurrentSupplier] = useState({
  name: "",
  contact: "",
  phone: "",
  email: "",
  address: "",
  products: "",
  status: "Active",
});

  useEffect(() => {
    const storedName = localStorage.getItem("adminFullName");
    if (storedName) {
      setAdminName(storedName);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminFullName");
    navigate("/roles");
  };

  const navigationItems = [
    { id: "homepage", label: "Home" },
    { id: "inventory", label: "Inventory" },
    { id: "pos", label: "POS Monitoring" },
    { id: "suppliers", label: "Supplier Records" },
    { id: "voidlogs", label: "Void Logs" },
  ];

  const renderHomepage = () => (
  <div className="space-y-6">
    {/* Stats on top */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Revenue</p>
        <h2 className="text-xl font-bold">₱25,000</h2>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Total Orders</p>
        <h2 className="text-xl font-bold">500</h2>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Pending Orders</p>
        <h2 className="text-xl font-bold">20</h2>
      </div>
    </div>

    {/* Charts below */}
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-semibold">Stocks Overview</h3>
        <div className="mt-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
          Chart Placeholder
        </div>
      </div>
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-semibold">Sales by Category</h3>
        <div className="mt-4 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
          Pie Chart Placeholder
        </div>
      </div>
      <div className="bg-white shadow p-6 rounded col-span-2">
        <h3 className="text-lg font-semibold mb-4">Today's Top Selling</h3>
        <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-500">
          Bar Chart Placeholder
        </div>
      </div>
    </div>
  </div>
);


  const renderInventory = () => (
    <div className="space-y-6">
     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
  <h2 className="text-2xl font-bold">Product List</h2>
  <button
  className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#660000] w-fit self-end md:self-auto"
  onClick={() => {
    setCurrentItem({ name: "", price: "", category: "", qty: "", status: "Available" });
    setIsEditMode(false);
    setShowPopup(true);
  }}
>
  + Add Item
</button>

</div>

      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <div className="overflow-x-auto max-h-[400px] overflow-y-scroll rounded border">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">No.</th>
              <th className="text-left p-3 border">Name</th>
              <th className="text-left p-3 border">Price</th>
              <th className="text-left p-3 border">Category</th>
              <th className="text-left p-3 border">Quantity</th>
              <th className="text-left p-3 border">Status</th>
              <th className="text-left p-3 border">Actions</th>
            </tr>
          </thead>
         <tbody>
  {inventoryData.map((item, index) => (
    <tr key={index} className="border-t">
      <td className="p-3 border">{index + 1}</td>
      <td className="p-3 border">{item.name}</td>
      <td className="p-3 border">₱{item.price.toFixed(2)}</td>
      <td className="p-3 border">{item.category}</td>
      <td className="p-3 border">{item.qty}</td>
      <td className="p-3 border">{item.status}</td>
      <td className="p-3 border">
        <button
          onClick={() => {
            setIsEditMode(true);
            setCurrentItem(item);
            setShowPopup(true);
          }}
          className="bg-[#800000] text-white px-3 py-1 rounded hover:bg-[#660000]"
        >
          Edit
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
      <div className="text-right">
        <button className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">
          View Logs
        </button>
      </div>
    </div>
  );
 const renderPOSMonitoring = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex gap-4 items-center">
          <input type="date" className="border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span>—</span>
          <input type="date" className="border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 border border-gray-300 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto max-h-[400px] overflow-y-scroll border rounded">
        <table className="min-w-full bg-white border">
         <thead>
  <tr className="bg-gray-100 text-left">
    <th className="p-3 border">Date</th>
    <th className="p-3 border">User ID</th>
    <th className="p-3 border">Transaction No.</th>
    <th className="p-3 border">Ordered Items</th>
    <th className="p-3 border">Quantity</th> {/* 🆕 Add this line */}
    <th className="p-3 border">Payment Method</th>
    <th className="p-3 border">Status</th>
    <th className="p-3 border">Amount</th>
  </tr>
</thead>
          <tbody>
  {filteredData.map((row, index) => (
    <tr key={index} className="border-t">
      <td className="p-3 border">{row.date}</td>
      <td className="p-3 border">{row.userId}</td>
      <td
        className="p-3 border text-blue-700 underline cursor-pointer"
        onClick={() => setSelectedTransaction(row)}
      >
        {row.transactionNo}
      </td>
      <td className="p-3 border">{row.items}</td>
      <td className="p-3 border">{row.quantity || (row.itemsList?.reduce((sum, item) => sum + item.qty, 0) || 0)}</td> {/* 🆕 Quantity */}
      <td className="p-3 border">{row.method}</td>
      <td className="p-3 border">{row.status}</td>
      <td className="p-3 border">{row.amount}</td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      <div className="text-right">
        <button className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">
          View Sales Report
        </button>
      </div>
    </div>
  );

const renderSuppliers = () => {
  return (
    <div className="space-y-6">
      {/* Header + Add Supplier */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Supplier Records</h2>
        <button
          className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#660000] w-fit self-end md:self-auto"

          onClick={() => {
            setIsEditSupplierMode(false);
            setCurrentSupplier({
              name: "",
              contact: "",
              phone: "",
              email: "",
              address: "",
              products: "",
              status: "Active",
            });
            setShowSupplierPopup(true);
          }}
        >
          + Add Supplier
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 border border-gray-300 rounded"
      />

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded border">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">Supplier Name</th>
              <th className="text-left p-3 border">Contact Person</th>
              <th className="text-left p-3 border">Phone Number</th>
              <th className="text-left p-3 border">Email Address</th>
              <th className="text-left p-3 border">Address</th>
              <th className="text-left p-3 border">Assigned Products</th>
              <th className="text-left p-3 border">Status</th>
              <th className="text-left p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {supplierData.map((supplier, index) => (
              <tr key={index} className="border-t">
                <td className="p-3 border">{supplier.name}</td>
                <td className="p-3 border">{supplier.contact}</td>
                <td className="p-3 border">{supplier.phone}</td>
                <td className="p-3 border">{supplier.email}</td>
                <td className="p-3 border">{supplier.address}</td>
                <td className="p-3 border">{supplier.products}</td>
                <td className="p-3 border">{supplier.status}</td>
                <td className="p-3 border">
                  <button
                    className="bg-[#800000] text-white px-3 py-1 rounded hover:bg-[#660000]"

                    onClick={() => {
                      setIsEditSupplierMode(true);
                      setCurrentSupplier(supplier);
                      setShowSupplierPopup(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logs Button */}
      <div className="text-right">
        <button className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">
          View Logs
        </button>
      </div>
    </div>
  );
};


const handleSave = () => {
  if (isEditMode) {
    // Update item in inventory
    setInventoryData((prevData) =>
      prevData.map((item) =>
        item.name === currentItem.name ? currentItem : item
      )
    );
  } else {
    // Add new item
    setInventoryData((prevData) => [...prevData, currentItem]);
  }

  // Reset
  setCurrentItem({ name: "", price: "", category: "", qty: "", status: "Available" });
  setShowPopup(false);
  setIsEditMode(false);
};
const handleSaveSupplier = () => {
  if (isEditSupplierMode) {
    setSupplierData((prev) =>
      prev.map((sup) =>
        sup.name === currentSupplier.name ? currentSupplier : sup
      )
    );
  } else {
    setSupplierData((prev) => [...prev, currentSupplier]);
  }

  setShowSupplierPopup(false);
  setIsEditSupplierMode(false);
  setCurrentSupplier({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    products: "",
    status: "Active",
  });
};

  const renderContent = () => {
  switch (activeSection) {
    case "homepage": return renderHomepage();
    case "inventory": return renderInventory();
   case "pos": return renderPOSMonitoring();
    case "suppliers": return renderSuppliers(); // ← change this line
    case "voidlogs": return <h2 className="text-2xl font-bold">Void Logs</h2>;
    default: return renderHomepage();
    
  }
};

{renderContent()
  
}

{showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded p-6 w-[90%] max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {isEditMode ? "Edit Item" : "Add Item"}
      </h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={currentItem.name}
          onChange={(e) =>
            setCurrentItem({ ...currentItem, name: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={currentItem.price}
          onChange={(e) =>
            setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={currentItem.category}
          onChange={(e) =>
            setCurrentItem({ ...currentItem, category: e.target.value })
          }
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={currentItem.qty}
          onChange={(e) =>
            setCurrentItem({ ...currentItem, qty: parseInt(e.target.value) })
          }
          className="w-full border p-2 rounded"
        />
        <select
          value={currentItem.status}
          onChange={(e) =>
            setCurrentItem({ ...currentItem, status: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000]"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


 return (
  <div className="min-h-screen h-screen overflow-hidden bg-[#F6F3EA] text-gray-800">
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r min-h-screen p-6 fixed top-0 left-0 z-10">
        <div className="flex justify-center mb-6">
  <img
    src="/poslogo.png"
    alt="pos Logo"
    className="h-16 w-auto"
  />
</div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                activeSection === item.id
                  ? "bg-[#F6EBCE] text-black font-semibold"
                  : "hover:bg-[#F6EBCE] text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Panel */}
      <div className="flex-1 ml-64 h-screen relative overflow-hidden bg-[#F6F3EA] px-8 pt-8">
        {/* Profile Button */}
        <div className="absolute top-6 right-8 z-20">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="bg-[#EEE0C9] text-black px-4 py-2 rounded-full hover:bg-[#e6d6ba] transition"
          >
            {adminName}
          </button>

          {showProfileMenu && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 mt-2 w-56 bg-[#FDF7E7] border rounded shadow-lg z-50 p-4 space-y-3 animate-fade-in"
            >
              <button className="w-full text-left hover:bg-[#fff3d6] px-2 py-1 rounded">👤 Profile</button>
              <button className="w-full text-left hover:bg-[#fff3d6] px-2 py-1 rounded">🔔 Notifications</button>
              <button className="w-full text-left hover:bg-[#fff3d6] px-2 py-1 rounded">⚙️ Settings</button>
              <div className="flex items-center justify-between px-2 py-1">
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#660000] mt-2"

              >
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Main Content */}
        <div className="mt-24 h-full pb-4 overflow-y-auto flex flex-col gap-8">
          {renderContent()}
        </div>

        {/* ✅ POPUP MODAL */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-6 w-[90%] max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {isEditMode ? "Edit Item" : "Add Item"}
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={currentItem.price}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={currentItem.category}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, category: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={currentItem.qty}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      qty: parseInt(e.target.value),
                    })
                  }
                  className="w-full border p-2 rounded"
                />
                <select
                  value={currentItem.status}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, status: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000]"

                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ✅ END POPUP MODAL */}
        {showSupplierPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded p-6 w-[90%] max-w-md">
      <h2 className="text-xl font-bold mb-4">
        {isEditSupplierMode ? "Edit Supplier" : "Add Supplier"}
      </h2>
      <div className="space-y-3">
        {["name", "contact", "phone", "email", "address", "products"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={currentSupplier[field]}
            onChange={(e) =>
              setCurrentSupplier({ ...currentSupplier, [field]: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        ))}
        <select
          value={currentSupplier.status}
          onChange={(e) =>
            setCurrentSupplier({ ...currentSupplier, status: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => setShowSupplierPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSupplier}
          className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#660000]"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
{selectedTransaction && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-10 w-[40%] max-w-md shadow-lg relative font-sans text-gray-800">
      {/* Splice Logo */}
      <div className="flex justify-center mb-4">
        <img src="/splice.png" alt="Splice Logo" className="w-24 h-24 object-contain" />
      </div>

      {/* Transaction Info */}
      <div className="text-sm space-y-2">
        <p><strong>Transaction Id:</strong> {selectedTransaction.transactionNo}</p>
        <p><strong>Date & Time:</strong> {selectedTransaction.date}</p>
        <p><strong>Cashier:</strong> {selectedTransaction.userId}</p>
        <p><strong>Status:</strong> {selectedTransaction.status}</p>
        <p className="mb-20"><strong>Mode of Payment:</strong> {selectedTransaction.method}</p>
      </div>

      {/* Items Table */}
      <div className="mt-4 border-t border-b py-2">
        <div className="flex font-semibold mb-1">
          <div className="w-1/2">Items:</div>
          <div className="w-1/4 text-center">Quantity</div>
          <div className="w-1/4 text-right">Price</div>
        </div>
        {(selectedTransaction.itemsList || []).map((item, idx) => (
          <div className="flex text-sm" key={idx}>
            <div className="w-1/2">{item.name}</div>
            <div className="w-1/4 text-center">{item.qty}</div>
            <div className="w-1/4 text-right">{item.price}</div>
          </div>
        ))}
      </div>

      {/* Total */}
     <div className="flex justify-between items-center font-bold mt-5 mb-100 text-sm leading-tight">
  <span className="text-left">Total:</span>
  <span className="text-right">₱{selectedTransaction.total || "0.00"}</span>
</div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={() => window.print()} // Can be customized
          className="bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-500"
        >
          Print
        </button>
        <button
          onClick={() => setSelectedTransaction(null)}
          className="bg-black text-white py-2 rounded font-semibold hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



      </div>
    </div>
  </div>
);

}
