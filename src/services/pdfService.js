import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

class PDFService {
  async convertPDFToImage(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error('Failed to convert PDF to image');
    }
  }

  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  isPDF(file) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }
}

export default new PDFService();
