import React from 'react';
import { PAYMENT_TYPES } from '../config/paymentTypes';

const PaymentDetails = ({ paymentType, paymentData }) => {
  if (!paymentData) return null;

  const renderDetails = () => {
    switch (paymentType) {
      case PAYMENT_TYPES.DRIVERS_LICENSE:
        return (
          <div>
            <h3 className="text-lg font-medium mb-2">License Details</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">License Type</p>
                  <p className="font-medium">Driver's License</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₦{paymentData.amount || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case PAYMENT_TYPES.VEHICLE_PAPER:
        return (
          <div>
            <h3 className="text-lg font-medium mb-2">Vehicle Details</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium">{paymentData.vehicle_details?.make || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₦{paymentData.amount || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="text-lg font-bold">₦{paymentData.amount || '0.00'}</span>
            </div>
          </div>
        );
    }
  };

  return <div className="mb-6">{renderDetails()}</div>;
};

export default PaymentDetails;