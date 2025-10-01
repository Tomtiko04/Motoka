import { useEffect, useRef } from 'react';
import ocrService from '../services/ocrService';

export const useOCR = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialize OCR service when the hook is first used
    const initializeOCR = async () => {
      if (!isInitialized.current) {
        try {
          await ocrService.initialize();
          isInitialized.current = true;
        } catch (error) {
          console.error('Failed to initialize OCR service:', error);
        }
      }
    };

    initializeOCR();

    // Cleanup function to terminate OCR service when component unmounts
    return () => {
      if (isInitialized.current) {
        ocrService.terminate();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    extractText: ocrService.extractText.bind(ocrService),
    isInitialized: isInitialized.current,
  };
};
