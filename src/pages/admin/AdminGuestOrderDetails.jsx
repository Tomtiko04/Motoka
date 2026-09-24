import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptPercentIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminCreateShipment, adminGetGuestOrder } from '../../services/apiDelivery';
import ShipmentTracker from '../../components/delivery/ShipmentTracker';

const STATUS_BADGE = {
  payment_success: 'bg-green-100 text-green-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  payment_failed: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL = {
  payment_success: 'Paid',
  pending_payment: 'Pending payment',
  payment_failed: 'Failed',
  expired: 'Expired',
};

function formatNairaFromKobo(kobo) {
  const n = Number(kobo);
  if (!Number.isFinite(n)) return '—';
  return `₦${(n / 100).toLocaleString('en-NG')}`;
}

function notifyFeeMismatch(shipment) {
  const mismatch = shipment?.raw_response?.fee_mismatch;
  if (!mismatch || Math.abs(Number(mismatch.difference_kobo) || 0) <= 100) {
    toast.success('Waybill generated');
    return;
  }
  const paid = formatNairaFromKobo(mismatch.customer_kobo);
  const booked = formatNairaFromKobo(mismatch.booked_kobo);
  toast.success(`Waybill generated. Customer paid ${paid}; Terminal charged ${booked}.`);
}

export default function AdminGuestOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipmentBusy, setShipmentBusy] = useState(false);
  const [actualWeightKg, setActualWeightKg] = useState('');

  const load = async () => {
    const data = await adminGetGuestOrder(orderId);
    setOrder(data);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Failed to load guest order');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [orderId]);

  const details = order?.delivery_details || {};
  const hasDelivery = Boolean(details.address || Number(order?.delivery_fee) > 0);
  const waybill = order?.shipment?.waybill_number;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-500">Guest order not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/guest-orders')}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to guest orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest renewal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.plate_number} · {order.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>
          {STATUS_LABEL[order.payment_status] || order.payment_status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-400" />
            Customer
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{order.guest_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900 break-all">{order.guest_email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{order.guest_phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Plate number</dt>
              <dd className="font-medium text-gray-900">{order.plate_number}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Motoka account</dt>
              <dd className="font-medium text-gray-900">
                {order.linked_user_id ? (
                  <span className="inline-flex items-center gap-1 text-green-700">
                    <CheckBadgeIcon className="h-4 w-4" /> Linked to a registered account
                  </span>
                ) : (
                  'Guest — no account yet'
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ReceiptPercentIcon className="h-5 w-5 text-gray-400" />
            Order summary
          </h3>
          <ul className="divide-y divide-gray-100 text-sm">
            {(order.items || []).map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-medium text-gray-900">
                  {item.price != null ? formatNairaFromKobo(item.price) : '—'}
                </span>
              </li>
            ))}
            {(!order.items || order.items.length === 0) && (
              <li className="py-2 text-gray-500">No line items recorded.</li>
            )}
            {Number(order.delivery_fee) > 0 && (
              <li className="flex items-center justify-between py-2">
                <span className="text-gray-700">Delivery fee</span>
                <span className="font-medium text-gray-900">{formatNairaFromKobo(order.delivery_fee)}</span>
              </li>
            )}
            <li className="flex items-center justify-between py-3 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total paid</span>
              <span className="font-bold text-gray-900">{formatNairaFromKobo(order.total_amount)}</span>
            </li>
          </ul>
          <dl className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Gateway</dt>
              <dd className="font-medium text-gray-900 capitalize">{order.payment_gateway || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Reference</dt>
              <dd className="font-medium text-gray-900 break-all">{order.payment_reference || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {hasDelivery && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{details.address || '—'}</p>
                <p className="text-sm text-gray-500">{details.state} {details.lga ? `, ${details.lga}` : ''}</p>
              </div>
            </div>
            {details.contact && (
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <p className="text-sm text-gray-900">{details.contact}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Delivery fee paid by customer: {formatNairaFromKobo(order.delivery_fee)}
            </p>
            <div className="border-t border-gray-100 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <TruckIcon className="h-5 w-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Courier shipment</p>
              </div>
              <ShipmentTracker
                progress={order.progress}
                compact
                admin
                labelUrl={order.shipment?.label_url}
              />
              {!waybill && order.payment_status === 'payment_success' && (
                <div className="space-y-3 mt-4">
                  <label className="block text-xs text-gray-500">
                    Actual weight (kg) — optional scale override (min 0.1)
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={actualWeightKg}
                      onChange={(e) => setActualWeightKg(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Leave blank to use estimate"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={shipmentBusy}
                    onClick={async () => {
                      try {
                        setShipmentBusy(true);
                        const shipment = await adminCreateShipment({
                          guest_order_id: order.id,
                          order_type: 'guest_renewal',
                          weight_kg: actualWeightKg ? Number(actualWeightKg) : undefined,
                        });
                        notifyFeeMismatch(shipment);
                        await load();
                      } catch (err) {
                        toast.error(err.message || 'Failed to generate waybill');
                      } finally {
                        setShipmentBusy(false);
                      }
                    }}
                    className="w-full bg-slate-800 text-white py-2 px-4 rounded-lg hover:bg-slate-900 disabled:opacity-50 text-sm font-medium"
                  >
                    {shipmentBusy ? 'Generating…' : 'Generate waybill'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
