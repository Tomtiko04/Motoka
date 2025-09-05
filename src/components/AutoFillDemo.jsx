import React, { useState } from 'react';
import AutoFillModal from './AutoFillModal';
import { FiUpload } from 'react-icons/fi';

const AutoFillDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    address: '',
    vehicleMake: '',
    vehicleModel: '',
    carType: '',
    registrationNo: '',
    chassisNo: '',
    engineNo: '',
    vehicleYear: '',
    vehicleColor: '',
    dateIssued: '',
    expiryDate: '',
    phoneNo: '',
  });

  const handleAutoFill = (autoFilledData) => {
    setFormData(autoFilledData);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Auto-Fill Demo</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiUpload className="h-4 w-4" />
              Auto Fill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={formData[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Click the "Auto Fill" button to open the document upload modal</li>
              <li>Upload a clear image or PDF of a vehicle registration document</li>
              <li>The system will extract text and parse the information</li>
              <li>Review the extracted data and click "Auto Fill Form" to populate the fields</li>
              <li>You can manually edit any field after auto-filling</li>
            </ol>
          </div>
        </div>
      </div>

      <AutoFillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAutoFill={handleAutoFill}
        formData={formData}
      />
    </div>
  );
};

export default AutoFillDemo;
