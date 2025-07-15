// src/POSMain.jsx
import React, { useState, useEffect } from "react";
import logoPos from '../../assets/logo-pos2.png';
export default function POSMain() {
  const categories = [
    { key: "All Menu",    icon: "📋" },
    { key: "Main Dish",   icon: "🍛" },
    { key: "Appetizers",  icon: "🍢" },
    { key: "Side Dish",   icon: "🍟" },
    { key: "Soup",        icon: "🥣" },
    { key: "Desserts",    icon: "🍮" },
    { key: "Drinks",      icon: "☕️" }
  ];

  const tabs = [
    { key: "Menu",         icon: "📖" },
    { key: "Orders",       icon: "📝" },
    { key: "Transactions", icon: "💳" },
    { key: "Items",        icon: "📦" },
    { key: "Discount",     icon: "🏷️" }
  ];

  const basePassword = "123456";

  const placeholders = {
    "Main Dish": [
      {
        name: "Humba",
        price: 120,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 20 }],
        addons: [{ label: "Extra Sauce", price: 10 }],
        allergens: "Soy, Pork"
      },
      {
        name: "Kaldereta",
        price: 130,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 20 }],
        addons: [{ label: "Cheese", price: 15 }],
        allergens: "Beef, Dairy"
      },
      {
        name: "Beef Mechado",
        price: 135,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 25 }],
        addons: [{ label: "Extra Carrots", price: 5 }],
        allergens: "Beef"
      },
      {
        name: "Chicken Adobo",
        price: 115,
        sizes: [{ label: "Regular", price: 0 }, { label: "Double Chicken", price: 40 }],
        addons: [{ label: "Hard-Boiled Egg", price: 10 }],
        allergens: "Soy, Egg"
      },
      {
        name: "Pork Binagoongan",
        price: 140,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Extra Bagoong", price: 10 }],
        allergens: "Fish"
      },
      {
        name: "Chicken Curry",
        price: 125,
        sizes: [{ label: "Regular", price: 0 }, { label: "Spicy", price: 10 }],
        addons: [{ label: "Potato", price: 5 }],
        allergens: "Dairy"
      },
      {
        name: "Beef Caldereta",
        price: 138,
        sizes: [{ label: "Regular", price: 0 }, { label: "Extra Meat", price: 30 }],
        addons: [{ label: "Green Peas", price: 5 }],
        allergens: "Beef"
      },
      {
        name: "Pork Sisig",
        price: 150,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Extra Chili", price: 5 }],
        allergens: "Pork, Onion"
      },
      {
        name: "Laing",
        price: 110,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Extra Coconut Milk", price: 10 }],
        allergens: "Coconut"
      },
      {
        name: "Bicol Express",
        price: 130,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Extra Chili", price: 5 }],
        allergens: "Pork, Coconut"
      }
    ],

    "Appetizers": [
      { name: "Spring Rolls",       price: 80,  sizes: [{label:"6 pcs", price:0}], addons: [{label:"Sweet Sauce", price:10}], allergens:"Gluten", },
      { name: "Chicken Wings",      price: 120, sizes: [{label:"6 pcs", price:0}], addons: [{label:"Spicy Dip", price:10}], allergens:"Chicken", },
      { name: "Mozzarella Sticks",  price: 100, sizes: [{label:"5 pcs", price:0}], addons: [{label:"Marinara", price:10}], allergens:"Dairy, Gluten", },
      { name: "Calamari",           price: 150, sizes: [{label:"200g", price:0}], addons: [{label:"Lemon", price:5}], allergens:"Shellfish", },
      { name: "Potato Wedges",      price: 90,  sizes: [{label:"Regular", price:0}],addons: [{label:"Ketchup", price:5}], allergens:"Potato", },
      { name: "Bruschetta",          price: 110, sizes: [{label:"4 pcs", price:0}], addons: [{label:"Balsamic", price:10}], allergens:"Gluten", },
      { name: "Garlic Bread",        price: 70,  sizes: [{label:"4 pcs", price:0}], addons: [{label:"Cheese", price:15}], allergens:"Dairy, Gluten", },
      { name: "Nachos",             price: 130, sizes: [{label:"Single", price:0}], addons: [{label:"Cheese Dip", price:15}], allergens:"Dairy", },
      { name: "Stuffed Mushrooms",   price: 140, sizes: [{label:"6 pcs", price:0}], addons: [{label:"Herb Butter", price:10}], allergens:"Mushroom", },
      { name: "Onion Rings",         price: 95,  sizes: [{label:"Regular", price:0}], addons: [{label:"Ranch", price:10}], allergens:"Gluten", }
    ],
  
    "Side Dish": [
      {
        name: "Garlic Rice",
        price: 40,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
        addons: [{ label: "Cheese", price: 15 }],
        allergens: "Garlic, Dairy"
      },
      {
        name: "Plain Rice",
        price: 30,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
        addons: [],
        allergens: ""
      },
      {
        name: "Fried Egg",
        price: 20,
        sizes: [{ label: "Single", price: 0 }, { label: "Double", price: 15 }],
        addons: [],
        allergens: "Egg"
      },
      {
        name: "Steamed Vegetables",
        price: 50,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Garlic Sauce", price: 10 }],
        allergens: "Garlic"
      },
      {
        name: "French Fries",
        price: 55,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 15 }],
        addons: [{ label: "Ketchup", price: 5 }],
        allergens: ""
      },
      {
        name: "Tofu Cubes",
        price: 60,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Sweet Chili", price: 10 }],
        allergens: "Soy"
      },
      {
        name: "Grilled Corn",
        price: 45,
        sizes: [{ label: "Single", price: 0 }],
        addons: [{ label: "Butter", price: 5 }],
        allergens: "Dairy"
      },
      {
        name: "Atchara",
        price: 35,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [],
        allergens: "Papaya"
      },
      {
        name: "Chicharon",
        price: 70,
        sizes: [{ label: "Small", price: 0 }, { label: "Large", price: 20 }],
        addons: [],
        allergens: "Pork"
      },
      {
        name: "Ukoy",
        price: 65,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Vinegar Dip", price: 5 }],
        allergens: "Shrimp, Gluten"
      }
    ],
  
    "Soup": [
      {
        name: "Sinigang",
        price: 100,
        sizes: [{ label: "Small", price: 0 }, { label: "Large", price: 25 }],
        addons: [{ label: "Extra Tamarind", price: 5 }],
        allergens: "Pork, Tamarind"
      },
      {
        name: "Bulalo",
        price: 150,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Bone Marrow", price: 20 }],
        allergens: "Beef"
      },
      {
        name: "Tinola",
        price: 90,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Ginger", price: 5 }],
        allergens: "Chicken, Ginger"
      },
      {
        name: "Molo Soup",
        price: 110,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Siomai", price: 15 }],
        allergens: "Pork, Gluten"
      },
      {
        name: "Beef Kare-Kare Soup",
        price: 140,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Bagoong", price: 10 }],
        allergens: "Peanut, Shrimp"
      },
      {
        name: "Cream of Mushroom",
        price: 95,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Croutons", price: 10 }],
        allergens: "Dairy, Gluten"
      },
      {
        name: "Corn Soup",
        price: 85,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Extra Corn", price: 5 }],
        allergens: ""
      },
      {
        name: "Seafood Chowder",
        price: 160,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Thickener", price: 10}],
        allergens: "Shellfish, Dairy"
      },
      {
        name: "Black Pepper Soup",
        price: 105,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Extra Pepper", price: 5}],
        allergens: ""
      },
      {
        name: "Pumpkin Soup",
        price: 100,
        sizes: [{ label: "Bowl", price: 0 }],
        addons: [{ label: "Cream", price: 10}],
        allergens: "Dairy"
      }
    ],
  
    "Desserts": [
      {
        name: "Leche Flan",
        price: 50,
        sizes: [{ label: "Single", price: 0 }],
        addons: [{ label: "Caramel Sauce", price: 5 }],
        allergens: "Egg, Dairy"
      },
      {
        name: "Halo-Halo",
        price: 120,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Leche Flan", price: 15 }],
        allergens: "Dairy"
      },
      {
        name: "Bibingka",
        price: 70,
        sizes: [{ label: "Small", price: 0 }],
        addons: [{ label: "Salted Egg", price: 10 }],
        allergens: "Egg, Dairy"
      },
      {
        name: "Puto",
        price: 60,
        sizes: [{ label: "3 pcs", price: 0 }, { label: "6 pcs", price: 15}],
        addons: [{ label: "Cheese", price: 10 }],
        allergens: "Dairy, Gluten"
      },
      {
        name: "Turon",
        price: 55,
        sizes: [{ label: "2 pcs", price: 0 }, { label: "4 pcs", price: 15 }],
        addons: [{ label: "Ice Cream", price: 20 }],
        allergens: "Banana"
      },
      {
        name: "Sapin-Sapin",
        price: 65,
        sizes: [{ label: "Slice", price: 0 }],
        addons: [],
        allergens: "Coconut"
      },
      {
        name: "Ube Halaya",
        price: 80,
        sizes: [{ label: "Cup", price: 0 }],
        addons: [{ label: "Coconut Strings", price: 5 }],
        allergens: ""
      },
      {
        name: "Buko Pandan",
        price: 75,
        sizes: [{ label: "Cup", price: 0 }],
        addons: [{ label: "Nata de Coco", price: 5 }],
        allergens: "Coconut"
      },
      {
        name: "Mango Float",
        price: 110,
        sizes: [{ label: "Slice", price: 0 }],
        addons: [{ label: "Whipped Cream", price: 10 }],
        allergens: "Dairy"
      },
      {
        name: "Taho",
        price: 45,
        sizes: [{ label: "Cup", price: 0 }],
        addons: [{ label: "Sago", price: 5 }],
        allergens: "Soy"
      }
    ],
  
    "Drinks": [
      {
        name: "Iced Tea",
        price: 30,
        sizes: [{ label: "Small", price: 0 }, { label: "Medium", price: 5 }, { label: "Large", price: 10 }],
        addons: [{ label: "Lemon", price: 5 }],
        allergens: "Caffeine"
      },
      {
        name: "Salabat",
        price: 40,
        sizes: [{ label: "Cup", price: 0 }],
        addons: [{ label: "Honey", price: 5 }],
        allergens: ""
      },
      {
        name: "Calamansi Juice",
        price: 35,
        sizes: [{ label: "Cup", price: 0 }, { label: "Pitcher", price: 50 }],
        addons: [{ label: "Sugar", price: 5 }],
        allergens: ""
      },
      {
        name: "Buko Juice",
        price: 50,
        sizes: [{ label: " Cup", price: 0 }],
        addons: [{ label: "Ice Cream", price: 15 }],
        allergens: "Coconut"
      },
      {
        name: "Coffee (Hot)",
        price: 45,
        sizes: [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
        addons: [{ label: "Cream", price: 5 }, { label: "Sugar", price: 2 }],
        allergens: "Dairy"
      },
      {
        name: "Milo Dinosaur",
        price: 70,
        sizes: [{ label: "Regular", price: 0 }],
        addons: [{ label: "Sweetened Condensed Milk", price: 10 }],
        allergens: "Dairy"
      },
      {
        name: "Coke",
        price: 40,
        sizes: [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
        addons: [],
        allergens: ""
      },
      {
        name: "Sprite",
        price: 40,
        sizes: [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
        addons: [],
        allergens: ""
      },
      {
        name: "Royal",
        price: 40,
        sizes: [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
        addons: [],
        allergens: ""
      },
      {
        name: "Water",
        price: 20,
        sizes: [{ label: "Bottle", price: 0 }],
        addons: [],
        allergens: ""
      }
    ]
  };

     // State
  const [activeCategory,   setActiveCategory]   = useState("All Menu");
  const [activeTab,        setActiveTab]        = useState("Menu");
  const [searchTerm,       setSearchTerm]       = useState("");
  const [dateFrom,         setDateFrom]         = useState("");
  const [dateTo,           setDateTo]           = useState("");
  const [products,         setProducts]         = useState([]);
  const [cart,             setCart]             = useState([]);
  const [orders,           setOrders]           = useState([]);
  const [transactions,     setTransactions]     = useState([]);
  const [itemAvailability, setItemAvailability] = useState({});

  // Discount state
  const [showDiscountModal,setShowDiscountModal]= useState(false);
  const [discountType,     setDiscountType]     = useState(""); // "senior","pwd","student"
  const [couponCode,       setCouponCode]       = useState("");
  const [discountPct,      setDiscountPct]      = useState(0);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Product modal & void
  const [showModal,        setShowModal]        = useState(false);
  const [modalProduct,     setModalProduct]     = useState(null);
  const [showVoidPassword, setShowVoidPassword] = useState(false);
  const [voidPasswordInput,setVoidPasswordInput]= useState("");
  const [voidContext,      setVoidContext]      = useState({ type:null,index:null });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("");

  // Recompute products on category/availability change
  useEffect(() => {
    const list = (activeCategory === "All Menu"
      ? Object.values(placeholders).flat()
      : placeholders[activeCategory]) || [];
      setProducts(list.filter(i => itemAvailability[i.name]));
    }, [activeCategory, itemAvailability]);

  // Totals
  const subtotal    = cart.reduce((sum,i)=>sum + i.totalPrice, 0);
  const discountAmt = +(subtotal * discountPct / 100).toFixed(2);
  const tax         = +(subtotal * 0.12).toFixed(2);
  const total       = +(subtotal + tax - discountAmt).toFixed(2);

  // Handlers
  const openProductModal = item => {
    setModalProduct({ ...item, size: item.sizes[0], selectedAddons: [], quantity: 1, notes: "" });
    setShowModal(true);
  };
  const addToCart = () => {
    const addonsCost = modalProduct.selectedAddons.reduce((s,a)=>s + a.price, 0);
    const sizeCost   = modalProduct.size.price;
    const price      = (modalProduct.price + addonsCost + sizeCost) * modalProduct.quantity;
    setCart(prev => [...prev, { ...modalProduct, addons: modalProduct.selectedAddons, totalPrice: price }]);
    setShowModal(false);
  };

  const processTransaction = () => {
    if (!paymentMethod) return alert("Select payment method");
    if (!cart.length) return alert("Cart empty");
  
    const now = new Date();
    const id = now.getTime();
  
    const order = {
      id: `ORD-${id}`,
      items: cart,
      transactionID: `TX-${id}`,
      date: now.toLocaleDateString(),
      subtotal,
      discountAmt,
      discountPct,
      discountType,
      discountCode: couponCode.trim() || null,
      tax
    };
  
    // ✅ Add to Orders log
    setOrders(prev => [order, ...prev]);
  
    // ✅ Add to Transactions log
    setTransactions(prev => [
      { ...order, type: "Payment", method: paymentMethod, total },
      ...prev
    ]);
  
    // Reset states
    setCart([]);
    setPaymentMethod("");
    setDiscountPct(0);
    setDiscountType("");
    setCouponCode("");
  
    // Show success modal
    setShowSuccessModal(true);
  };
  

  const triggerVoid = (type, idx = null) => {
    setVoidContext({ type, index: idx });
    setShowVoidPassword(true);
  };
  const confirmVoid = () => {
    if (voidPasswordInput !== basePassword) return alert("Wrong password");
    const now = new Date();
    const id = `VOID-${now.getTime()}`;
  
    if (voidContext.type === "item") {
      const removed = cart[voidContext.index];
      setCart(prev => prev.filter((_, i) => i !== voidContext.index));
  
      setTransactions(prev => [
        {
          id,
          type: "Voided Item",
          date: now.toLocaleDateString(),
          items: [removed],
          subtotal: 0,
          discountAmt: 0,
          tax: 0,
          total: 0,
        },
        ...prev,
      ]);
    } else {
      const allItems = [...cart];
      setCart([]);
      setTransactions(prev => [
        {
          id,
          type: "Voided Transaction",
          date: now.toLocaleDateString(),
          items: allItems,
          subtotal: 0,
          discountAmt: 0,
          tax: 0,
          total: 0,
        },
        ...prev,
      ]);
    }
  
    setShowVoidPassword(false);
    setVoidPasswordInput("");
  };
  

  // Open discount modal when Discount tab is clicked
  useEffect(() => {
    if (activeTab === "Discount") setShowDiscountModal(true);
  }, [activeTab]);

  useEffect(() => {
    if (Object.keys(itemAvailability).length === 0) {
      const initialAvailability = {};
      Object.values(placeholders).flat().forEach(item => {
        initialAvailability[item.name] = true; // explicitly mark all as available initially
      });
      setItemAvailability(initialAvailability);
    }
  }, [placeholders]);
  
  return (
    <div className="flex h-screen bg-[#F6F3EA] font-poppins text-black">
      {/* LEFT COLUMN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center bg-[#800000] h-20 px-6 shadow border-b border-gray-200">
          <img
            src={logoPos}
            alt="POS Logo"
            className="w-16 h-16 rounded object-contain -ml-2"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 mx-6 h-12 px-4 border border-gray-200 rounded shadow"
          />
          <button className="flex items-center space-x-1 bg-[#FFC72C] px-4 py-1 rounded-full shadow hover:bg-yellow-100">
          <div className="w-8 h-8 flex items-center justify-center rounded-full text-3xl">
  🧑‍💼
</div>
            <div className="text-left">
              <div className="font-bold text-black">Viole Ragnvindr</div>
              <div className="text-small text-black">Cashier</div>
            </div>
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* CATEGORY SIDEBAR */}
          <div className="w-24 bg-[#F6F3EA] py-0.5 px-1 space-y-1.5 border-r border-transparent">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSearchTerm("");
                }}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded shadow bg-gray-200 hover:bg-white ${
                  activeCategory === cat.key ? "bg-white font-semibold" : ""
                }`}
              >
                <div className="text-lg mb-px">{cat.icon}</div>
                <span className="uppercase text-center leading-tight text-[10px]">{cat.key}</span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS */}
            <div className="bg-[#F6F3EA] border-b border-transparent px-4 mt-2 pb-2">
              <div
                className="grid gap-x-6"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
              >
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSearchTerm("");
                    }}
                    className={`w-full h-[55px] flex items-center justify-center space-x-2 rounded uppercase shadow ${
                      activeTab === tab.key
                        ? "bg-white font-bold"
                        : "bg-gray-200 hover:bg-white"
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.key}</span>
                  </button>
                ))}
              </div>
            </div>


            {/* TAB CONTENT */}
            <div className="flex-1 flex overflow-hidden">
              {/* MENU */}
              {activeTab==="Menu" && (
                <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 scrollbar-stable">
                                    <div className="grid" style={{
                    gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",
                    gap:"12px"
                  }}>
                    {products
                      .filter(p=>p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prod,i)=>(
                        <div key={i}
                          onClick={()=>openProductModal(prod)}
                          className="bg-white p-4 rounded-lg shadow flex flex-col justify-between cursor-pointer">
                          <div className="bg-gray-300 w-full rounded mb-2 h-[155px]"/>
                          <div className="font-semibold text-lg truncate whitespace-nowrap overflow-hidden" title={prod.name}>{prod.name}</div>
                          <div className="text-sm">₱{prod.price.toFixed(2)}</div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab==="Orders" && (
                <div className="flex-1 p-6 flex flex-col">
                  <h2 className="text-2xl font-bold mb-4">Orders Log</h2>
                  <div className="flex space-x-4 mb-4">
                    <div><label className="block text-sm">From</label>
                      <input type="date" value={dateFrom}
                             onChange={e=>setDateFrom(e.target.value)}
                             className="border p-1 rounded"/>
                    </div>
                    <div><label className="block text-sm">To</label>
                      <input type="date" value={dateTo}
                             onChange={e=>setDateTo(e.target.value)}
                             className="border p-1 rounded"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 overflow-y-auto flex-1 content-start auto-rows-min">
                    {orders.filter(o=>{
                      const termMatch = o.id.toLowerCase().includes(searchTerm.toLowerCase())
                                      || o.date.toLowerCase().includes(searchTerm.toLowerCase());
                      const iso = new Date(o.date).toISOString().slice(0,10);
                      const okFrom = !dateFrom || iso>=dateFrom;
                      const okTo   = !dateTo   || iso<=dateTo;
                      return termMatch && okFrom && okTo;
                    }).map(o=>(
                      <div key={o.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="font-semibold mb-2">Order ID: {o.id}</div>
                        <div className="mb-1"><strong>Txn:</strong> {o.transactionID}</div>
                        <div className="mb-1"><strong>Date:</strong> {o.date}</div>
                        <div className="text-sm"><strong>Items:</strong> {o.items.map(i=>i.name).join(", ")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Log */}
{activeTab === "Transactions" && (
  <div className="flex-1 p-6 flex flex-col">
    <h2 className="text-2xl font-bold mb-4">Transactions Log</h2>

    {/* Date filters */}
    <div className="flex space-x-4 mb-4">
      <div>
        <label className="block text-sm">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="border p-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="border p-1 rounded"
        />
      </div>
    </div>

    <div className="grid grid-cols-4 gap-4 overflow-y-auto flex-1 content-start auto-rows-min">
      {transactions
        .filter(tx => {
          // Search by ID or date
          const term = searchTerm.toLowerCase();
          const matchesSearch =
            tx.id.toLowerCase().includes(term) ||
            tx.date.toLowerCase().includes(term);

          // Date‐range filter
          const isoDate = new Date(tx.date).toISOString().slice(0, 10);
          const afterFrom = !dateFrom || isoDate >= dateFrom;
          const beforeTo = !dateTo || isoDate <= dateTo;

          return matchesSearch && afterFrom && beforeTo;
        })
        .map(tx => (
          <div key={tx.id} className="bg-white p-4 rounded-lg shadow">
            <div className="font-semibold mb-2">ID: {tx.id}</div>
            <div className="mb-1"><strong>Type:</strong> {tx.type}</div>
            {tx.method && <div className="mb-1"><strong>Method:</strong> {tx.method}</div>}
            <div className="mb-1"><strong>Date:</strong> {tx.date}</div>

            {/* Financial breakdown */}
            <div className="mb-1"><strong>Subtotal:</strong> ₱{(tx.subtotal ?? 0).toFixed(2)}</div>
            <div className="mb-1"><strong>Discount:</strong> ₱{tx.discountAmt.toFixed(2)}</div>
            <div className="mb-1"><strong>Discount Type:</strong> {tx.discountType || "—"}</div>
            {tx.discountCode && (
              <div className="mb-1"><strong>Code:</strong> {tx.discountCode}</div>
            )}
            <div className="mb-1"><strong>Tax:</strong> ₱{tx.tax.toFixed(2)}</div>

            <div className="text-sm mb-1">
              <strong>Items:</strong> {tx.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
            </div>
            <div><strong>Total:</strong> ₱{tx.total.toFixed(2)}</div>
          </div>
        ))}
    </div>
  </div>
)}

{/* Items Availability */}
{activeTab === "Items" && (
  <div className="flex-1 pt-2 px-6 pb-6 flex flex-col">
    <h2 className="text-2xl font-bold mb-4">Item Availability</h2>
    <div className="flex-1 overflow-y-auto pr-2">
      <div
        className="grid content-start auto-rows-min"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "12px",
        }}
      >
        {Object.entries(placeholders)
          .flatMap(([cat, list]) =>
            activeCategory === "All Menu"
              ? list
              : list.filter(i => cat === activeCategory)
          )
          .filter(i =>
            i.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((item, i) => (
            <div
              key={i}
              className="bg-white p-2 rounded-lg shadow flex flex-col justify-between"
            >
              <div className="bg-gray-300 w-full rounded mb-2 h-[155px]" />
              <div className="font-semibold text-base mb-2 text-center">
                {item.name}
              </div>
              <button
                onClick={() =>
                  setItemAvailability(prev => ({
                    ...prev,
                    [item.name]: !prev[item.name],
                  }))
                }
                className={`py-2 rounded-lg text-sm font-semibold ${
                  itemAvailability[item.name]
                    ? "bg-yellow-300 text-black"
                    : "bg-red-800 text-white"
                }`}
              >
                {itemAvailability[item.name] ? "Available" : "Unavailable"}
              </button>
            </div>
          ))}
      </div>
    </div>
  </div>
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

{/* ORDER DETAILS (always visible) */}
<div className="w-80 bg-[#F6F3EA] border-l border-gray-200 p-6 flex flex-col overflow-hidden shadow">
  <div className="flex-1 flex flex-col h-full">
    {/* 1. Title */}
    <div className="mb-4 flex justify-between items-center">
      <h3 className="text-lg font-bold">Order Details</h3>
      <button
        onClick={() => triggerVoid("transaction")}
        className="text-red-800 text-lg"
      >
        🚩
      </button>
    </div>

    {/* 2. Items (scrollable, reduced font size) */}
    <div className="flex-1 overflow-y-auto mb-4 space-y-2">
      {cart.length === 0 ? (
        <div className="text-black-300 text-sm">No items added.</div>
      ) : (
        cart.map((item, i) => (
          <div key={i} className=" rounded p-1">
            {/* Name + Total Price */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5">
                {/* Small cubic image placeholder */}
                <div className="w-10 h-10 bg-gray-300 rounded-sm flex-shrink-0"></div>
                <div className="text-xs font-medium truncate">
                  {item.name} ({item.size.label})
                </div>
              </div>
              <div className="text-xs font-semibold whitespace-nowrap">
                ₱{item.totalPrice.toFixed(2)}
              </div>
            </div>

            {/* Quantity x Unit Price + Void */}
            <div className="flex justify-between items-center text-[10px] text-gray-700 mt-0.5">
              <div>
                {item.quantity} x ₱
                {(item.totalPrice / item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => triggerVoid("item", i)}
                className="text-red-800 text-xs"
              >
                ⛔
              </button>
            </div>

            {/* Add-ons */}
            {item.addons.length > 0 && (
              <div className="text-[10px] text-gray-700 mt-0.5 truncate">
                Add‑ons: {item.addons.map(a => a.label).join(", ")}
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="text-[10px] italic text-gray-600 mt-0.5 truncate">
                "{item.notes}"
              </div>
            )}
          </div>
        ))
      )}
    </div>

    {/* 3. Subtotal + Discount info */}
    <div className="bg-white p-3 rounded-lg mb-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₱{subtotal.toFixed(2)}</span>
      </div>
      {discountPct > 0 && (
        <div className="flex justify-between">
          <span>
            Discount (
            {[
              discountType === "senior" && "Senior",
              discountType === "pwd" && "PWD",
              discountType === "student" && "Student",
              couponCode && couponCode.toUpperCase()
            ]
              .filter(Boolean)
              .join(" + ")}
            ): {discountPct}%
          </span>
          <span>₱{discountAmt.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Tax (12%)</span>
        <span>₱{tax.toFixed(2)}</span>
      </div>
      <hr className="border-t border-gray-300 my-1" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>₱{total.toFixed(2)}</span>
      </div>
    </div>

    {/* 4. Payment */}
    <div className="space-y-3">
      <div className="flex justify-around">
        {["💵", "💳", "📱"].map(icon => (
          <button
            key={icon}
            onClick={() => setPaymentMethod(icon)}
            className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl ${
              paymentMethod === icon
                ? "bg-yellow-100 scale-105"
                : "bg-white"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
      <button
        onClick={processTransaction}
        className="w-full bg-red-800 text-white py-2 rounded-lg font-semibold text-sm"
      >
        Process Transaction
      </button>
    </div>
  </div>
</div>


      {/* ITEM MODAL */}
      {showModal && modalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[576px] h-[525px] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">{modalProduct.name}</h2>
                <p className="text-sm mb-1">Allergens: {modalProduct.allergens}</p>
                <p className="text-lg font-semibold text-red-800">₱{modalProduct.price}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-3xl font-bold">×</button>
            </div>
            <div className="overflow-y-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 bg-gray-200 rounded-full" onClick={() => setModalProduct(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}>−</button>
                  <span className="font-medium">{modalProduct.quantity}</span>
                  <button className="w-8 h-8 bg-gray-200 rounded-full" onClick={() => setModalProduct(p => ({ ...p, quantity: p.quantity + 1 }))}>+</button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex space-x-2">
                  {modalProduct.sizes.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setModalProduct(p => ({ ...p, size: s }))}  
                      className={`px-3 py-1 rounded border ${
                        modalProduct.size.label === s.label ? "bg-yellow-100 border-red-800 font-semibold" : "bg-white border-gray-200"
                      }`}
                    >
                      {s.label} +₱{s.price}
                    </button>
                  ))}
                </div>
              </div>
              {modalProduct.addons.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Add-ons</h3>
                  <div className="flex flex-wrap gap-2">
                    {modalProduct.addons.map(a => (
                      <button
                        key={a.label}
                        onClick={() => {
                          setModalProduct(p => ({
                            ...p,
                            selectedAddons: p.selectedAddons.includes(a)
                              ? p.selectedAddons.filter(x => x !== a)
                              : [...p.selectedAddons, a]
                          }));
                        }}
                        className={`px-3 py-1 rounded border ${
                          modalProduct.selectedAddons.includes(a) ? "bg-yellow-100 border-red-800 font-semibold" : "bg-white border-gray-200"
                        }`}
                      >
                        {a.label} +₱{a.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <textarea
                  value={modalProduct.notes}
                  onChange={e => setModalProduct(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. No onions"
                  className="w-full border-gray-200 border rounded p-2 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-xl font-bold">
                Total ₱{(((modalProduct.price + modalProduct.size.price) * modalProduct.quantity) + modalProduct.selectedAddons.reduce((s,a)=>s+a.price,0)).toFixed(2)}
              </span>
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
              <button onClick={addToCart} className="flex-1 py-2 bg-red-800 text-white rounded-lg font-semibold">Add to Order</button>
            </div>
          </div>
        </div>
      )}

      {/* VOID PASSWORD MODAL */}
      {showVoidPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-xl font-bold mb-4 text-red-800">Manager Password</h2>
            <input
              type="password"
              value={voidPasswordInput}
              onChange={e => setVoidPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full border-gray-200 border rounded p-2 mb-4"
            />
            <div className="flex justify-around">
              <button onClick={confirmVoid} className="bg-red-800 text-white px-6 py-2 rounded-lg font-semibold">Confirm</button>
              <button onClick={() => setShowVoidPassword(false)} className="bg-gray-200 text-black px-6 py-2 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

     {/* DISCOUNT MODAL */}
     {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Apply Discount</h2>
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input type="radio" name="disc" value="senior"
                       checked={discountType==="senior"}
                       onChange={()=>setDiscountType("senior")}
                       className="mr-2"/>
                Senior Citizen (20%)
              </label>
              <label className="flex items-center">
                <input type="radio" name="disc" value="pwd"
                       checked={discountType==="pwd"}
                       onChange={()=>setDiscountType("pwd")}
                       className="mr-2"/>
                PWD (20%)
              </label>
              <label className="flex items-center">
                <input type="radio" name="disc" value="student"
                       checked={discountType==="student"}
                       onChange={()=>setDiscountType("student")}
                       className="mr-2"/>
                Student (5%)
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Coupon Code</label>
              <input type="text" value={couponCode}
                     onChange={e=>setCouponCode(e.target.value)}
                     placeholder="SAVE10 / HALFOFF / FIVEOFF"
                     className="w-full border p-2 rounded"/>
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={()=>setShowDiscountModal(false)}
                      className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={()=>{
                let pct=0;
                if(discountType==="senior"||discountType==="pwd") pct=20;
                else if(discountType==="student") pct=5;
                const code=couponCode.trim().toUpperCase();
                if(code==="SAVE10") pct+=10;
                if(code==="HALFOFF") pct+=50;
                if(code==="FIVEOFF") pct+=5;
                setDiscountPct(pct);
                setShowDiscountModal(false);
              }}
                className="px-4 py-2 rounded bg-red-800 text-white">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

{/* SUCCESS MODAL */}
{showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">🎉 Order Successful!</h2>
            <p className="mb-6">Your transaction has been recorded.</p>
            <div className="flex justify-center space-x-4 mb-4">
             <button
               onClick={()=>setShowSuccessModal(false)}
               className="px-6 py-2 bg-yellow-100 rounded-lg font-semibold"
             >
               Close
             </button>
             <button
               className="px-6 py-2 bg-gray-200 rounded-lg font-semibold"
             >
               Print Receipt
             </button>
           </div>
          </div>
        </div>
      )}
    </div>
  );
} 