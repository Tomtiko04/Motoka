import React, { useState } from 'react';

const PaymentOptions = ({ availableBalance, renewalCost }) => {
  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const newBalance = availableBalance - renewalCost;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">Payment Options</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Payment Methods */}
          <div>
            <h2 className="text-gray-600 mb-4">Choose Payment Method</h2>
            <div className="space-y-4">
              <button
                className={`w-full p-4 rounded-xl text-left ${
                  selectedMethod === 'wallet' 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50'
                }`}
                onClick={() => setSelectedMethod('wallet')}
              >
                <span className="font-medium">Wallet Balance: ₦{availableBalance.toLocaleString()}</span>
              </button>
              
              <button
                className={`w-full p-4 rounded-xl text-left ${
                  selectedMethod === 'transfer' 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50'
                }`}
                onClick={() => setSelectedMethod('transfer')}
              >
                <span className="font-medium">Pay Via Transfer</span>
              </button>

              <button
                className={`w-full p-4 rounded-xl text-left ${
                  selectedMethod === 'card' 
                    ? 'bg-blue-50 border-2 border-blue-500' 
                    : 'bg-gray-50'
                }`}
                onClick={() => setSelectedMethod('card')}
              >
                <span className="font-medium">Pay Via Card</span>
              </button>
            </div>
          </div>

          {/* Right Column - Payment Details */}
          <div>
            <h2 className="text-gray-600 mb-4">Wallet Method</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Available Balance:</span>
                <span className="font-medium">₦{availableBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Renewal Cost</span>
                <span className="font-medium">₦{renewalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New Balance</span>
                <span className="font-medium">₦{newBalance.toLocaleString()}</span>
              </div>
              
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl mt-8 hover:bg-blue-600 transition-colors">
                ₦{renewalCost.toLocaleString()} Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
