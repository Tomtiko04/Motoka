import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="ml-4 text-sm text-gray-600">Loading prices…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-gray-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Vehicle Document Prices</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage the prices charged for each document at renewal
            </p>
          </div>
        </div>
      </div>

      {/* Prices table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Click the edit icon on any row to update its price. Prices are in <strong>Naira (₦)</strong>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price (₦)
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const isEditing = editingKey === item.item_key;
                return (
                  <tr key={item.item_key} className="hover:bg-gray-50 transition-colors">
                    {/* Document name */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </td>

                    {/* item_key */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                        {item.item_key}
                      </code>
                    </td>

                    {/* Required badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Optional
                        </span>
                      )}
                    </td>

                    {/* Active badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Price — editable inline */}
                    <td className="px-5 py-4 whitespace-nowrap">
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
                            className="w-32 border border-blue-400 rounded-md px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(item)}
                            disabled={saving}
                            title="Save"
                            className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
                            className="flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          title="Edit price"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
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
          <div className="text-center py-12">
            <DocumentTextIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No document prices found</p>
          </div>
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
