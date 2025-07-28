// src/POSMain.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// import your icons...
const importAll = (r) => r.keys().reduce((acc, k) => ({ ...acc, [k.replace('./','')]: r(k) }), {});
const images = importAll(require.context("../../assets", false, /\.(png|jpe?g|svg)$/));

const placeholders = {
  "Main Dish": [
    {
      name:        "Humba",
      description: "Sweet braised pork with pineapple and soy.",
      price:       120,
      image:       "humba.jpeg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 20 }],
      addons:      [{ label: "Extra Sauce", price: 10 }],
      notes:       "",
      allergens:   "Soy, Pork"
    },
    {
      name:        "Kaldereta",
      description: "Rich beef stew in tomato sauce and veggies.",
      price:       130,
      image:       "kaldereta.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 20 }],
      addons:      [{ label: "Cheese", price: 15 }],
      notes:       "",
      allergens:   "Beef, Dairy"
    },
    {
      name:        "Beef Mechado",
      description: "Tender beef chunks simmered in tomato gravy.",
      price:       135,
      image:       "beef-mechado.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 25 }],
      addons:      [{ label: "Extra Carrots", price: 5 }],
      notes:       "",
      allergens:   "Beef"
    },
    {
      name:        "Chicken Adobo",
      description: "Classic chicken marinated in soy and vinegar.",
      price:       115,
      image:       "chicken-adobo.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Double Chicken", price: 40 }],
      addons:      [{ label: "Hard‑Boiled Egg", price: 10 }],
      notes:       "",
      allergens:   "Soy, Egg"
    },
    {
      name:        "Pork Binagoongan",
      description: "Savory pork in fermented shrimp paste sauce.",
      price:       140,
      image:       "pork-binagoongan.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Extra Bagoong", price: 10 }],
      notes:       "",
      allergens:   "Fish"
    },
    {
      name:        "Chicken Curry",
      description: "Creamy curry chicken with potatoes.",
      price:       125,
      image:       "chicken-curry.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Spicy", price: 10 }],
      addons:      [{ label: "Potato", price: 5 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Beef Caldereta",
      description: "Spicy beef stew with bell peppers and olives.",
      price:       138,
      image:       "beef-caldereta.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Extra Meat", price: 30 }],
      addons:      [{ label: "Green Peas", price: 5 }],
      notes:       "",
      allergens:   "Beef"
    },
    {
      name:        "Pork Sisig",
      description: "Crispy chopped pork with chili and onions.",
      price:       150,
      image:       "pork-sisig.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Extra Chili", price: 5 }],
      notes:       "",
      allergens:   "Pork, Onion"
    },
    {
      name:        "Laing",
      description: "Taro leaves cooked in coconut milk and spices.",
      price:       110,
      image:       "laing.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Extra Coconut Milk", price: 10 }],
      notes:       "",
      allergens:   "Coconut"
    },
    {
      name:        "Bicol Express",
      description: "Spicy pork stew in creamy coconut sauce.",
      price:       130,
      image:       "bicol-express.png",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Extra Chili", price: 5 }],
      notes:       "",
      allergens:   "Pork, Coconut"
    }
  ],

  "Appetizers": [
    {
      name:        "Spring Rolls",
      description: "Crispy veggie rolls with sweet dipping sauce.",
      price:       80,
      image:       "spring-rolls.jpg",
      sizes:       [{ label: "6 pcs", price: 0 }],
      addons:      [{ label: "Sweet Sauce", price: 10 }],
      notes:       "",
      allergens:   "Gluten"
    },
    {
      name:        "Chicken Wings",
      description: "Spicy fried wings served with dip.",
      price:       120,
      image:       "chicken-wings.jpg",
      sizes:       [{ label: "6 pcs", price: 0 }],
      addons:      [{ label: "Spicy Dip", price: 10 }],
      notes:       "",
      allergens:   "Chicken"
    },
    {
      name:        "Mozzarella Sticks",
      description: "Fried cheese sticks with marinara sauce.",
      price:       100,
      image:       "mozza-sticks.jpg",
      sizes:       [{ label: "5 pcs", price: 0 }],
      addons:      [{ label: "Marinara", price: 10 }],
      notes:       "",
      allergens:   "Dairy, Gluten"
    },
    {
      name:        "Calamari",
      description: "Crispy squid rings with lemon wedge.",
      price:       150,
      image:       "calamari.jpeg",
      sizes:       [{ label: "200g", price: 0 }],
      addons:      [{ label: "Lemon", price: 5 }],
      notes:       "",
      allergens:   "Shellfish"
    },
    {
      name:        "Potato Wedges",
      description: "Seasoned crispy potato wedges.",
      price:       90,
      image:       "potato-wedges.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Ketchup", price: 5 }],
      notes:       "",
      allergens:   "Potato"
    },
    {
      name:        "Bruschetta",
      description: "Toasted bread topped with tomato & basil.",
      price:       110,
      image:       "bruschetta.jpg",
      sizes:       [{ label: "4 pcs", price: 0 }],
      addons:      [{ label: "Balsamic", price: 10 }],
      notes:       "",
      allergens:   "Gluten"
    },
    {
      name:        "Garlic Bread",
      description: "Buttery garlic toast with melted cheese.",
      price:       70,
      image:       "garlic-bread.jpg",
      sizes:       [{ label: "4 pcs", price: 0 }],
      addons:      [{ label: "Cheese", price: 15 }],
      notes:       "",
      allergens:   "Dairy, Gluten"
    },
    {
      name:        "Nachos",
      description: "Corn chips loaded with melted cheese.",
      price:       130,
      image:       "nachos.jpg",
      sizes:       [{ label: "Single", price: 0 }],
      addons:      [{ label: "Cheese Dip", price: 15 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Stuffed Mushrooms",
      description: "Baked mushrooms with herbed butter.",
      price:       140,
      image:       "stuffed-mushrooms.jpg",
      sizes:       [{ label: "6 pcs", price: 0 }],
      addons:      [{ label: "Herb Butter", price: 10 }],
      notes:       "",
      allergens:   "Mushroom"
    },
    {
      name:        "Onion Rings",
      description: "Golden fried onion rings with ranch.",
      price:       95,
      image:       "onion-rings.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Ranch", price: 10 }],
      notes:       "",
      allergens:   "Gluten"
    }
  ],

  "Side Dish": [
    {
      name:        "Garlic Rice",
      description: "Fragrant rice tossed in garlic oil.",
      price:       40,
      image:       "garlic-rice.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
      addons:      [{ label: "Cheese", price: 15 }],
      notes:       "",
      allergens:   "Garlic, Dairy"
    },
    {
      name:        "Plain Rice",
      description: "Steamed white rice, perfect with any dish.",
      price:       30,
      image:       "plain-rice.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
      addons:      [],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Fried Egg",
      description: "Sunny side up or double yolk option.",
      price:       20,
      image:       "fried-egg.jpg",
      sizes:       [{ label: "Single", price: 0 }, { label: "Double", price: 15 }],
      addons:      [],
      notes:       "",
      allergens:   "Egg"
    },
    {
      name:        "Steamed Vegetables",
      description: "Mixed veggies lightly seasoned.",
      price:       50,
      image:       "steamed-vegetables.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Garlic Sauce", price: 10 }],
      notes:       "",
      allergens:   "Garlic"
    },
    {
      name:        "French Fries",
      description: "Crispy fries with golden crunch.",
      price:       55,
      image:       "french-fries.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 15 }],
      addons:      [{ label: "Ketchup", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Tofu Cubes",
      description: "Fried tofu with sweet chili dip.",
      price:       60,
      image:       "tofu-cubes.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Sweet Chili", price: 10 }],
      notes:       "",
      allergens:   "Soy"
    },
    {
      name:        "Grilled Corn",
      description: "Charcoal‑grilled corn with butter.",
      price:       45,
      image:       "grilled-corn.jpg",
      sizes:       [{ label: "Single", price: 0 }],
      addons:      [{ label: "Butter", price: 5 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Atchara",
      description: "Pickled green papaya side dish.",
      price:       35,
      image:       "atchara.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [],
      notes:       "",
      allergens:   "Papaya"
    },
    {
      name:        "Chicharon",
      description: "Crispy pork rind snack.",
      price:       70,
      image:       "chicharon.jpg",
      sizes:       [{ label: "Small", price: 0 }, { label: "Large", price: 20 }],
      addons:      [],
      notes:       "",
      allergens:   "Pork"
    },
    {
      name:        "Ukoy",
      description: "Shrimp fritters with vinegar dip.",
      price:       65,
      image:       "ukoy.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Vinegar Dip", price: 5 }],
      notes:       "",
      allergens:   "Shrimp, Gluten"
    }
  ],

  "Soup": [
    {
      name:        "Sinigang",
      description: "Tamarind soup with meat & veggies.",
      price:       100,
      image:       "sinigang.jpg",
      sizes:       [{ label: "Small", price: 0 }, { label: "Large", price: 25 }],
      addons:      [{ label: "Extra Tamarind", price: 5 }],
      notes:       "",
      allergens:   "Pork, Tamarind"
    },
    {
      name:        "Bulalo",
      description: "Hearty beef marrow soup.",
      price:       150,
      image:       "bulalo.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Bone Marrow", price: 20 }],
      notes:       "",
      allergens:   "Beef"
    },
    {
      name:        "Tinola",
      description: "Ginger chicken soup with papaya.",
      price:       90,
      image:       "tinola.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Ginger", price: 5 }],
      notes:       "",
      allergens:   "Chicken, Ginger"
    },
    {
      name:        "Molo Soup",
      description: "Pork dumpling soup in clear broth.",
      price:       110,
      image:       "molo-soup.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Siomai", price: 15 }],
      notes:       "",
      allergens:   "Pork, Gluten"
    },
    {
      name:        "Beef Kare-Kare Soup",
      description: "Peanut‑flavored oxtail soup.",
      price:       140,
      image:       "kare-kare.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Bagoong", price: 10 }],
      notes:       "",
      allergens:   "Peanut, Shrimp"
    },
    {
      name:        "Cream of Mushroom",
      description: "Creamy blended mushroom soup.",
      price:       95,
      image:       "cream-mushroom.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Croutons", price: 10 }],
      notes:       "",
      allergens:   "Dairy, Gluten"
    },
    {
      name:        "Corn Soup",
      description: "Sweet corn chowder in creamy base.",
      price:       85,
      image:       "corn-soup.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Extra Corn", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Seafood Chowder",
      description: "Hearty chowder with mixed seafood.",
      price:       160,
      image:       "seafood-chowder.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Thickener", price: 10 }],
      notes:       "",
      allergens:   "Shellfish, Dairy"
    },
    {
      name:        "Black Pepper Soup",
      description: "Peppery broth with a zing.",
      price:       105,
      image:       "pepper-soup.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Extra Pepper", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Pumpkin Soup",
      description: "Smooth pureed pumpkin soup.",
      price:       100,
      image:       "pumpkin-soup.jpg",
      sizes:       [{ label: "Bowl", price: 0 }],
      addons:      [{ label: "Cream", price: 10 }],
      notes:       "",
      allergens:   "Dairy"
    }
  ],

  "Desserts": [
    {
      name:        "Leche Flan",
      description: "Creamy caramel‑topped custard.",
      price:       50,
      image:       "leche-flan.jpg",
      sizes:       [{ label: "Single", price: 0 }],
      addons:      [{ label: "Caramel Sauce", price: 5 }],
      notes:       "",
      allergens:   "Egg, Dairy"
    },
    {
      name:        "Halo-Halo",
      description: "Mixed shaved ice dessert bowl.",
      price:       120,
      image:       "halohalo.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Leche Flan", price: 15 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Bibingka",
      description: "Rice cake topped with salted egg.",
      price:       70,
      image:       "bibingka.jpg",
      sizes:       [{ label: "Small", price: 0 }],
      addons:      [{ label: "Salted Egg", price: 10 }],
      notes:       "",
      allergens:   "Egg, Dairy"
    },
    {
      name:        "Puto",
      description: "Steamed rice cupcakes (3 or 6 pcs).",
      price:       60,
      image:       "puto.jpg",
      sizes:       [{ label: "3 pcs", price: 0 }, { label: "6 pcs", price: 15 }],
      addons:      [{ label: "Cheese", price: 10 }],
      notes:       "",
      allergens:   "Dairy, Gluten"
    },
    {
      name:        "Turon",
      description: "Banana‑spring roll with brown sugar.",
      price:       55,
      image:       "turon.jpg",
      sizes:       [{ label: "2 pcs", price: 0 }, { label: "4 pcs", price: 15 }],
      addons:      [{ label: "Ice Cream", price: 20 }],
      notes:       "",
      allergens:   "Banana"
    },
    {
      name:        "Sapin-Sapin",
      description: "Layered sticky rice colored dessert.",
      price:       65,
      image:       "sapin-sapin.jpg",
      sizes:       [{ label: "Slice", price: 0 }],
      addons:      [],
      notes:       "",
      allergens:   "Coconut"
    },
    {
      name:        "Ube Halaya",
      description: "Purple yam jam served chilled.",
      price:       80,
      image:       "ube-halaya.jpg",
      sizes:       [{ label: "Cup", price: 0 }],
      addons:      [{ label: "Coconut Strings", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Buko Pandan",
      description: "Young coconut with pandan jelly.",
      price:       75,
      image:       "buko-pandan.jpg",
      sizes:       [{ label: "Cup", price: 0 }],
      addons:      [{ label: "Nata de Coco", price: 5 }],
      notes:       "",
      allergens:   "Coconut"
    },
    {
      name:        "Mango Float",
      description: "Layers of graham, mango & cream.",
      price:       110,
      image:       "mango-float.jpg",
      sizes:       [{ label: "Slice", price: 0 }],
      addons:      [{ label: "Whipped Cream", price: 10 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Taho",
      description: "Warm silken tofu with arnibal syrup.",
      price:       45,
      image:       "taho.jpg",
      sizes:       [{ label: "Cup", price: 0 }],
      addons:      [{ label: "Sago", price: 5 }],
      notes:       "",
      allergens:   "Soy"
    }
  ],

  "Drinks": [
    {
      name:        "Iced Tea",
      description: "Chilled black tea with lemon.",
      price:       30,
      image:       "iced-tea.png",
      sizes:       [{ label: "Small", price: 0 }, { label: "Medium", price: 5 }, { label: "Large", price: 10 }],
      addons:      [{ label: "Lemon", price: 5 }],
      notes:       "",
      allergens:   "Caffeine"
    },
    {
      name:        "Salabat",
      description: "Ginger tea for soothing warmth.",
      price:       40,
      image:       "salabat.jpg",
      sizes:       [{ label: "Cup", price: 0 }],
      addons:      [{ label: "Honey", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Calamansi Juice",
      description: "Fresh calamansi citrus drink.",
      price:       35,
      image:       "calamansi-juice.jpg",
      sizes:       [{ label: "Cup", price: 0 }, { label: "Pitcher", price: 50 }],
      addons:      [{ label: "Sugar", price: 5 }],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Buko Juice",
      description: "Refreshing young coconut water.",
      price:       50,
      image:       "buko-juice.jpg",
      sizes:       [{ label: "Bottle", price: 0 }],
      addons:      [{ label: "Ice Cream", price: 15 }],
      notes:       "",
      allergens:   "Coconut"
    },
    {
      name:        "Coffee (Hot)",
      description: "Brewed coffee served steaming hot.",
      price:       45,
      image:       "coffee.jpg",
      sizes:       [{ label: "Regular", price: 0 }, { label: "Large", price: 10 }],
      addons:      [{ label: "Cream", price: 5 }, { label: "Sugar", price: 2 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Milo Dinosaur",
      description: "Iced chocolate malt drink.",
      price:       70,
      image:       "milo-dino.jpg",
      sizes:       [{ label: "Regular", price: 0 }],
      addons:      [{ label: "Condensed Milk", price: 10 }],
      notes:       "",
      allergens:   "Dairy"
    },
    {
      name:        "Coke",
      description: "Chilled cola soda.",
      price:       40,
      image:       "coke.jpg",
      sizes:       [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
      addons:      [],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Sprite",
      description: "Lemon‑lime soda, ice‑cold.",
      price:       40,
      image:       "sprite.jpg",
      sizes:       [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
      addons:      [],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Royal",
      description: "Sweet grape‑flavored soda.",
      price:       40,
      image:       "royal.jpg",
      sizes:       [{ label: "330ml", price: 0 }, { label: "500ml", price: 10 }],
      addons:      [],
      notes:       "",
      allergens:   ""
    },
    {
      name:        "Water",
      description: "Pure filtered bottled water.",
      price:       20,
      image:       "water.png",
      sizes:       [{ label: "Bottle", price: 0 }],
      addons:      [],
      notes:       "",
      allergens:   ""
    }
  ]
};

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

 // Placeholder shop details for receipt
 const shopDetails = {
   name: "SPLICE ENTERPRISES, INC.",
   address: "123 Placeholder Street, City, PH",
   contact: "0912-345-6789",
 };


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
        <div className="flex items-center bg-[#800000] h-20 px-6 shadow border-b border-gray-200">
          <img
            src={images["logo-pos2.png"]}
            alt="POS Logo"
            className="w-16 h-16 rounded object-contain -ml-2"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 mx-6 h-12 px-4 border border-gray-200 rounded shadow"
          />
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-2 bg-[#FFC72C] px-4 py-1 rounded-full shadow hover:scale-105 shadow-md transition-shadow duration-150"
          >
            <img
              src={images["avatar-ph.png"]}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-left leading-tight">
              <div className="font-bold text-sm text-black">{userName}</div>
              <div className="text-xs text-black">Cashier</div>
            </div>
          </button>
        </div>

         {/* MAIN BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* CATEGORY SIDEBAR */}
          <div className="w-24 bg-[#F6F3EA] py-0.5 px-1 space-y-1.5 border-r">
          {[
  { key: "All Menu", icon: "all-menu.png" },
  { key: "Main Dish", icon: "main-dish.png" },
  { key: "Appetizers", icon: "appetizers.png" },
  { key: "Side Dish", icon: "side-dish.png" },
  { key: "Soup", icon: "soup.png" },
  { key: "Desserts", icon: "dessert.png" },
  { key: "Drinks", icon: "drinks.png" }
].map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setSearchTerm("");
                }}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded shadow ${
                  activeCategory === cat.key ? "bg-[#F6EBCE] font-semibold" : "bg-white hover:scale-105 shadow-md transition-shadow duration-150"
                }`}
              >
                <img src={images[cat.icon]} alt={cat.key} className="w-8 h-8 mb-1" />
    <span className="uppercase text-[10px]">{cat.key}</span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TABS */}
            <div className="bg-[#F6F3EA] border-b px-4 mt-2 pb-2">
              <div className="grid gap-x-6" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
              {[
  { key: "Menu", icon: "menu.png" },
  { key: "Orders", icon: "orders.png" },
  { key: "Transactions", icon: "transactions.png" },
  { key: "Items", icon: "items.png" },
  { key: "Discount", icon: "discount.png" }
].map(tab => (
  <button
    key={tab.key}
    onClick={() => {
      setActiveTab(tab.key);
      setSearchTerm("");
    }}
    className={`w-full h-[55px] flex items-center justify-center space-x-2 rounded uppercase shadow ${
      activeTab === tab.key ? "bg-[#F6EBCE] font-bold" : "bg-white hover:scale-105 shadow-md transition-shadow duration-150"
    }`}
  >
<img src={images[tab.icon]} alt={tab.key} className="w-8 h-8" />
    <span>{tab.key}</span>
  </button>
))}
</div>
</div>

            {/* TAB CONTENT */}
            <div className="flex-1 flex overflow-hidden">
              {/* MENU */}
              {activeTab === "Menu" && (
                <div className="flex-1 overflow-y-auto pt-2 px-6 pb-6 scrollbar">
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: "12px" }}
                  >
                    {filteredProducts.map((prod, i) => (
                        <div
                        key={i}
                        onClick={() => openProductModal(prod)}
                        className="bg-white p-4 rounded-lg shadow flex flex-col cursor-pointer hover:scale-105 transition-transform duration-150"
                      >
                          <img
                            src={images[prod.image] || images["react.svg"]}
                            alt={prod.name}
                            className="w-full h-[155px] object-cover rounded mb-2"
                          />
                          <div className="font-semibold text-lg truncate">{prod.name}</div>
                          <div className="text-m">₱{prod.price.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {/* ─── Orders Tab ─── */}
              {activeTab === "Orders" && (
  <div className="flex-1 p-4 flex flex-col h-full">
    <h2 className="text-2xl font-bold mb-3">Order Logs</h2>
    <div className="flex-1 overflow-y-auto">
      <div
        className="grid content-start auto-rows-min"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "12px",
        }}
      >
        {orders.length === 0 && (
          <div className="text-gray-400 text-sm col-span-full">
            No orders yet.
          </div>
        )}
        {orders.map((order) => (
  <button
    key={order.orderID}
    onClick={() => setHistoryContext({ type: "orderDetail", order })}
    className={`bg-white p-3 rounded-lg shadow flex flex-col justify-between hover:shadow-md transition-shadow duration-150 ${
      order.voided ? "bg-gray-100 opacity-60" : ""
    }`}
  >
     <div className="flex items-center space-x-2">
      {/* ICON GOES HERE */}
      <img src={images["order_log.png"]} alt="Order Log" className="w-12 h-12 rounded-sm object-cover flex-shrink-0" />
      <div className="font-semibold text-base truncate">{order.orderID}
      <div className="text-xs text-gray-600">
      Tx: {order.transactionID} {order.voided && "(Voided)"}
    </div>
    <div className="text-xs text-gray-500">{order.date}</div></div>
    </div>
    
  </button>
))}
      </div>
    </div>
  </div>
)}


{/* ─── Order Details Modal ─── */}
{historyContext?.type === "orderDetail" && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-1/4 max-h-[85vh] rounded-xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-[#800000] rounded-t border-b px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg text-white font-bold">{historyContext.order.orderID}  </h2>
        <button
          onClick={() => setHistoryContext(null)}
          className="text-gray-300 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        <div className="text-sm text-gray-600">
          Connected Transaction: {historyContext.order.transactionID}</div>
        <div className="text-xs text-gray-500">{historyContext.order.date}</div>

        {historyContext.order.items.map((item, idx) => (
          <div key={idx} className="p-3 border rounded-lg">
          <div className={`font-semibold ${item.voided ? 'line-through text-gray-500' : ''}`}>
  {item.name} ({item.size.label}) x{item.quantity} {item.voided && "(Voided)"}
</div>
{item.selectedAddons?.length > 0 && (
  <div className="text-sm">
    Add-ons: {item.selectedAddons.map(a => a.label).join(", ")}
  </div>
)}
{item.notes && (
  <div className="text-sm italic">Notes: {item.notes}</div>
)}

          </div>
        ))}
      </div>
    </div>
  </div>
)}

{activeTab === "Transactions" && (
  <div className="flex-1 p-2 flex flex-col h-full min-h-0">
    <h2 className="text-2xl font-bold mb-3">Transactions & Void Logs</h2>
    <div className="flex space-x-2 flex-1 h-full min-h-0">
      {/* ─── Transaction Logs ─── */}
      <div className="w-1/2 bg-white rounded-lg shadow p-2 flex flex-col h-full min-h-0">
        <h3 className="font-semibold mb-1">Transaction Logs</h3>
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {transactions.map(tx => (
            <button
              key={tx.transactionID}
              onClick={() => setHistoryContext({ type: 'detail', tx })}
              className={`w-full text-left p-2 rounded-lg border transition duration-150 hover:shadow-md transition-shadow duration-150${
                tx.voided ? 'bg-gray-100 opacity-60' : ''
              }`}
            >
                  <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src={images["trans_log.png"]} alt="Transaction Log" className="w-8 h-8 rounded-sm object-cover flex-shrink-0" />
        <span className="font-medium">{tx.transactionID}{tx.voided && ' (Voided)'}
        <div className="text-xs text-gray-600">Order ID: {tx.orderID}</div>
</span>
      </div>
      <span>₱{tx.total.toFixed(2)}</span>
    </div>
  </button>
          ))}
        </div>
      </div>

      {/* ─── Void Logs ─── */}
      <div className="w-1/2 bg-white rounded-lg shadow p-2 flex flex-col h-full min-h-0">
        <h3 className="font-semibold mb-1">Void Logs</h3>
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
          {voidLogs.map(vl => (
            <div
              key={vl.voidId}
              className={`p-2 rounded-lg border transition duration-150 hover:shadow-md transition-shadow duration-150${
                vl.fullyVoided ? 'bg-red-50' : ''
              }`}
            >
             <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <img src={images["void_log.png"]} alt="Void Log" className="w-9 h-9 rounded-sm object-cover flex-shrink-0" />
        <span className="font-medium">{vl.voidId}
        <div className="text-xs text-gray-600">TRN ID: {vl.txId}</div>  
    <div className="text-xs">Items: {vl.voidedItems.join(', ')}
    </div>
    </span>
      </div>
      {vl.fullyVoided && <span className="text-xs text-gray-600">(Voided)</span>}
    </div>
    
  </div>
          ))}
          {voidLogs.length === 0 && (
            <div className="text-gray-400">No voids yet.</div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* ─── Detail Popup ─── */}
{historyContext?.type === 'detail' && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-1/3 max-h-[85vh] rounded-xl flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#800000] rounded-t border-b px-4 py-2 flex justify-between items-center">
        <h2 className="text-lg text-white font-bold">{historyContext.tx.transactionID} Details</h2>
        <button
          onClick={() => setHistoryContext(null)}
          className="text-gray-300 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {historyContext.tx.items.map((it, idx) => {
          const base = it.price;
          const sizeUp = it.size.price;
          const selectedAddons = it.selectedAddons || [];
          const addonsTotal = selectedAddons.reduce((a, x) => a + x.price, 0);
          const addonNames = selectedAddons.map(a => a.label).join(", ") || "None";
          const lineTotal = (base + sizeUp + addonsTotal) * it.quantity;

          return (
<div key={idx} className={`p-3 border rounded-lg ${it.voided ? 'bg-gray-100' : ''}`}>
  {/* Item Name + Price */}
  <div className={`flex justify-between ${it.voided ? 'line-through text-gray-500' : ''}`}>
    <span className="font-semibold">{it.name} {it.voided && "(Voided)"}</span>
    <span className="text-sm">₱{base.toFixed(2)}</span>
  </div>

  {/* Size */}
  <div className="text-sm flex justify-between">
    <span>Size: {it.size.label}</span>
    <span>₱{sizeUp.toFixed(2)}</span>
  </div>

  {/* Add-ons */}
  {addonsTotal > 0 && (
    <div className="text-sm flex justify-between">
      <span>Add‑ons: {addonNames}</span>
      <span>₱{addonsTotal.toFixed(2)}</span>
    </div>
  )}

  {/* Quantity */}
  <div className="text-sm flex justify-between">
    <span>Quantity</span>
    <span>{it.quantity}</span>
  </div>

  {/* Notes */}
  {it.notes && (
    <div className="text-sm italic">Notes: {it.notes}</div>
  )}

  {/* Line Total */}
  <div className="mt-1 text-sm font-semibold flex justify-between">
    <span>Line Total:</span>
    <span>₱{lineTotal.toFixed(2)}</span>
  </div>
</div>

          );
        })}

        {/* Totals */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span><span>₱{historyContext.tx.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12%):</span><span>₱{historyContext.tx.tax.toFixed(2)}</span>
          </div>
          {historyContext.tx.discountPct > 0 && (
  <div className="flex justify-between">
    <span>
      Discount (
      {historyContext.tx.discountPct}% 
      {historyContext.tx.discountType ? ` ${historyContext.tx.discountType.toUpperCase()}` : ""} 
      {historyContext.tx.couponCode ? ` + ${historyContext.tx.couponCode.toUpperCase()}` : ""}
      ):
    </span>
    <span>-₱{historyContext.tx.discountAmt.toFixed(2)}</span>
  </div>
)}
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total:</span><span>₱{historyContext.tx.total.toFixed(2)}</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <strong>Payment Method:</strong> {historyContext.tx.method || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
          <strong>Date of Transaction: </strong>{historyContext.tx.date}</div>
        </div>
      </div>
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
  className="bg-white p-2 rounded-lg shadow flex flex-col justify-between hover:scale-105 transition-transform duration-150 cursor-pointer"
>
              <img
              src={images[item.image] || images["react.svg"]}
              alt={item.name}
              className="w-full h-[155px] object-cover rounded mb-2"/>
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

{/* ─── Order Details Pane ─── */}
<div className="w-80 bg-[#F6F3EA] border-l border-gray-200 p-6 flex flex-col overflow-hidden shadow">
  <div className="flex-1 flex flex-col h-full">
    {/* Title + History & Void Launcher */}
    <div className="mb-4 flex justify-between items-center">
      <h3 className="text-xl font-bold">Order Details</h3>
      <button
        onClick={() => transactions.length && setShowHistoryModal(true)}
        disabled={!transactions.length}
        className={`p-1 rounded ${transactions.length ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
      >
        <img src={images["void-trans.png"]} alt="History & Void" className="w-5 h-5" />
      </button>
    </div>

    {/* Cart Items */}
<div className="flex-1 overflow-y-auto mb-4 space-y-2">
  {cart.length === 0 ? (
    <div className="text-gray-400 text-sm">No items added.</div>
  ) : (
    cart.map((item, i) => (
      <div
        key={i}
        className="relative group"                    // ← make it a hover group
      >
        {/* ── The sliding content ── */}
        <div
          className="
            bg-white rounded p-2
            transform transition-transform duration-200
            group-hover:-translate-x-8             // ← slide left 2rem on hover
          "
          onClick={() => openEditModal(item, i)}
        >
          <div className="flex justify-between items-start">
            {/* Left: image + details */}
            <div className="flex space-x-1.5 flex-1 min-w-0">
              <img
                src={images[item.image] || images["react.svg"]}
                alt={item.name}
                className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-gray-700 truncate">
                  Size: {item.size.label}
                </div>
                <div className="text-[10px] text-gray-700">
                  {item.quantity} x ₱{(item.totalPrice / item.quantity).toFixed(2)}
                </div>
                {item.addons.length > 0 && (
                  <div className="text-[10px] text-gray-700 truncate">
                    Add‑ons: {item.addons.map(a => a.label).join(", ")}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[10px] italic text-gray-600 truncate">
                    "{item.notes}"
                  </div>
                )}
              </div>
            </div>
            {/* Right: line total */}
            <div className="flex flex-col items-end justify-between h-full ml-2">
              <div className="text-xs font-semibold whitespace-nowrap">
                ₱{item.totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reveal‑on‑hover Trash button ── */}
        <button
          onClick={() => removeCartItem(i)}
          className="
            absolute inset-y-0 right-0 flex items-center justify-center
            w-8 bg-red-100 rounded-r
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          "
          title="Remove item"
        >
          <img src={images["remove_item.png"]} alt="Remove" className="w-5 h-5 rounded-sm object-cover flex-shrink-0"/>
        </button>
      </div>
    ))
  )}
</div>

    {/* Totals */}
    <div className="bg-white p-3 rounded-lg mb-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₱{subtotal.toFixed(2)}</span>
      </div>
      {discountPct > 0 && (
        <div className="flex justify-between">
          <span>
            Discount ({discountPct}%)</span>
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

    {/* Payment Method Buttons */}
    <div className="space-y-3">
      <div className="flex justify-around">
        {[
          { key: "Cash", icon: "cash.png" },
          { key: "Card", icon: "card.png" },
          { key: "QRS", icon: "qrs.png" }
        ].map(method => (
          <button
            key={method.key}
            onClick={() => setPaymentMethod(prev => prev === method.key ? "" : method.key)}
            className={`bg-white h-16 w-16 rounded-lg flex flex-col items-center justify-center space-y-1 ${
              paymentMethod === method.key ? "bg-yellow-100 scale-105" : "hover:scale-105 shadow-md transition-shadow"
            }`}
          >
            <img src={images[method.icon]} alt={method.key} className="w-6 h-6" />
            <span className="text-[10px]">{method.key}</span>
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

{/* ─── History & Void Modal (z‑50) ─── */}
{showHistoryModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-[32rem] max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#800000] px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl text-white font-bold">Transaction History</h2>
        <button
          onClick={() => setShowHistoryModal(false)}
          className="text-gray hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {transactions.map(tx => (
          !tx.isVoidLog && (
            <div
              key={tx.id}
              className={`p-4 rounded-lg border ${
                tx.voided
                  ? 'bg-gray-100 opacity-60'
                  : 'hover:shadow-md transition-shadow duration-150'
              }`}
            >
              {/* Transaction header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold">
                    {tx.voided ? `${tx.id} (Voided)` : tx.id}
                  </div>
                  <div className="text-sm text-gray-600">
                    {tx.date} • {tx.method}
                  </div>
                </div>
                {!tx.voided && (
                  <button
                    onClick={() => {
                      setVoidContext({ type: 'transaction', tx });
                      setShowVoidPassword(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <img src={images["void-trans.png"]} alt="Void Tx" className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Line items */}
              <div className="space-y-1">
                {tx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className={item.voided ? 'line-through text-gray-500' : ''}>
                      {item.name} x{item.quantity} @ ₱{(item.totalPrice/item.quantity).toFixed(2)}
                    </div>
                    {!item.voided && !tx.voided && (
                      <button
                        onClick={() => {
                          setVoidContext({ type: 'item', tx, index: idx });
                          setShowVoidPassword(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <img src={images["void-item.png"]} alt="Void Item" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 text-right text-sm font-medium">
                Total: ₱{tx.total.toFixed(2)}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Sticky footer */}
      <div className="px-6 py-3 border-t bg-white flex justify-end">
        <button
          onClick={() => setShowHistoryModal(false)}
          className="px-4 py-2 rounded-lg border hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* ─── Receipt Modal ─── */}
{/* ─── Receipt Modal (Clean Layout Matching Request) ─── */}
{showReceiptModal && transactions.length > 0 && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 print:bg-transparent"
  >
    <div className="printable-receipt bg-white w-80 max-h-[90vh] rounded-xl flex flex-col p-4 shadow print:shadow-none print:w-full print:max-h-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold">{shopDetails.name}</h2>
        <p className="text-xs">{shopDetails.address}</p>
        <p className="text-xs">{shopDetails.contact}</p>
      </div>

      {/* Transaction Info */}
      <div className="text-xs mb-2">
        <div>Transaction ID: {transactions[0].transactionID}</div>
        <div>Date: {transactions[0].date}</div>
        <div>Cashier: {transactions[0].cashier}</div>
        <div>Payment Method: {transactions[0].method}</div>
      </div>

      {/* Items List */}
      <div className="border-t border-b py-2 mb-2 space-y-2 text-xs">
        {transactions[0].items.map((item, idx) => {
          const base = item.price;
          const sizeUp = item.size.price;
          const selectedAddons = item.selectedAddons || [];
          const addonsTotal = selectedAddons.reduce((a, x) => a + x.price, 0);
          const addonNames = selectedAddons.map(a => a.label).join(", ") || "";
          const lineTotal = (base + sizeUp) * item.quantity;

          return (
            <div key={idx} className="space-y-0.5">
              {/* Main line */}
              <div className="flex justify-between">
                <span>
                  {item.name} ({item.size.label}) x{item.quantity}
                </span>
                <span>₱{lineTotal.toFixed(2)}</span>
              </div>
              {/* Add-ons line */}
              {selectedAddons.length > 0 && (
                <div className="flex justify-between pl-2">
                  <span>Add-ons: {addonNames}</span>
                  <span>₱{addonsTotal.toFixed(2)}</span>
                </div>
              )}
              {/* Notes line */}
              {item.notes && (
                <div className="pl-2 italic">Notes: {item.notes}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="text-xs space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₱{transactions[0].subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (12%):</span>
          <span>₱{transactions[0].tax.toFixed(2)}</span>
        </div>
        {transactions[0].discountPct > 0 && (
          <div className="flex justify-between">
            <span>
              Discount ({transactions[0].discountPct}% {transactions[0].discountType ? transactions[0].discountType : ""})
            </span>
            <span>-₱{transactions[0].discountAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t my-1"></div>
        <div className="flex justify-between font-bold text-sm">
          <span>Total:</span>
          <span>₱{transactions[0].total.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-around mt-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-12 py-1 rounded-lg text-sm hover:bg-green-700"
        >
          Print
        </button>
        <button
          onClick={() => setShowReceiptModal(false)}
          className="bg-gray-300 text-black px-12 py-1 rounded-lg text-sm hover:bg-gray-400"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}


      {/* ─── Void Password Modal (as before) ─── */}
      {showVoidPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-xl font-bold mb-4 text-red-800">Manager Password</h2>
            <input
              type="password"
              value={voidPasswordInput}
              onChange={e => setVoidPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-around">
              <button onClick={confirmVoid} className="bg-red-800 text-white px-6 py-2 rounded-lg">
                Confirm
              </button>
              <button onClick={() => setShowVoidPassword(false)} className="bg-gray-200 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITEM MODAL */}
{/* ITEM MODAL */}
{showModal && modalProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
    <div className="bg-white rounded-2xl shadow-xl w-[576px]">
      {/* — HEADER — */}
      <div className="bg-gray-100 rounded-t-2xl p-6 flex">
        {/* Product Image */}
        <img
          src={images[modalProduct.image]}
          alt={modalProduct.name}
          className="w-20 h-20 object-cover rounded-lg mr-4"
        />
        {/* Title / Description */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{modalProduct.name}</h2>
          <p className="text-sm text-gray-600 truncate">{modalProduct.description}</p>
          <p className="text-xs text-gray-500 mt-1">Allergen: {modalProduct.allergens || "N/A"}</p>
        </div>
        {/* Price */}
        <div className="text-right">
          <span className="text-xl font-bold">₱{modalProduct.price.toFixed(2)}</span>
        </div>
      </div>

      {/* — BODY — */}
      <div className="p-6 space-y-6">
        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Quantity</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setModalProduct((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }));
                setModalEdited(true);
              }}
              className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-xl text-white"
            >
              −
            </button>
            <span className="text-lg">{modalProduct.quantity}</span>
            <button
              onClick={() => {
                setModalProduct((p) => ({ ...p, quantity: p.quantity + 1 }));
                setModalEdited(true);
              }}
              className="w-8 h-8 bg-[#800000] rounded-full flex items-center justify-center text-xl text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Size */}
        <div>
          <span className="font-medium block mb-2">Size</span>
          <div className="flex space-x-2">
            {modalProduct.sizes.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setModalProduct((p) => ({ ...p, size: s }));
                  setModalEdited(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  modalProduct.size.label === s.label
                    ? "bg-gray-200 border-gray-400 font-semibold"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {s.label} {s.price > 0 && `+₱${s.price}`}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        {modalProduct.addons.length > 0 && (
          <div>
            <span className="font-medium block mb-2">Add‑ons</span>
            <div className="flex flex-wrap gap-2">
              {modalProduct.addons.map((a) => (
                <button
                  key={a.label}
                  onClick={() => {
                    setModalProduct((p) => {
                      const isSelected = p.selectedAddons.includes(a);
                      const updatedAddons = isSelected
                        ? p.selectedAddons.filter((x) => x !== a)
                        : [...p.selectedAddons, a];
                      return { ...p, selectedAddons: updatedAddons };
                    });
                    setModalEdited(true);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    modalProduct.selectedAddons.includes(a)
                      ? "bg-gray-200 border-gray-400 font-semibold"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {a.label} {a.price > 0 && `+₱${a.price}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <span className="font-medium block mb-2">Special instructions</span>
          <textarea
            value={modalProduct.notes}
            onChange={(e) => {
              setModalProduct((p) => ({ ...p, notes: e.target.value }));
              setModalEdited(true);
            }}
            placeholder="e.g No onions"
            className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring"
            rows={3}
          />
        </div>
      </div>

      {/* — FOOTER — */}
      <div className="bg-gray-50 rounded-b-2xl p-4">
        {/* Total */}
        <div className="flex justify-between">
          <span className="text-lg font-semibold px-2">Total</span>
          <span className="text-xl font-bold px-2">₱{(
            (modalProduct.price + modalProduct.size.price) * modalProduct.quantity +
            modalProduct.selectedAddons.reduce((s, a) => s + a.price, 0) * modalProduct.quantity
          ).toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-3">
          {editingCartIndex !== null ? (
            <>
              <button
                onClick={() => {
                  removeCartItem(editingCartIndex);
                  setShowModal(false);
                  setEditingCartIndex(null);
                  setModalEdited(false);
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Remove
              </button>
              <button
                onClick={modalEdited ? applyCartItemChanges : () => {
                  setShowModal(false);
                  setEditingCartIndex(null);
                  setModalEdited(false);
                }}
                className="flex-1 py-2 bg-[#800000] text-white rounded-lg font-semibold hover:font-bold"
              >
                {modalEdited ? "Apply Changes" : "Done"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-[#F6EBCE]"
              >
                Cancel
              </button>
              <button
                onClick={addToCart}
                className="flex-1 py-2 bg-[#800000] text-white rounded-lg font-semibold hover:font-bold"
              >
                Add to Order
              </button>
            </>
          )}
        </div>
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
          <input
            type="checkbox"
            name="disc"
            checked={discountType === "senior"}
            onChange={() =>
              setDiscountType(prev => prev === "senior" ? "" : "senior")
            }
            className="mr-2"
          />
          Senior Citizen (20%)
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="disc"
            checked={discountType === "pwd"}
            onChange={() =>
              setDiscountType(prev => prev === "pwd" ? "" : "pwd")
            }
            className="mr-2"
          />
          PWD (20%)
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="disc"
            checked={discountType === "student"}
            onChange={() =>
              setDiscountType(prev => prev === "student" ? "" : "student")
            }
            className="mr-2"
          />
          Student (5%)
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-sm mb-1">Coupon Code</label>
        <input
          type="text"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          placeholder="SAVE10 / HALFOFF / FIVEOFF"
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setDiscountType("");
            setCouponCode("");
            setDiscountPct(0);
            setShowDiscountModal(false);
          }}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            let pct = 0;
          
            // Apply discount type percentage
            if (discountType === "senior" || discountType === "pwd") {
              pct += 20;
            } else if (discountType === "student") {
              pct += 5;
            }
          
            // Apply coupon code stacking
            const code = couponCode.trim().toUpperCase();
            if (code === "SAVE10") pct += 10;
            if (code === "HALFOFF") pct += 50;
            if (code === "FIVEOFF") pct += 5;
          
            setDiscountPct(pct);
            setShowDiscountModal(false);
          }}
          className="px-4 py-2 rounded bg-red-800 text-white"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
)}

{/* SUCCESS MODAL */}
{/* ─── Order Success Modal ─── */}
{showOrderSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-80 rounded-xl p-6 flex flex-col items-center space-y-4 shadow-xl">
      <h2 className="text-lg font-bold text-green-700">Order Successful!</h2>
      <p className="text-sm text-center">Your order has been successfully processed.</p>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setShowOrderSuccess(false);
          }}
          className="bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
        >
          Done
        </button>
        <button
          onClick={() => {
            setShowReceiptModal(true);
            setShowOrderSuccess(false);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          Print Receipt
        </button>
      </div>
    </div>
  </div>
  
)}



     {/* Profile Modal */}
     {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <img
              src={images["avatar-ph.png"]}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
            <h2 className="text-xl font-bold mb-2">User Profile</h2>
            <p><strong>Name:</strong> {userName}</p>
            <p className="mb-4"><strong>School ID:</strong> {schoolId}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowProfileModal(false)}
                className="bg-gray-200 px-4 py-2 rounded font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("userName");
                  localStorage.removeItem("schoolId");
                  navigate("/roles");
                }}
                className="bg-red-800 text-white px-4 py-2 rounded font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
