# Auto-Fill Feature Documentation

## Overview
The auto-fill feature allows users to upload documents (images or PDFs) and automatically extract information to populate the car registration form using OCR (Optical Character Recognition) technology.

## Components

### 1. AutoFillModal (`src/components/AutoFillModal.jsx`)
The main modal component that handles the auto-fill workflow:
- File upload interface
- OCR processing with progress indicators
- Data extraction and preview
- Auto-fill form functionality

### 2. FileUpload (`src/components/FileUpload.jsx`)
A reusable file upload component with:
- Drag and drop functionality
- File type validation (images and PDFs)
- File size validation (default 5MB, configurable)
- Visual feedback for upload states

### 3. OCR Service (`src/services/ocrService.js`)
Handles OCR operations using Tesseract.js:
- Text extraction from images and PDFs
- Worker management and initialization
- Error handling and cleanup

### 4. Text Parser Service (`src/services/textParserService.js`)
Parses extracted text to identify form fields:
- Pattern matching for various field types
- Data cleaning and formatting
- Car type determination based on vehicle information

## Usage

### Basic Implementation
```jsx
import AutoFillModal from './components/AutoFillModal';

function MyForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleAutoFill = (autoFilledData) => {
    setFormData(autoFilledData);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Auto Fill
      </button>
      
      <AutoFillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAutoFill={handleAutoFill}
        formData={formData}
      />
    </>
  );
}
```

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, BMP, TIFF
- **Documents**: PDF
- **Maximum file size**: 10MB (configurable)

### Extracted Fields
The system can extract the following information:
- Owner Name
- Address
- Vehicle Make
- Vehicle Model
- Car Type (private/commercial/government)
- Registration Number
- Chassis Number
- Engine Number
- Vehicle Year
- Vehicle Color
- Phone Number
- Date Issued
- Expiry Date

## Technical Details

### OCR Engine
- **Library**: Tesseract.js
- **Language**: English (eng)
- **Character whitelist**: Alphanumeric characters, common punctuation
- **Page segmentation**: Auto mode

### Text Parsing
The text parser uses regex patterns to identify and extract form fields:
- Context-aware pattern matching
- Multiple pattern fallbacks for each field
- Data cleaning and formatting
- Smart car type detection

### Performance Considerations
- OCR processing happens in a Web Worker
- Progressive loading with status updates
- Automatic cleanup of resources
- Error handling and user feedback

## Error Handling
- File type validation
- File size validation
- OCR processing errors
- No text extraction scenarios
- Network and browser compatibility issues

## Browser Compatibility
- Modern browsers with Web Worker support
- ES6+ features required
- Canvas API for image processing
- File API for file handling

## Security Considerations
- All processing happens client-side
- No data is sent to external servers
- Files are processed locally in the browser
- Temporary data is cleaned up after processing

## Customization

### Adding New Field Patterns
To add support for new fields, update the patterns in `textParserService.js`:

```javascript
// Add new pattern to the patterns object
newField: [
  /(?:label|keyword)[\s:]*([pattern])/i,
  /alternative pattern/i,
],
```

### Modifying File Upload Settings
Customize the FileUpload component:

```jsx
<FileUpload
  acceptedTypes="image/*,.pdf,.doc,.docx"
  maxSize={20 * 1024 * 1024} // 20MB
  onFileSelect={handleFileSelect}
/>
```

### OCR Configuration
Modify OCR settings in `ocrService.js`:

```javascript
await this.worker.setParameters({
  tessedit_char_whitelist: 'custom character set',
  tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
});
```

## Troubleshooting

### Common Issues
1. **OCR not working**: Ensure browser supports Web Workers
2. **Poor extraction accuracy**: Use higher quality images
3. **Slow processing**: Large files or complex documents take longer
4. **Missing fields**: Some documents may not contain all expected information

### Debug Mode
Enable console logging to debug issues:
```javascript
// In ocrService.js
console.log('Extracted text:', text);
```

## Future Enhancements
- Multi-language support
- Advanced image preprocessing
- Machine learning-based field detection
- Batch processing capabilities
- Cloud OCR integration options
