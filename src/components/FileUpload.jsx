import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi';
import PropTypes from 'prop-types';

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = 'image/*,.pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  error = null,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const isValidType = acceptedTypesArray.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });
    
    if (!isValidType) {
      onFileSelect?.(null, 'Invalid file type. Please upload an image or PDF file.');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      onFileSelect?.(null, `File size too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect?.(file, null);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FiImage className="h-6 w-6 text-blue-500" />;
    }
    return <FiFile className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            isDragOver
              ? 'border-[#2389E3] bg-[#F4F5FC]'
              : 'border-gray-300 hover:border-[#2389E3] hover:bg-[#F4F5FC]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-[#F4F5FC] rounded-full">
              <FiUpload className="h-8 w-8 text-[#2389E3]" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-[#05243F]">
                Drop your document here, or{' '}
                <span className="text-[#2389E3] underline">browse</span>
              </p>
              <p className="text-xs text-[#05243F]/60 mt-1">
                Supports: JPG, PNG, PDF (Max {Math.round(maxSize / (1024 * 1024))}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-[#F4F5FC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium text-[#05243F] truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#05243F]/60">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-[#A73957B0] flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  onFileSelect: PropTypes.func,
  onFileRemove: PropTypes.func,
  acceptedTypes: PropTypes.string,
  maxSize: PropTypes.number,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default FileUpload;
