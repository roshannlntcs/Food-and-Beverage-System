export default function OrderSuccessModal({ show, onClose, onPrintReceipt }) {
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-80 rounded-xl p-6 flex flex-col items-center space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-green-700">Order Successful!</h2>
          <p className="text-sm text-center">Your order has been successfully processed.</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
            >
              Done
            </button>
            <button
              onClick={onPrintReceipt}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }
  