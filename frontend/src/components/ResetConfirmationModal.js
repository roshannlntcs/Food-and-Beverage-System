// src/components/ResetConfirmationModal.js
import React from "react";

const ResetConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  scopeOptions = [],
  selectedScopes = [],
  onToggleScope,
  stockQty,
  onStockQtyChange,
  onSelectAll,
  warnings = {},
}) => {
  if (!isOpen) return null;

  const hasStock = selectedScopes.includes("stock");
  const warningList = selectedScopes
    .map((scope) => warnings[scope])
    .filter(Boolean);
  const confirmDisabled = selectedScopes.length === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-2xl space-y-5">
        <header className="text-center space-y-1">
          <div className="flex justify-center">
            <div className="bg-red-800 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
              !
            </div>
          </div>
          <h2 className="text-xl font-semibold">Confirm Reset</h2>
          <p className="text-sm text-gray-600">
            Choose which datasets to wipe. Selected scopes will be reset in one
            batch.
          </p>
        </header>

        <div className="space-y-3">
          {scopeOptions.map((option) => {
            const checked = selectedScopes.includes(option.scope);
            return (
              <label
                key={option.scope}
                className={`flex items-start gap-3 border rounded-lg px-3 py-2 cursor-pointer ${
                  checked ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() => onToggleScope?.(option.scope)}
                />
                <div>
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.helper}</div>
                </div>
              </label>
            );
          })}
        </div>

        {hasStock && (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Stock quantity to apply
            </label>
            <input
              type="number"
              min={0}
              max={9999}
              value={stockQty}
              onChange={(event) => onStockQtyChange?.(event.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <p className="text-xs text-gray-500">
              Applies only when “Reset Stock” is selected.
            </p>
          </div>
        )}

        {warningList.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 space-y-1">
            <p className="font-semibold text-red-800">What will happen:</p>
            <ul className="list-disc list-inside space-y-1">
              {warningList.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Select all scopes
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={`px-5 py-2 rounded-full text-sm font-semibold text-black transition ${
                confirmDisabled
                  ? "bg-yellow-200 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmationModal;
