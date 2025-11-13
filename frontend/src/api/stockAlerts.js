import { api } from "./client";

export const fetchStockAlertState = () =>
  api("/stock-alerts/state", "GET");

export const updateStockAlertState = (signature) =>
  api("/stock-alerts/state", "POST", { signature });
