import React, { useState, useRef } from 'react';
import { BsStars } from 'react-icons/bs';
import { FiX, FiUpload, FiCheck, FiAlertCircle, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { supabase } from '../config/supabaseClient';
import config from '../config/config';

const FIELD_LABELS = {
  ownerName: 'Owner Name',
  address: 'Address',
  vehicleMake: 'Vehicle Make',
  vehicleModel: 'Vehicle Model',
  vehicleYear: 'Vehicle Year',
  vehicleColor: 'Vehicle Color',
  registrationNo: 'Plate Number',
  chassisNo: 'Chassis Number',
  engineNo: 'Engine Number',
  expiryDate: 'Expiry Date',
  dateIssued: 'Date Issued',
  carType: 'Car Type',
};

const ALL_FIELDS = Object.keys(FIELD_LABELS);

const AutoFillModal = ({ isOpen, onClose, onAutoFill, formData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null); // { data, fieldsFound }
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setSelectedFile(null);
    // Revoke the blob URL to free memory
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (isProcessing) return;
    reset();
    onClose();
  };

  const acceptFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError(null);
    setResult(null);
    setSelectedFile(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleFileInput = (e) => acceptFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const processDocument = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired. Please log in again.');

      const body = new FormData();
      body.append('image', selectedFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35_000);

      let res;
      try {
        res = await fetch(`${config.getApiBaseUrl()}/cars/extract-document`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const json = await res.json();

      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to analyse the document.');
      }

      setResult(json);

      if (json.fieldsFound.length === 0) {
        setError('No readable information was found. Please try a clearer photo of the document.');
      } else {
        toast.success(`Found ${json.fieldsFound.length} field${json.fieldsFound.length > 1 ? 's' : ''} in the document.`);
      }
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : err.message || 'Something went wrong. Please try again.';
      setError(msg);
      toast.error('Could not extract document data.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyToForm = () => {
    if (!result?.data) return;

    // Map extracted keys → AddCar form keys
    const mapping = {
      ownerName: 'ownerName',
      address: 'address',
      vehicleMake: 'vehicleMake',
      vehicleModel: 'vehicleModel',
      vehicleYear: 'vehicleYear',
      vehicleColor: 'vehicleColor',
      registrationNo: 'registrationNo',
      chassisNo: 'chassisNo',
      engineNo: 'engineNo',
      expiryDate: 'expiryDate',
      dateIssued: 'dateIssued',
      carType: 'carType',
    };

    const patch = {};
    for (const [extractKey, formKey] of Object.entries(mapping)) {
      if (result.data[extractKey] !== null && result.data[extractKey] !== undefined) {
        patch[formKey] = result.data[extractKey];
      }
    }

    onAutoFill({ ...formData, ...patch });
    toast.success('Form filled with extracted data.');
    handleClose();
  };

  if (!isOpen) return null;

  const found = result?.fieldsFound ?? [];
  const notFound = result ? ALL_FIELDS.filter(k => !found.includes(k)) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BsStars className="text-[#EBB950] text-xl" />
            <div>
              <h2 className="text-base font-semibold text-[#05243F]">Smart Auto Fill</h2>
              <p className="text-xs text-[#05243F]/50 mt-0.5">
                Upload a vehicle document — AI will read only what it can clearly see.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Drop zone */}
          {!result && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 min-h-[180px] ${
                isDragging
                  ? 'border-[#2389E3] bg-blue-50'
                  : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-[#2389E3] hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileInput}
              />

              {preview ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <img
                    src={preview}
                    alt="Document preview"
                    className="max-h-36 max-w-full rounded-lg object-contain shadow"
                  />
                  <p className="text-xs text-gray-500 truncate max-w-full px-2">{selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#2389E3]/10 flex items-center justify-center">
                    <FiImage className="text-[#2389E3] text-2xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#05243F]">
                      Drop your document here or <span className="text-[#2389E3]">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10 MB</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2389E3] border-t-transparent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Analysing your document…</p>
                <p className="text-xs text-blue-600 mt-0.5">AI is reading the image. This takes a few seconds.</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Image thumbnail + change button */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {preview && (
                  <img src={preview} alt="doc" className="h-12 w-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-400">{found.length} of {ALL_FIELDS.length} fields found</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setResult(null); setError(null); setSelectedFile(null); setPreview(null); }}
                  className="text-xs text-[#2389E3] hover:underline flex-shrink-0"
                >
                  Change image
                </button>
              </div>

              {/* Found fields */}
              {found.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    ✓ Extracted from document ({found.length})
                  </p>
                  <div className="space-y-1.5">
                    {found.map((key) => (
                      <div key={key} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <p className="text-xs font-medium text-gray-600">{FIELD_LABELS[key]}</p>
                          <p className="text-sm font-semibold text-[#05243F] mt-0.5">{result.data[key]}</p>
                        </div>
                        <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not-found fields */}
              {notFound.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Not found — fill these manually ({notFound.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {notFound.map((key) => (
                      <span key={key} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                        {FIELD_LABELS[key]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>

          {!result ? (
            <button
              type="button"
              onClick={processDocument}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2389E3] rounded-lg hover:bg-[#1e7bc7] transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              <FiUpload className="h-4 w-4" />
              {isProcessing ? 'Analysing…' : 'Analyse Document'}
            </button>
          ) : found.length > 0 ? (
            <button
              type="button"
              onClick={applyToForm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FiCheck className="h-4 w-4" />
              Apply {found.length} field{found.length > 1 ? 's' : ''} to form
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

AutoFillModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAutoFill: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
};

export default AutoFillModal;
