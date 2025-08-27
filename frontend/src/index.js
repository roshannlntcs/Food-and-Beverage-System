// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ToastProvider from "./components/ToastProvider";
import { CategoryProvider } from "./contexts/CategoryContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CategoryProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </CategoryProvider>
  </React.StrictMode>
);

reportWebVitals();
