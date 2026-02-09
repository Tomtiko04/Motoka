import React from 'react';
import { PAYMENT_METHODS } from '../config/paymentTypes';

const methodIcons = {
  [PAYMENT_METHODS.PAYSTACK]: '💳',
  [PAYMENT_METHODS.MONICREDIT]: '🏦',
  [PAYMENT_METHODS.BANK_TRANSFER]: '🏛️',
};

const methodLabels = {
  [PAYMENT_METHODS.PAYSTACK]: 'Pay with Card (Paystack)',
  [PAYMENT_METHODS.MONICREDIT]: 'Pay with Monicredit',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
};

const PaymentMethodSelector = ({ methods, selectedMethod, onSelectMethod, disabled }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Select Payment Method</h3>
      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method}
            onClick={() => !disabled && onSelectMethod(method)}
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedMethod === method
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{methodIcons[method] || '💳'}</span>
              <span>{methodLabels[method] || method}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;