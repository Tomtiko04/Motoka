import React, { useState } from 'react';
import { FiX, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import FileUpload from './FileUpload';
import ocrService from '../services/ocrService';
import textParserService from '../services/textParserService';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const AutoFillModal = ({ isOpen, onClose, onAutoFill, formData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const handleFileSelect = (file, error) => {
    setSelectedFile(file);
    setError(error);
    setExtractedData(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setExtractedText('');
    setError(null);
    setShowRawText(false);
  };

  const processDocument = async () => {
    if (!selectedFile) {
      setError('Please select a document to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Initializing OCR...');

    try {
      // Step 1: Extract text using OCR
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'PDF';
      setProcessingStep(`Extracting text from ${fileType}...`);
      const rawText = await ocrService.extractText(selectedFile);
      setExtractedText(rawText);
      
      if (!rawText || rawText.trim().length === 0) {
        throw new Error('No text could be extracted from the document. Please ensure the document is clear and readable.');
      }

      // Step 2: Parse the extracted text
      setProcessingStep('Parsing extracted information...');
      const parsedData = textParserService.parseText(rawText);
      
      // Step 3: Determine car type if not found
      if (!parsedData.carType && parsedData.vehicleMake) {
        parsedData.carType = textParserService.determineCarType(parsedData);
      }

      setExtractedData(parsedData);
      setProcessingStep('Processing complete!');
      
      toast.success('Document processed successfully!');
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err.message || 'Failed to process document. Please try again.');
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleAutoFill = () => {
    if (!extractedData) return;

    // Merge extracted data with existing form data
    const mergedData = {
      ...formData,
      ...extractedData,
    };

    onAutoFill(mergedData);
    onClose();
    toast.success('Form auto-filled successfully!');
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedFile(null);
      setExtractedData(null);
      setExtractedText('');
      setError(null);
      setProcessingStep('');
      setShowRawText(false);
      onClose();
    }
  };

  const renderExtractedData = () => {
    if (!extractedData) return null;

    const fields = [
      { key: 'ownerName', label: 'Owner Name' },
      { key: 'address', label: 'Address' },
      { key: 'vehicleMake', label: 'Vehicle Make' },
      { key: 'vehicleModel', label: 'Vehicle Model' },
      { key: 'carType', label: 'Car Type' },
      { key: 'registrationNo', label: 'Registration Number' },
      { key: 'chassisNo', label: 'Chassis Number' },
      { key: 'engineNo', label: 'Engine Number' },
      { key: 'vehicleYear', label: 'Vehicle Year' },
      { key: 'vehicleColor', label: 'Vehicle Color' },
      { key: 'phoneNo', label: 'Phone Number' },
      { key: 'dateIssued', label: 'Date Issued' },
      { key: 'expiryDate', label: 'Expiry Date' },
    ];

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-[#05243F] mb-4">
          Extracted Information
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {fields.map(({ key, label }) => {
            const value = extractedData[key];
            if (!value) return null;

            return (
              <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm font-medium text-[#05243F]">{label}</p>
                  <p className="text-sm text-green-700">{value}</p>
                </div>
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
            );
          })}
        </div>
        
        {Object.keys(extractedData).length === 0 && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                No information could be extracted from the document. Please try with a clearer image or manually fill the form.
              </p>
            </div>
          </div>
        )}
        
        {/* Raw Text Toggle */}
        {extractedText && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="text-sm text-[#2389E3] hover:text-[#1e7bc7] underline"
            >
              {showRawText ? 'Hide' : 'Show'} extracted text
            </button>
            
            {showRawText && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">Raw extracted text:</p>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {extractedText}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-[#05243F]">Auto Fill Form</h2>
            <p className="text-sm text-[#05243F]/60 mt-1">
              Upload a document to automatically extract and fill form information
            </p>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> For best results, use clear, high-quality images or PDFs with readable text. 
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#05243F] mb-3">
              Upload Document
              <span className="ml-0.5 text-[#A73957B0]">*</span>
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              acceptedTypes="image/*,.pdf"
              maxSize={10 * 1024 * 1024} // 10MB
              disabled={isProcessing}
              error={error}
            />
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-blue-800">{processingStep}</p>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {renderExtractedData()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          {!extractedData ? (
            <button
              type="button"
              onClick={processDocument}
              disabled={!selectedFile || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2389E3] rounded-lg hover:bg-[#1e7bc7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiUpload className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Process Document'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FiCheck className="h-4 w-4" />
              Auto Fill Form
            </button>
          )}
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
