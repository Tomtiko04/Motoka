import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, order, agent, onPaymentInitiated }) => {
  const [commissionRate, setCommissionRate] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [manualPaymentRequired, setManualPaymentRequired] = useState(false);
  const [transferReference, setTransferReference] = useState('');
  const [agentDetails, setAgentDetails] = useState(null);

  if (!isOpen || !order || !agent) return null;

  const orderAmount = parseFloat(order.amount || 0);
  const commissionAmount = (orderAmount * commissionRate) / 100;
  const agentAmount = orderAmount - commissionAmount;

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/orders/${order.slug}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commission_rate: commissionRate,
          initiate_payment: true
        })
      });

      const data = await response.json();
      if (data.status) {
        if (data.data.manual_payment_required) {
          setManualPaymentRequired(true);
          setTransferReference(data.data.transfer_reference);
          setAgentDetails(data.data.agent_details);
          toast('Manual payment required due to account limitations', {
            icon: '⚠️',
            duration: 5000,
          });
        } else {
          setPaymentInitiated(true);
          setTransferReference(data.data.transfer_reference);
          toast.success('Payment initiated successfully!');
        }
        onPaymentInitiated?.(data.data);
      } else {
        toast.error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentInitiated(false);
    setManualPaymentRequired(false);
    setTransferReference('');
    setAgentDetails(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {paymentInitiated ? 'Payment Initiated' : 
             manualPaymentRequired ? 'Manual Payment Required' : 
             'Process Order Payment'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!paymentInitiated && !manualPaymentRequired ? (
            <>
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="ml-2 font-medium">#{order.slug}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="ml-2 font-medium">
                      {order.order_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">₦{orderAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">
                      {order.state_name}{order.lga_name ? `, ${order.lga_name}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Agent Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{agent.first_name} {agent.last_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{agent.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Bank:</span>
                    <span className="ml-2 font-medium">{agent.bank_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Account:</span>
                    <span className="ml-2 font-medium">{agent.account_number}</span>
                  </div>
                  {agent.account_name && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Verified Account Name:</span>
                      <span className="ml-2 font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        ✓ {agent.account_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Calculation */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Calculation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Amount:</span>
                    <span className="font-medium">₦{orderAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission Rate:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission Amount:</span>
                    <span className="font-medium text-red-600">-₦{commissionAmount.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Agent Payment:</span>
                    <span className="text-green-600">₦{agentAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Payment Confirmation</p>
                    <p className="mt-1">
                      This will initiate a transfer of ₦{agentAmount.toLocaleString()} to the agent's account. 
                      The payment will be processed through Paystack and may take a few minutes to complete.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : manualPaymentRequired ? (
            /* Manual Payment Required */
            <div className="text-center space-y-4">
              <ExclamationTriangleIcon className="h-16 w-16 text-orange-500 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Manual Payment Required</h3>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Reference:</span>
                    <span className="font-medium font-mono">{transferReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{agentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-orange-600">Manual Payment Required</span>
                  </div>
                </div>
              </div>
              
              {agentDetails && (
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Agent Payment Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Name:</span> {agentDetails.name}</div>
                    <div><span className="font-medium">Phone:</span> {agentDetails.phone}</div>
                    <div><span className="font-medium">Bank:</span> {agentDetails.bank_name}</div>
                    <div><span className="font-medium">Account:</span> {agentDetails.account_number}</div>
                    <div><span className="font-medium">Account Name:</span> {agentDetails.account_name}</div>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Account Limitation</p>
                    <p className="mt-1">
                      Your Paystack account is on a starter plan which doesn't allow automatic transfers. 
                      Please process this payment manually using the agent's bank details above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Success */
            <div className="text-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Payment Initiated Successfully!</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Reference:</span>
                    <span className="font-medium font-mono">{transferReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{agentAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-yellow-600">Pending</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                The agent will receive a notification about the payment. 
                You can track the payment status using the transfer reference.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          {!paymentInitiated && !manualPaymentRequired ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Initiate Payment'}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
