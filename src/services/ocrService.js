import Tesseract from 'tesseract.js';
import pdfService from './pdfService';

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.worker = await Tesseract.createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/-:() ',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('Failed to initialize OCR service');
    }
  }

  async extractText(file) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      let text = '';
      
      // Handle PDF files
      if (pdfService.isPDF(file)) {
        // First try to extract text directly from PDF
        try {
          text = await pdfService.extractTextFromPDF(file);
          if (text && text.trim().length > 0) {
            return text;
          }
        } catch (error) {
          console.warn('Direct PDF text extraction failed, falling back to OCR:', error);
        }
        
        // If direct extraction fails or returns empty, convert to image and use OCR
        const imageBlob = await pdfService.convertPDFToImage(file);
        const { data: { text: ocrText } } = await this.worker.recognize(imageBlob);
        text = ocrText;
      } else {
        // Handle image files
        const { data: { text: ocrText } } = await this.worker.recognize(file);
        text = ocrText;
      }
      
      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Create a singleton instance
const ocrService = new OCRService();

export default ocrService;
