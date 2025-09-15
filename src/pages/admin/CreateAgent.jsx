import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const CreateAgent = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    address: '',
    location: '',
    accountNumber: '',
    stateOfOrigin: '',
    phoneNumber: '',
    email: '',
    agentProfile: null,
    ninFront: null,
    ninBack: null,
  });

  const [states, setStates] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState(null);

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${config.getApiBaseUrl()}/test-cors`);
      const data = await response.json();
      console.log('API Test Response:', data);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  // Filter states based on search term
  useEffect(() => {
    if (stateSearchTerm) {
      const filtered = states.filter(state =>
        state.name.toLowerCase().includes(stateSearchTerm.toLowerCase())
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates(states);
    }
  }, [stateSearchTerm, states]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.state-dropdown')) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/states`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setStates(data.data);
        setFilteredStates(data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setFormData(prev => ({
      ...prev,
      stateOfOrigin: state.name
    }));
    setIsStateDropdownOpen(false);
    setStateSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToast = toast.loading('Creating agent...');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.dismiss(loadingToast);
        toast.error('Please log in as admin');
        return;
      }

      // Validate required fields
      if (!selectedState) {
        toast.dismiss(loadingToast);
        toast.error('Please select a state');
        return;
      }

      const formDataToSend = new FormData();
      
      // Map frontend field names to backend field names
      const fieldMapping = {
        'firstName': 'first_name',
        'surname': 'last_name',
        'phoneNumber': 'phone',
        'accountNumber': 'account_number',
      };

      // Add all form fields with proper mapping
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'agentProfile' || key === 'ninFront' || key === 'ninBack') {
            // Handle file uploads
            if (formData[key]) {
              formDataToSend.append(key === 'agentProfile' ? 'profile_image' : 
                                  key === 'ninFront' ? 'nin_front_image' : 'nin_back_image', 
                                  formData[key]);
            }
          } else if (key === 'stateOfOrigin') {
            // Use selected state name for state field
            if (selectedState) {
              formDataToSend.append('state', selectedState.name);
            }
          } else if (key === 'location') {
            // Map location to lga
            formDataToSend.append('lga', formData[key]);
          } else if (fieldMapping[key]) {
            // Use mapped field name
            formDataToSend.append(fieldMapping[key], formData[key]);
          } else {
            // Use original field name for fields that match backend
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      const apiUrl = `${config.getApiBaseUrl()}/admin/agents`;
      console.log('API URL:', apiUrl);
      console.log('Environment:', import.meta.env.VITE_ENV);
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.status) {
        toast.dismiss(loadingToast);
        toast.success(data.message || 'Agent created successfully!');
        
        // Reset form
        setFormData({
          firstName: '',
          surname: '',
          address: '',
          location: '',
          accountNumber: '',
          stateOfOrigin: '',
          phoneNumber: '',
          email: '',
          agentProfile: null,
          ninFront: null,
          ninBack: null,
        });
        setSelectedState(null);
        setStateSearchTerm('');
        
        // Redirect to agents list after a short delay
        setTimeout(() => {
          window.location.href = '/admin/agents';
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error(errorMessages.join(', '));
        } else {
          toast.error(data.message || 'Failed to create agent');
        }
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to create agent. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Agents/Create Agent</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Fill Agent Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Uploads */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Document Uploads</h3>
              
              {/* NIN Front Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload NIN Front</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('ninFront', e.target.files[0])}
                  className="hidden"
                  id="nin-front"
                />
                <label htmlFor="nin-front" className="cursor-pointer">
                  <span className="text-xs text-gray-500">Click to upload</span>
                </label>
                {formData.ninFront && (
                  <p className="text-xs text-green-600 mt-1">File selected: {formData.ninFront.name}</p>
                )}
              </div>

              {/* NIN Back Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload NIN Back</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('ninBack', e.target.files[0])}
                  className="hidden"
                  id="nin-back"
                />
                <label htmlFor="nin-back" className="cursor-pointer">
                  <span className="text-xs text-gray-500">Click to upload</span>
                </label>
                {formData.ninBack && (
                  <p className="text-xs text-green-600 mt-1">File selected: {formData.ninBack.name}</p>
                )}
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Personal Information</h3>
              
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Surname */}
              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                  Surname
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Enter surname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Account Number */}
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* State of Origin */}
              <div className="relative state-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State of Origin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={stateSearchTerm || selectedState?.name || ''}
                    onChange={(e) => {
                      setStateSearchTerm(e.target.value);
                      setIsStateDropdownOpen(true);
                    }}
                    onFocus={() => setIsStateDropdownOpen(true)}
                    placeholder="Search and select state..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2"
                  >
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                
                {/* Dropdown */}
                {isStateDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => handleStateSelect(state)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {state.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No states found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>


              {/* Agent Profile Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Profile Picture
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <ArrowUpTrayIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Upload Profile Picture</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('agentProfile', e.target.files[0])}
                    className="hidden"
                    id="agent-profile"
                  />
                  <label htmlFor="agent-profile" className="cursor-pointer">
                    <span className="text-xs text-gray-500">Click to upload</span>
                  </label>
                  {formData.agentProfile && (
                    <p className="text-xs text-green-600 mt-1">File selected: {formData.agentProfile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgent;
