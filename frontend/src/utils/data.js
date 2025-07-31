// frontend/src/utils/data.js

// 1) Tell Webpack to bundle every image in /src/assets
const images = require.context("../assets", false, /\.(png|jpe?g|svg)$/);

// 2) Helper to fetch by filename
function getImage(fileName) {
  try {
    return images(`./${fileName}`);
  } catch {
    console.error("Missing image:", fileName);
    return "";
  }
}

// 2. Menu placeholders (copy these straight from your old POSMain.jsx)
export const placeholders = {
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

  // 3. Shop details for receipts
export const shopDetails = {
    name: "SPLICE ENTERPRISES, INC.",
    address: "123 Placeholder Street, City, PH",
    contact: "0912-345-6789",
  };
 

  export const allItemsFlat = Object.entries(placeholders).flatMap(
    ([category, items]) =>
        items.map(item => ({
          name: item.name,
          price: item.price,
          category,
          quantity: item.quantity ?? 0,
          status: 'Available',
          allergens: item.allergens || '',
          addons: item.addons || [],
          description: item.description || '',
          sizes: item.sizes || [] 
        }))
      );