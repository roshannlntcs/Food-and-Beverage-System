import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ToastProvider from "./components/ToastProvider";

// THESE ARE DEFAULT EXPORTS, not named.
import CategoryProvider from "./contexts/CategoryContext";
import InventoryProvider from "./contexts/InventoryContext";
import AuthProvider from "./contexts/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CategoryProvider>
        <ToastProvider>
          <InventoryProvider>
            <App />
          </InventoryProvider>
        </ToastProvider>
      </CategoryProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
