import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import config from '../../config/config';
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const CSV_HEADERS = [
  'user_email',
  'name_of_owner',
  'address',
  'phone_number',
  'vehicle_make',
  'vehicle_model',
  'vehicle_year',
  'vehicle_color',
  'car_type',
  'registration_status',
  'registration_no',
  'chasis_no',
  'engine_no',
  'date_issued',
  'expiry_date',
  'plate_number',
];

const SAMPLE_ROWS = [
  [
    'john.doe@example.com',
    'John Doe',
    '12 Lagos Street, Abuja',
    '08012345678',
    'Toyota',
    'Corolla',
    '2020',
    'Silver',
    'private',
    'registered',
    'ABC-123DE',
    'WBA3A5C55CF256',
    'ENG123456',
    '2020-01-15',
    '2026-01-15',
    'ABC-123DE',
  ],
  [
    'jane.smith@example.com',
    'Jane Smith',
    '5 Ikoyi Close, Lagos',
    '09087654321',
    'Honda',
    'Accord',
    '2019',
    'Black',
    'commercial',
    'unregistered',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
];

function downloadTemplate() {
  const csvContent = [CSV_HEADERS.join(','), ...SAMPLE_ROWS.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'motoka_bulk_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImportModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // null = not done yet
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a CSV file'); return; }
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Session expired'); return; }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${config.getApiBaseUrl()}/admin/cars/bulk-import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const json = await res.json();

      if (json.status) {
        setResult(json.data);
        if (json.data.succeeded > 0) {
          toast.success(`${json.data.succeeded} car${json.data.succeeded !== 1 ? 's' : ''} imported successfully`);
          onSuccess?.();
        }
      } else {
        toast.error(json.message || 'Import failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !uploading && onClose()} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Bulk Import Cars</h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload a CSV to add multiple cars at once</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Template download */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Download the CSV template</p>
                <p className="text-xs text-blue-600">Fill it in and upload below — includes sample rows</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-3.5 w-3.5" />
              Template
            </button>
          </div>

          {/* Required columns */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Required columns</p>
            <div className="flex flex-wrap gap-1.5">
              {['user_email', 'name_of_owner', 'address', 'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_color', 'car_type', 'registration_status'].map((col) => (
                <span key={col} className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-mono">{col}</span>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-600 mt-2 mb-1.5">Optional columns</p>
            <div className="flex flex-wrap gap-1.5">
              {['phone_number', 'registration_no', 'chasis_no', 'engine_no', 'date_issued', 'expiry_date', 'plate_number'].map((col) => (
                <span key={col} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-xs font-mono">{col}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <strong>car_type:</strong> private | commercial &nbsp;•&nbsp;
              <strong>registration_status:</strong> registered | unregistered &nbsp;•&nbsp;
              Max 500 rows per file
            </p>
          </div>

          {/* File drop zone */}
          {!result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-blue-400 bg-blue-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowUpTrayIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {dragOver ? 'Drop it here!' : 'Drag & drop your CSV here'}
                  </p>
                  <p className="text-xs text-gray-400">or click to browse — .csv only, max 5 MB</p>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{result.succeeded}</p>
                  <p className="text-xs text-green-600 mt-0.5">Imported</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${result.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-700' : 'text-gray-400'}`}>{result.failed}</p>
                  <p className={`text-xs mt-0.5 ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>Failed</p>
                </div>
              </div>

              {/* Error list */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Failed rows</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {result.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                        <XCircleIcon className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-red-700">Row {err.row}</span>
                          {err.user_email && <span className="text-xs text-red-600 ml-1.5">({err.user_email})</span>}
                          <p className="text-xs text-red-600 mt-0.5">{err.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Successful rows (collapsed by default) */}
              {result.created && result.created.length > 0 && (
                <details className="group">
                  <summary className="text-sm font-semibold text-gray-700 cursor-pointer list-none flex items-center justify-between">
                    <span>Imported cars ({result.created.length})</span>
                    <span className="text-xs text-gray-400 group-open:hidden">Show</span>
                    <span className="text-xs text-gray-400 hidden group-open:inline">Hide</span>
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {result.created.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        <span className="text-xs text-green-800 font-medium">Row {c.row}</span>
                        <span className="text-xs text-green-700 truncate">{c.vehicle} — {c.user_email}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <button
                onClick={reset}
                className="w-full py-2 text-sm text-blue-600 font-medium border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Import another file
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {uploading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
              {uploading ? 'Importing...' : 'Import Cars'}
            </button>
          </div>
        )}
        {result && (
          <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
