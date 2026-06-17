import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture A4 preview wrapper, split across multiple pages if needed, and save to PDF.
 * 
 * @param {object} invoiceData - Invoice metadata containing number, buyer name, date
 * @param {string} elementId - Dom ID of the target preview wrapper
 * @returns {Promise<{success: boolean, filename: string}>}
 */
export async function generatePDF(invoiceData, elementId = 'invoice-preview-content') {
  if (typeof window === 'undefined') {
    throw new Error('PDF Generation can only run in a browser environment');
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // 1. Temporarily override styles for standard pixel-perfect capture
  const originalWidth = element.style.width;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorderRadius = element.style.borderRadius;

  element.style.width = '794px';
  element.style.boxShadow = 'none';
  element.style.borderRadius = '0';

  try {
    // 2. Capture canvas via html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 3. Restore original styles immediately
    element.style.width = originalWidth;
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;

    // 4. Setup PDF dimensions (A4 is 210mm x 297mm)
    const imgWidth = 210;
    const pageHeight = 297;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Height of one A4 page in canvas pixels based on aspect ratio
    const pageCanvasHeight = (canvasWidth * pageHeight) / imgWidth;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = canvasHeight;
    let position = 0;
    let pageNum = 1;

    // 5. Paginate using temporary slice canvases
    while (heightLeft > 0) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      
      // Calculate how much height is remaining vs how much fits on a page
      const sliceHeight = Math.min(pageCanvasHeight, heightLeft);
      tempCanvas.height = sliceHeight;

      const tempCtx = tempCanvas.getContext('2d');
      // Draw slice of canvas from vertical position
      tempCtx.drawImage(
        canvas,
        0, position, canvasWidth, sliceHeight, // src
        0, 0, canvasWidth, sliceHeight // dest
      );

      const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);

      // Add a page if we have already drawn the first page
      if (pageNum > 1) {
        doc.addPage();
      }

      // Render image segment to A4
      const destHeight = (sliceHeight * imgWidth) / canvasWidth;
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, destHeight);

      position += sliceHeight;
      heightLeft -= sliceHeight;
      pageNum++;
    }

    // 6. Filename creation: Invoice_[invoiceNumber]_[buyerName]_[date].pdf
    const invoiceNumber = invoiceData?.meta?.invoiceNumber || 'draft';
    const buyerName = invoiceData?.buyer?.businessName || 'client';
    const date = invoiceData?.meta?.invoiceDate || 'date';

    const rawFilename = `Invoice_${invoiceNumber}_${buyerName}_${date}.pdf`;
    
    // Sanitize filename: replace spaces with underscores, strip special chars
    const filename = rawFilename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-.]/g, '');

    // 7. Download PDF
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    // Make sure we restore styles in case of error
    element.style.width = originalWidth;
    element.style.boxShadow = originalBoxShadow;
    element.style.borderRadius = originalBorderRadius;
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Trigger print view on the browser.
 */
export async function printInvoice() {
  if (typeof window === 'undefined') return;

  document.body.classList.add('printing');
  window.print();
  
  setTimeout(() => {
    document.body.classList.remove('printing');
  }, 1000);
}
