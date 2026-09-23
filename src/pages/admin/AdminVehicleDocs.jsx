import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';
import {
  PageHeader,
  StatusBadge,
  PageLoader,
  EmptyState,
  TD,
  TH,
  CARD,
} from '../../components/admin/ui';

// Prices are stored in kobo in the DB. Display in Naira (divide by 100).
const koboToNaira = (kobo) => (Number(kobo) / 100).toFixed(2);
const nairaToKobo = (naira) => Math.round(parseFloat(naira) * 100);

const AdminVehicleDocs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${config.getApiBaseUrl()}/admin/vehicle-doc-prices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.status || data.success) {
        setItems(data.data || []);
      } else {
        toast.error(data.message || 'Failed to load document prices');
      }
    } catch {
      toast.error('Failed to load document prices');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingKey(item.item_key);
    setEditValue(koboToNaira(item.price));
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const saveEdit = async (item) => {
    const newNaira = parseFloat(editValue);
    if (isNaN(newNaira) || newNaira < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newKobo = nairaToKobo(newNaira);
    if (newKobo === item.price) {
      cancelEdit();
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(
        `${config.getApiBaseUrl()}/admin/vehicle-doc-prices/${item.item_key}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ price: newKobo }),
        },
      );
      const data = await res.json();
      if (data.status || data.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.item_key === item.item_key ? { ...i, price: data.data.price } : i,
          ),
        );
        toast.success(`${item.name} price updated`);
        cancelEdit();
      } else {
        toast.error(data.message || 'Failed to update price');
      }
    } catch {
      toast.error('Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter') saveEdit(item);
    if (e.key === 'Escape') cancelEdit();
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={DocumentTextIcon}
        title="Vehicle Document Prices"
        subtitle="Manage the prices charged for each document at renewal"
      />

      {/* Prices table */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Click the edit icon on any row to update its price. Prices are in <strong>Naira (₦)</strong>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={TH}>
                  Document
                </th>
                <th className={TH}>
                  Key
                </th>
                <th className={TH}>
                  Required
                </th>
                <th className={TH}>
                  Status
                </th>
                <th className={TH}>
                  Price (₦)
                </th>
                <th className={TH}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const isEditing = editingKey === item.item_key;
                return (
                  <tr key={item.item_key} className="hover:bg-gray-50 transition-colors">
                    {/* Document name */}
                    <td className={`${TD} whitespace-nowrap`}>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </td>

                    {/* item_key */}
                    <td className={`${TD} whitespace-nowrap`}>
                      <code className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                        {item.item_key}
                      </code>
                    </td>

                    {/* Required badge */}
                    <td className={`${TD} whitespace-nowrap`}>
                      {item.required ? (
                        <StatusBadge tone="blue">Required</StatusBadge>
                      ) : (
                        <StatusBadge tone="gray">Optional</StatusBadge>
                      )}
                    </td>

                    {/* Active badge */}
                    <td className={`${TD} whitespace-nowrap`}>
                      {item.active ? (
                        <StatusBadge tone="green">Active</StatusBadge>
                      ) : (
                        <StatusBadge tone="red">Inactive</StatusBadge>
                      )}
                    </td>

                    {/* Price — editable inline */}
                    <td className={`${TD} whitespace-nowrap`}>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">₦</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, item)}
                            autoFocus
                            className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">
                          ₦{Number(koboToNaira(item.price)).toLocaleString('en-NG', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className={`${TD} whitespace-nowrap`}>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(item)}
                            disabled={saving}
                            title="Save"
                            className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {saving ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            title="Cancel"
                            className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          title="Edit price"
                          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <EmptyState icon={DocumentTextIcon} title="No document prices found" />
        )}
      </div>

      {/* Footer hint */}
      <p className="text-xs text-gray-400">
        Changes take effect immediately for new renewal orders. Existing orders are not affected.
      </p>
    </div>
  );
};

export default AdminVehicleDocs;
