// src/contexts/CategoryContext.jsx
import React, { createContext, useContext, useState } from "react";

// Import the same icons you had in Sidebar
import mainDishIcon from "../assets/main-dish.png";
import appetizersIcon from "../assets/appetizers.png";
import sideDishIcon from "../assets/side-dish.png";
import soupIcon from "../assets/soup.png";
import dessertIcon from "../assets/dessert.png";
import drinksIcon from "../assets/drinks.png";

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([
    { key: "Main Dish", icon: mainDishIcon },
    { key: "Appetizers", icon: appetizersIcon },
    { key: "Side Dish", icon: sideDishIcon },
    { key: "Soup", icon: soupIcon },
    { key: "Desserts", icon: dessertIcon },
    { key: "Drinks", icon: drinksIcon },
  ]);

  const addCategory = (category) => {
    setCategories((prev) => [...prev, category]);
  };

  const removeCategory = (key) => {
    setCategories((prev) => prev.filter((c) => c.key !== key));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
