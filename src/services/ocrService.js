import Tesseract from 'tesseract.js';
import pdfService from './pdfService';
import cleanVehicleDoc from '../utils/postProcessor';
import documentAiClient from './documentAiClient';

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

  // Draw an image/blob onto a canvas, optionally rotate, and apply simple grayscale/contrast
  async preprocessToBlob(input, rotateDeg = 0) {
    const imageUrl = URL.createObjectURL(input);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = imageUrl;
      });

      const width = rotateDeg % 180 === 0 ? img.naturalWidth : img.naturalHeight;
      const height = rotateDeg % 180 === 0 ? img.naturalHeight : img.naturalWidth;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // rotate
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotateDeg * Math.PI) / 180);
      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight,
      );
      ctx.restore();

      // grayscale + slight contrast boost
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const contrast = 1.1; // mild boost
      for (let p = 0; p < data.length; p += 4) {
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        // grayscale
        let v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // contrast adjustment around 128
        v = (v - 128) * contrast + 128;
        v = Math.max(0, Math.min(255, v));
        data[p] = data[p + 1] = data[p + 2] = v;
      }
      ctx.putImageData(imageData, 0, 0);

      return await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async recognizeWithBestRotation(fileOrBlob) {
    const rotations = [0, 90, 180, 270];
    let best = { text: '', confidence: -1 };
    for (const deg of rotations) {
      try {
        const preBlob = await this.preprocessToBlob(fileOrBlob, deg);
        const { data } = await this.worker.recognize(preBlob);
        const conf = typeof data.confidence === 'number' ? data.confidence : 0;
        if (conf > best.confidence) {
          best = { text: data.text, confidence: conf };
        }
        // short-circuit if very high confidence
        if (best.confidence >= 85) break;
      } catch {
        // ignore rotation failure and continue
      }
    }
    return best.text;
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
        text = await this.recognizeWithBestRotation(imageBlob);
      } else {
        // Handle image files
        text = await this.recognizeWithBestRotation(file);
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

  // Send file to Google Document AI Form Parser via backend endpoint, then clean
  async extractWithDocumentAI(file) {
    const projectId = import.meta.env.VITE_DOC_AI_PROJECT_ID;
    const location = import.meta.env.VITE_DOC_AI_LOCATION;
    const processorId = import.meta.env.VITE_DOC_AI_FORM_PROCESSOR_ID;
    if (!projectId || !location || !processorId) {
      throw new Error('Document AI is not configured');
    }

    const rawDoc = await documentAiClient.processWithDocumentAI({ file, projectId, location, processorId });
    return cleanVehicleDoc(rawDoc.document || rawDoc);
  }
}

// Create a singleton instance
const ocrService = new OCRService();

export default ocrService;
